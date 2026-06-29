import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nom: true, email: true, role: true, actif: true, createdAt: true },
    });
  }

  async create(data: { nom: string; email: string; password: string; role: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { nom: data.nom, email: data.email, password: hash, role: data.role },
      select: { id: true, nom: true, email: true, role: true, actif: true },
    });
  }

  async update(id: string, data: { nom?: string; email?: string; password?: string; role?: string; actif?: boolean }) {
    const updateData: any = { ...data };
    delete updateData.password; // on traite le password séparément
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nom: true, email: true, role: true, actif: true },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
