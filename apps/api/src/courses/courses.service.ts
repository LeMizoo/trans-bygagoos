import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.prisma.course.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, codeAcces: true } },
        moto: true,
      },
      orderBy: { dateCourse: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nom: true, prenom: true, codeAcces: true } },
        moto: true,
      },
    });
    if (!course) throw new NotFoundException(`Course #${id} non trouvée`);
    return course;
  }

  async create(data: { depart: string; arrivee: string; prix: number; userId: string; motoId?: string }) {
    if (!data.userId) throw new Error('userId est requis');

    const course = await this.prisma.course.create({
      data: {
        depart: data.depart,
        arrivee: data.arrivee,
        prix: data.prix,
        dateCourse: new Date(),
        user: { connect: { id: data.userId } },
        ...(data.motoId ? { moto: { connect: { id: data.motoId } } } : {}),
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true, codeAcces: true } },
        moto: true,
      },
    });

    // 🆕 Logger l'action
    await this.prisma.log.create({
      data: {
        action: 'COURSE_CREATED',
        details: `Course ${course.depart} → ${course.arrivee} (${course.prix} Ar) par ${course.user.nom} ${course.user.prenom}`,
        userId: data.userId,
      }
    });

    console.log(`✅ Course créée : ${course.depart} → ${course.arrivee} (${course.prix} Ar)`);
    return course;
  }

  async getTodayCourses(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.prisma.course.findMany({
      where: { userId, dateCourse: { gte: today, lt: tomorrow } },
      include: { moto: true },
      orderBy: { dateCourse: 'desc' },
    });
  }

  async getStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate && endDate) where.dateCourse = { gte: startDate, lte: endDate };
    const courses = await this.prisma.course.findMany({
      where,
      select: { prix: true, statut: true },
    });
    return {
      totalCourses: courses.length,
      totalMontant: courses.reduce((s, c) => s + c.prix, 0),
      coursesTerminees: courses.filter(c => c.statut === 'TERMINE').length,
      coursesEnCours: courses.filter(c => c.statut === 'EN_COURS').length,
      coursesAnnulees: courses.filter(c => c.statut === 'ANNULE').length,
    };
  }
}
