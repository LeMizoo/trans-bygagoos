import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginChauffeurDto } from './dto/login-chauffeur.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    };
  }

  async loginChauffeur(dto: LoginChauffeurDto) {
    const chauffeur = await this.prisma.chauffeur.findUnique({
      where: { codeAcces: dto.codeAcces },
      include: { moto: true },
    });
    if (!chauffeur) throw new UnauthorizedException('Code ou PIN incorrect');
    const valid = await bcrypt.compare(dto.pin, chauffeur.pin);
    if (!valid) throw new UnauthorizedException('Code ou PIN incorrect');
    const payload = { sub: chauffeur.id, role: 'CHAUFFEUR' };
    return {
      accessToken: this.jwtService.sign(payload),
      chauffeur: {
        id: chauffeur.id,
        nom: chauffeur.nom,
        codeAcces: chauffeur.codeAcces,
        statut: chauffeur.statut,
        solde: chauffeur.solde,
        moto: chauffeur.moto,
      },
    };
  }

  async loginByCode(code: string) {
    const chauffeur = await this.prisma.chauffeur.findFirst({
      where: { codeAcces: code },
      include: { moto: true },
    });
    if (!chauffeur) throw new UnauthorizedException('Code invalide');
    const payload = { sub: chauffeur.id, role: 'CHAUFFEUR' };
    return {
      accessToken: this.jwtService.sign(payload),
      chauffeur: {
        id: chauffeur.id,
        nom: chauffeur.nom,
        codeAcces: chauffeur.codeAcces,
        statut: chauffeur.statut,
        solde: chauffeur.solde,
        moto: chauffeur.moto,
      },
    };
  }
}
