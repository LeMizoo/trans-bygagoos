import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginByCodeDto } from './dto/login-by-code.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        cooperative: { select: { id: true, nom: true, code: true } },
        flotte: { select: { id: true, nom: true, code: true } },
      }
    });

    if (!user) throw new UnauthorizedException('Email ou mot de passe invalide');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Email ou mot de passe invalide');

    const payload = {
      sub: user.id, email: user.email, role: user.role,
      cooperativeId: user.cooperativeId, flotteId: user.flotteId,
    };

    // 🔥 Format attendu par le front-end
    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        cooperative: user.cooperative,
        flotte: user.flotte,
      },
      token: this.jwtService.sign(payload),
    };
  }

  async loginByCode(loginByCodeDto: LoginByCodeDto) {
    const { codeAcces, pin } = loginByCodeDto;
    console.log(`🔑 Connexion avec code: ${codeAcces}`);

    const user = await this.prisma.user.findUnique({
      where: { codeAcces },
      include: {
        cooperative: { select: { id: true, nom: true, code: true } },
        flotte: { select: { id: true, nom: true, code: true } },
      }
    });

    if (!user || user.pin !== pin) throw new UnauthorizedException('Code d\'accès ou PIN invalide');
    if (user.statut !== 'ACTIF') throw new ForbiddenException('Compte désactivé');
    if (!['CHAUFFEUR', 'LIVREUR'].includes(user.role)) throw new UnauthorizedException('Non autorisé');

    const payload = {
      sub: user.id, email: user.email, nom: user.nom, prenom: user.prenom,
      role: user.role, cooperativeId: user.cooperativeId, flotteId: user.flotteId,
      codeAcces: user.codeAcces,
    };

    await this.prisma.log.create({
      data: { action: 'LOGIN_MOBILE', details: `Connexion mobile - ${user.role} ${user.nom} ${user.prenom}`, userId: user.id }
    });

    console.log(`✅ Connexion réussie pour ${user.nom} ${user.prenom}`);
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, nom: user.nom, prenom: user.prenom, email: user.email,
        role: user.role, codeAcces: user.codeAcces,
        cooperative: user.cooperative ? { id: user.cooperative.id, nom: user.cooperative.nom, code: user.cooperative.code } : null,
        flotte: user.flotte ? { id: user.flotte.id, nom: user.flotte.nom, code: user.flotte.code } : null,
      }
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({ data: { ...data, password: hashedPassword } });
    if (['CHAUFFEUR', 'LIVREUR'].includes(user.role)) await this.generateAccessCodes(user.id);
    return user;
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { cooperative: true, flotte: true }
    });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    return {
      id: user.id, email: user.email, nom: user.nom, prenom: user.prenom,
      role: user.role, cooperative: user.cooperative, flotte: user.flotte,
    };
  }

  async generateAccessCodes(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    const codeAcces = await this.generateUniqueCodeAcces(user.role);
    const pin = this.generateRandomPin();
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { codeAcces, pin } });
    console.log(`🎫 Codes pour ${user.nom} ${user.prenom}: ${codeAcces} / PIN: ${pin}`);
    return { userId: updated.id, codeAcces: updated.codeAcces, pin: updated.pin };
  }

  private async generateUniqueCodeAcces(role: string): Promise<string> {
    const prefix = 'BYG';
    const roleCode = role === 'CHAUFFEUR' ? 'CH' : 'LV';
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const code = `${prefix}-${roleCode}${randomNum}`;
    const exists = await this.prisma.user.findUnique({ where: { codeAcces: code } });
    if (exists) return this.generateUniqueCodeAcces(role);
    return code;
  }

  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
