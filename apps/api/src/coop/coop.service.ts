import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoopService {
  constructor(private prisma: PrismaService) {}

  // Flottes
  async findAllFlottes() {
    return this.prisma.flotte.findMany({
      include: {
        users: true,
        motos: true,
        _count: {
          select: { users: true, motos: true }
        }
      }
    });
  }

  async findOneFlotte(id: string) {
    return this.prisma.flotte.findUnique({
      where: { id },
      include: {
        users: true,
        motos: true,
      }
    });
  }

  // Coops
  async findAll() {
    return this.prisma.cooperative.findMany({
      include: {
        users: true,
        vehicules: true,
        _count: {
          select: { users: true, vehicules: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.cooperative.findUnique({
      where: { id },
      include: {
        users: true,
        vehicules: true
      }
    });
  }

  async findByAdmin(adminId: string) {
    return this.prisma.cooperative.findFirst({
      where: {
        users: {
          some: {
            id: adminId
          }
        }
      },
      include: {
        users: true,
        vehicules: true
      }
    });
  }
}
