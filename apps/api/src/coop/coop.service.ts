import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoopService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cooperative.findMany({
      include: {
        users: true,
        vehicules: true
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
