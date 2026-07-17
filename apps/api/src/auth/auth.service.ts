import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async loginByCode(codeAcces: string, pin: string, coopId?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        codeAcces: codeAcces.toUpperCase(),
        role: 'LIVREUR',
        actif: true,
        ...(coopId ? { coopId } : {}),
      },
    });
    if (!user || user.pin !== pin) throw new UnauthorizedException('Code ou PIN incorrect');
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { accessToken: token, chauffeur: userWithoutPassword };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    const { password: _, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: userWithoutPassword, token };
  }
}
