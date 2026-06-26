import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed complet...\n');

  // Admin
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@bygagoos.com' },
    update: {},
    create: { nom: 'Admin', email: 'admin@bygagoos.com', password: adminPassword, role: 'ADMIN' },
  });

  // Paramètres
  const params = [
    { nom: 'prix_base', valeur: '2000' },
    { nom: 'prix_km', valeur: '500' },
    { nom: 'tarif_location_journalier', valeur: '15000' },
    { nom: 'theme', valeur: 'sombre' },
    { nom: 'couleur_principale', valeur: '#DAA520' },
  ];
  for (const p of params) {
    await prisma.parametre.upsert({ where: { nom: p.nom }, update: {}, create: p });
  }

  // Propriétaires
  const proprio1 = await prisma.proprietaire.create({
    data: { nom: 'Rakoto Jean', telephone: '0341234567', email: 'rakoto@email.com', cin: '117072001609', adresse: 'Antananarivo', nif: '4003718108', numStat: '454511112019007297' },
  });
  const proprio2 = await prisma.proprietaire.create({
    data: { nom: 'Rabe Marie', telephone: '0339876543', cin: '118083002710', adresse: 'Antsirabe' },
  });

  // Motos avec propriétaires
  const moto1 = await prisma.moto.create({
    data: {
      immatriculation: '1234TBA', marque: 'Yamaha', modele: 'YBR 125', cylindree: '125cc',
      numMoteur: '5TY-228628', numChassis: '454511112019007297', couleur: 'Rouge',
      kmActuel: 15000, prixAchat: 2350000, dateAchat: new Date('2024-01-15'),
      kmProchaineVidange: 18000, proprietaireId: proprio1.id,
      proprietaireNom: proprio1.nom, proprietaireTelephone: proprio1.telephone, proprietaireCin: proprio1.cin,
      finAssurance: new Date('2026-12-31'), finVignette: new Date('2026-06-30'),
    },
  });
  const moto2 = await prisma.moto.create({
    data: {
      immatriculation: '5678TBB', marque: 'Honda', modele: 'CG 125',
      kmActuel: 22000, kmProchaineVidange: 25000, proprietaireId: proprio1.id,
      proprietaireNom: proprio1.nom, proprietaireTelephone: proprio1.telephone,
      finAssurance: new Date('2025-12-31'),
    },
  });
  const moto3 = await prisma.moto.create({
    data: {
      immatriculation: '9012TBC', marque: 'Bajaj', modele: 'Boxer 150',
      kmActuel: 8000, kmProchaineVidange: 11000, proprietaireId: proprio2.id,
      proprietaireNom: proprio2.nom, proprietaireTelephone: proprio2.telephone,
    },
  });

  // Chauffeurs avec infos complètes
  const pin = await bcrypt.hash('1234', 10);
  const ch1 = await prisma.chauffeur.create({
    data: {
      nom: 'Andry', telephone: '0321111111', codeAcces: 'CH001', pin, statut: 'HORS_SERVICE',
      solde: 50000, cin: '117072001610', cinDateDelivrance: new Date('2022-03-15'), cinLieuDelivrance: 'Antananarivo',
      permisNumero: '123456789', permisCategorie: 'A', permisDateDelivrance: new Date('2022-03-15'),
      permisDateExpiration: new Date('2027-03-15'), permisLieuDelivrance: 'Antananarivo', permisStatut: 'valide',
      adresse: 'Lot IPA 165 Anosimasina', dateEmbauche: new Date('2024-01-01'),
      motoId: moto1.id, heurePrisePoste: '07:00', heureFinService: '19:00',
    },
  });
  const ch2 = await prisma.chauffeur.create({
    data: {
      nom: 'Tiana', telephone: '0332222222', codeAcces: 'CH002', pin, statut: 'HORS_SERVICE',
      solde: 35000, motoId: moto2.id, heurePrisePoste: '07:00', heureFinService: '19:00',
    },
  });
  const ch3 = await prisma.chauffeur.create({
    data: {
      nom: 'Fidy', telephone: '0343333333', codeAcces: 'CH003', pin, statut: 'HORS_SERVICE',
      solde: 15000, motoId: moto3.id, heurePrisePoste: '07:00', heureFinService: '19:00',
    },
  });

  // Mettre les motos en statut utilisée
  await prisma.moto.updateMany({ where: { id: { in: [moto1.id, moto2.id, moto3.id] } }, data: { statut: 'utilisee' } });

  // Quelques courses
  await prisma.course.createMany({
    data: [
      { chauffeurId: ch1.id, motoId: moto1.id, type: 'NORMALE', distance: 5, prix: 4500, commission: 900, gainNet: 3600, createdAt: new Date() },
      { chauffeurId: ch1.id, motoId: moto1.id, type: 'ADY_VAROTRA', distance: 0, prix: 10000, commission: 2000, gainNet: 8000, createdAt: new Date() },
      { chauffeurId: ch2.id, motoId: moto2.id, type: 'NORMALE', distance: 3, prix: 3500, commission: 700, gainNet: 2800, createdAt: new Date() },
    ],
  });

  // Notifications test
  await prisma.notification.createMany({
    data: [
      { titre: 'Nouveau versement', message: 'CH001 a demandé un versement de 30 000 Ar', type: 'VERSEMENT' },
      { titre: 'Assistance urgente', message: 'CH003 signale une panne moteur', type: 'ASSISTANCE' },
    ],
  });

  console.log('✅ Seed complet terminé !');
  console.log('   👤 1 Admin | 👥 2 Propriétaires | 🏍️ 3 Motos | 🧑 3 Chauffeurs | 🚖 3 Courses');
}

main().catch(console.error).finally(() => prisma.$disconnect());
