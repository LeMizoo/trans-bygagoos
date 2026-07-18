import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.commande.findMany({
      include: { 
        user: true,
        vehicule: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.commande.findUnique({
      where: { id },
      include: { 
        user: true,
        vehicule: true 
      }
    });
  }

  async create(data: any) {
    return this.prisma.commande.create({ 
      data,
      include: { 
        user: true,
        vehicule: true 
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.commande.update({ 
      where: { id }, 
      data,
      include: { 
        user: true,
        vehicule: true 
      }
    });
  }

  async assignToLivreur(id: string, userId: string) {
    return this.prisma.commande.update({
      where: { id },
      data: { userId },
      include: { 
        user: true
      }
    });
  }

  async findByLivreur(userId: string) {
    return this.prisma.commande.findMany({
      where: { userId },
      include: { 
        user: true,
        vehicule: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
