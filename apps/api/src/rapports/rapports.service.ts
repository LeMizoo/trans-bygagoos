import { Injectable } from '@nestjs/common';

@Injectable()
export class RapportsService {
  findAll() {
    return {
      caTotal: 1500000,
      commission: 300000,
      depensesChauffeurs: 200000,
      depensesGlobales: 350000,
      beneficeNet: 650000,
      margeNette: 43.3,
      mois: {
        ca: 450000,
        nbCourses: 120,
        commission: 90000,
        depensesChauffeurs: 60000,
        depensesGlobales: 80000,
        benefice: 220000,
        marge: 48.9,
      },
      graphData: [
        { mois: 'Jan 2026', ca: 120000, commission: 24000 },
        { mois: 'Fév 2026', ca: 135000, commission: 27000 },
        { mois: 'Mar 2026', ca: 150000, commission: 30000 },
        { mois: 'Avr 2026', ca: 140000, commission: 28000 },
        { mois: 'Mai 2026', ca: 160000, commission: 32000 },
        { mois: 'Juin 2026', ca: 175000, commission: 35000 },
        { mois: 'Juil 2026', ca: 190000, commission: 38000 },
        { mois: 'Aoû 2026', ca: 180000, commission: 36000 },
        { mois: 'Sep 2026', ca: 200000, commission: 40000 },
        { mois: 'Oct 2026', ca: 210000, commission: 42000 },
        { mois: 'Nov 2026', ca: 195000, commission: 39000 },
        { mois: 'Déc 2026', ca: 220000, commission: 44000 },
      ],
    };
  }
}
