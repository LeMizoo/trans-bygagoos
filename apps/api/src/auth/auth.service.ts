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
      include: { flotte: { select: { id: true, nom: true, logo: true } } },
    });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');
    
    const payload = { sub: user.id, email: user.email, role: user.role, flotteId: user.flotteId };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id, nom: user.nom, email: user.email, role: user.role,
        flotteId: user.flotteId, flotte: user.flotte,
      },
    };
  }

  async loginChauffeur(dto: LoginChauffeurDto) {
    // Chercher par codeAcces et flotteId si fourni
    const where: any = { codeAcces: dto.codeAcces };
    if (dto.flotteId) where.flotteId = dto.flotteId;
    
    const chauffeurs = await this.prisma.chauffeur.findMany({
      where,
      include: { moto: true, flotte: { select: { id: true, nom: true } } },
      take: 1,
    });
    
    const chauffeur = chauffeurs[0];
    if (!chauffeur) throw new UnauthorizedException('Code ou PIN incorrect');
    
    const valid = await bcrypt.compare(dto.pin, chauffeur.pin);
    if (!valid) throw new UnauthorizedException('Code ou PIN incorrect');
    
    const payload = { sub: chauffeur.id, role: 'CHAUFFEUR', flotteId: chauffeur.flotteId };
    return {
      accessToken: this.jwtService.sign(payload),
      chauffeur: {
        id: chauffeur.id, nom: chauffeur.nom, codeAcces: chauffeur.codeAcces,
        statut: chauffeur.statut, solde: chauffeur.solde, moto: chauffeur.moto,
        flotteId: chauffeur.flotteId, flotte: chauffeur.flotte,
      },
    };
  }

  async loginByCode(code: string, flotteId?: string) {
    const where: any = { codeAcces: code };
    if (flotteId) where.flotteId = flotteId;
    
    const chauffeurs = await this.prisma.chauffeur.findMany({
      where,
      include: { moto: true },
      take: 1,
    });
    
    const chauffeur = chauffeurs[0];
    if (!chauffeur) throw new UnauthorizedException('Code invalide');
    
    const payload = { sub: chauffeur.id, role: 'CHAUFFEUR', flotteId: chauffeur.flotteId };
    return {
      accessToken: this.jwtService.sign(payload),
      chauffeur: {
        id: chauffeur.id, nom: chauffeur.nom, codeAcces: chauffeur.codeAcces,
        statut: chauffeur.statut, solde: chauffeur.solde, moto: chauffeur.moto,
        flotteId: chauffeur.flotteId,
      },
    };
  }
}
