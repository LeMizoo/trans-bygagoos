import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...\n');

  // Admin
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@bygagoos.com' },
    update: {},
    create: {
      nom: 'Admin',
      email: 'admin@bygagoos.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin créé');

  // Propriétaires
  const proprio1 = await prisma.proprietaire.create({
    data: {
      nom: 'Rakoto Jean',
      telephone: '0341234567',
      email: 'rakoto@email.com',
    },
  });

  const proprio2 = await prisma.proprietaire.create({
    data: {
      nom: 'Rabe Marie',
      telephone: '0339876543',
    },
  });
  console.log('✅ 2 Propriétaires créés');

  // Motos
  const moto1 = await prisma.moto.create({
    data: {
      immatriculation: '1234TBA',
      marque: 'Yamaha',
      modele: 'YBR 125',
      kmActuel: 15000,
      proprietaireId: proprio1.id,
    },
  });

  const moto2 = await prisma.moto.create({
    data: {
      immatriculation: '5678TBB',
      marque: 'Honda',
      modele: 'CG 125',
      kmActuel: 22000,
      proprietaireId: proprio1.id,
    },
  });

  const moto3 = await prisma.moto.create({
    data: {
      immatriculation: '9012TBC',
      marque: 'Bajaj',
      modele: 'Boxer 150',
      kmActuel: 8000,
      proprietaireId: proprio2.id,
    },
  });
  console.log('✅ 3 Motos créées');

  // Chauffeurs
  const pin = await bcrypt.hash('1234', 10);

  const ch1 = await prisma.chauffeur.create({
    data: {
      nom: 'Andry',
      telephone: '0321111111',
      codeAcces: 'CH001',
      pin,
      statut: 'EN_SERVICE',
      solde: 50000,
      motoId: moto1.id,
    },
  });

  const ch2 = await prisma.chauffeur.create({
    data: {
      nom: 'Tiana',
      telephone: '0332222222',
      codeAcces: 'CH002',
      pin,
      statut: 'EN_PAUSE',
      solde: 35000,
      motoId: moto2.id,
    },
  });

  const ch3 = await prisma.chauffeur.create({
    data: {
      nom: 'Fidy',
      telephone: '0343333333',
      codeAcces: 'CH003',
      pin,
      statut: 'HORS_SERVICE',
      solde: 15000,
      motoId: moto3.id,
    },
  });
  console.log('✅ 3 Chauffeurs créés (PIN: 1234)');

  // Courses
  await prisma.course.createMany({
    data: [
      { chauffeurId: ch1.id, motoId: moto1.id, type: 'NORMALE', distance: 5, prix: 4500, commission: 900, gainNet: 3600 },
      { chauffeurId: ch1.id, motoId: moto1.id, type: 'ADY_VAROTRA', distance: 0, prix: 10000, commission: 2000, gainNet: 8000 },
      { chauffeurId: ch2.id, motoId: moto2.id, type: 'NORMALE', distance: 3, prix: 3500, commission: 700, gainNet: 2800 },
      { chauffeurId: ch3.id, motoId: moto3.id, type: 'LOCATION_JOURNALIERE', distance: 0, prix: 15000, commission: 0, gainNet: 15000 },
    ],
  });
  console.log('✅ 4 Courses créées');

  // Pointages
  await prisma.pointage.createMany({
    data: [
      { chauffeurId: ch1.id, type: 'ARRIVEE' },
      { chauffeurId: ch2.id, type: 'ARRIVEE' },
      { chauffeurId: ch2.id, type: 'PAUSE' },
    ],
  });
  console.log('✅ 3 Pointages créés');

  // Versements
  await prisma.versement.createMany({
    data: [
      { chauffeurId: ch1.id, montantDu: 50000, montantVerse: 30000, statut: 'VALIDE' },
      { chauffeurId: ch2.id, montantDu: 35000, montantVerse: 20000, statut: 'EN_ATTENTE' },
      { chauffeurId: ch3.id, montantDu: 15000, montantVerse: 0, statut: 'EN_ATTENTE' },
    ],
  });
  console.log('✅ 3 Versements créés');

  // Assistance
  await prisma.assistance.create({
    data: {
      chauffeurId: ch3.id,
      type: 'PANNE',
      urgence: 'URGENTE',
      description: 'Pneu crevé, besoin assistance',
      statut: 'OUVERT',
    },
  });
  console.log('✅ 1 Demande assistance créée');

  // Contrat
  await prisma.contrat.create({
    data: {
      chauffeurId: ch1.id,
      motoId: moto1.id,
      type: 'MENSUEL',
      montantLocation: 150000,
      dateDebut: new Date(),
      statut: 'ACTIF',
    },
  });
  console.log('✅ 1 Contrat créé');

  console.log('\n🎉 Seed complet terminé !');
  console.log('📋 admin@bygagoos.com / Admin123!');
  console.log('📋 CH001, CH002, CH003 / PIN: 1234');
}

main()
  .catch((e) => console.error('❌', e.message))
  .finally(() => prisma.$disconnect());
