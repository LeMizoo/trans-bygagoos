import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProprietaireFilter {
  constructor(private prisma: PrismaService) {}

  async getProprietaireId(userEmail: string): Promise<string | null> {
    const proprio = await this.prisma.proprietaire.findFirst({
      where: { email: userEmail },
      select: { id: true },
    });
    return proprio?.id || null;
  }

  async getMotosIds(proprietaireId: string): Promise<string[]> {
    const motos = await this.prisma.moto.findMany({
      where: { proprietaireId },
      select: { id: true },
    });
    return motos.map(m => m.id);
  }
}
