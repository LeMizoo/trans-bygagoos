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

  async loginByCode(loginByCodeDto: LoginByCodeDto) {
    const { codeAcces, pin } = loginByCodeDto;

    console.log(`🔑 Tentative de connexion avec code: ${codeAcces}`);

    // 1. Vérifier si l'utilisateur existe avec ce codeAcces
    const user = await this.prisma.user.findUnique({
      where: { codeAcces },
      include: {
        cooperative: {
          select: { id: true, nom: true, code: true }
        },
        flotte: {
          select: { id: true, nom: true, code: true }
        },
      }
    });

    if (!user) {
      console.log('❌ Code d\'accès invalide');
      throw new UnauthorizedException('Code d\'accès ou PIN invalide');
    }

    // 2. Vérifier le PIN
    if (user.pin !== pin) {
      console.log('❌ PIN incorrect');
      throw new UnauthorizedException('Code d\'accès ou PIN invalide');
    }

    // 3. Vérifier si l'utilisateur est actif
    if (user.statut !== 'ACTIF') {
      console.log('❌ Compte désactivé');
      throw new ForbiddenException('Votre compte est désactivé. Contactez votre gestionnaire.');
    }

    // 4. Vérifier le rôle (chauffeur ou livreur uniquement)
    if (!['CHAUFFEUR', 'LIVREUR'].includes(user.role)) {
      console.log('❌ Rôle non autorisé');
      throw new UnauthorizedException('Ce compte n\'est pas autorisé à utiliser cette application');
    }

    // 5. Générer le JWT
    const payload = {
      sub: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      cooperativeId: user.cooperativeId,
      flotteId: user.flotteId,
      codeAcces: user.codeAcces,
    };

    const accessToken = this.jwtService.sign(payload);

    console.log(`✅ Connexion réussie pour ${user.nom} ${user.prenom} (${user.role})`);

    // 6. Créer un log de connexion
    await this.prisma.log.create({
      data: {
        action: 'LOGIN_MOBILE',
        details: `Connexion mobile - ${user.role} ${user.nom} ${user.prenom}`,
        userId: user.id,
      }
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        codeAcces: user.codeAcces,
        cooperative: user.cooperative ? {
          id: user.cooperative.id,
          nom: user.cooperative.nom,
          code: user.cooperative.code,
        } : null,
        flotte: user.flotte ? {
          id: user.flotte.id,
          nom: user.flotte.nom,
          code: user.flotte.code,
        } : null,
      }
    };
  }

  async generateAccessCodes(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const codeAcces = await this.generateUniqueCodeAcces(user.role);
    const pin = this.generateRandomPin();

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { codeAcces, pin }
    });

    console.log(`🎫 Codes générés pour ${user.nom} ${user.prenom}:`);
    console.log(`   Code d'accès: ${codeAcces}`);
    console.log(`   PIN: ${pin}`);

    return {
      userId: updatedUser.id,
      codeAcces: updatedUser.codeAcces,
      pin: updatedUser.pin,
      message: 'Codes d\'accès générés avec succès. Communiquez-les au chauffeur/livreur de manière sécurisée.'
    };
  }

  async bulkGenerateCodes(userIds: string[]) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.generateAccessCodes(userId);
        results.push({ ...result, success: true });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  private async generateUniqueCodeAcces(role: string): Promise<string> {
    const prefix = 'BYG';
    const roleCode = role === 'CHAUFFEUR' ? 'CH' : 'LV';
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    const code = `${prefix}-${roleCode}${randomNum}`;
    
    // Vérifier l'unicité
    const exists = await this.prisma.user.findUnique({
      where: { codeAcces: code }
    });
    
    if (exists) {
      // Réessayer avec un autre numéro
      return this.generateUniqueCodeAcces(role);
    }
    
    return code;
  }

  private generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // PIN 4 chiffres
  }

  // Méthodes existantes...
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      }
    });

    // Générer automatiquement les codes d'accès pour les chauffeurs et livreurs
    if (['CHAUFFEUR', 'LIVREUR'].includes(user.role)) {
      await this.generateAccessCodes(user.id);
    }

    return user;
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        cooperative: true,
        flotte: true,
      }
    });
  }
}
