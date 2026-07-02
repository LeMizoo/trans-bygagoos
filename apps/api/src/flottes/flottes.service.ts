import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FlottesService {
  constructor(private prisma: PrismaService) {}

  async register(data: {
    nomFlotte: string;
    description?: string;
    telephone?: string;
    adresse?: string;
    nom: string;
    email: string;
    password: string;
    logo?: string; // base64
  }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('Cet email est déjà utilisé');

    const existingFlotte = await this.prisma.flotte.findFirst({ where: { nom: data.nomFlotte } });
    if (existingFlotte) throw new ConflictException('Ce nom de flotte existe déjà');

    // Gérer le logo
    let logoUrl: string | null = null;
    if (data.logo && data.logo.startsWith('data:image')) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      
      const ext = data.logo.split(';')[0].split('/')[1] || 'png';
      const filename = `flotte-${Date.now()}.${ext}`;
      const base64Data = data.logo.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(path.join(uploadsDir, filename), base64Data, 'base64');
      logoUrl = `/uploads/logos/${filename}`;
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      const flotte = await prisma.flotte.create({
        data: {
          nom: data.nomFlotte, slug: data.nomFlotte.toLowerCase().replace(/ /g,'-'),
          description: data.description || null,
          telephone: data.telephone || null,
          email: data.email,
          adresse: data.adresse || null,
          logo: logoUrl,
        },
      });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          nom: data.nom,
          password: hashedPassword,
          role: 'PROPRIETAIRE',
          flotteId: flotte.id,
        },
      });

      return { flotte, user };
    });

    return {
      success: true,
      message: 'Flotte créée avec succès !',
      flotte: { id: result.flotte.id, nom: result.flotte.nom, logo: result.flotte.logo },
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    };
  }
}
