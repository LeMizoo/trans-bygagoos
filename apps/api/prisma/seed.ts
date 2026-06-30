import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed multi-flottes...\n');

  // Nettoyer les données existantes (ordre inverse des dépendances)
  await prisma.message.deleteMany();
  await prisma.contrat.deleteMany();
  await prisma.assistance.deleteMany();
  await prisma.versement.deleteMany();
  await prisma.pointage.deleteMany();
  await prisma.course.deleteMany();
  await prisma.depense.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moto.deleteMany();
  await prisma.chauffeur.deleteMany();
  await prisma.proprietaire.deleteMany();
  await prisma.user.deleteMany();
  await prisma.flotte.deleteMany();
  await prisma.parametre.deleteMany();
  console.log('🧹 Données nettoyées');

  // ═══════════════════════════════════════════
  // Flotte 1 : Rakoto Trans
  // ═══════════════════════════════════════════
  const flotte1 = await prisma.flotte.create({
    data: {
      nom: 'Rakoto Trans',
      description: 'Flotte de transport Rakoto',
      telephone: '0341234567',
      email: 'rakoto@email.com',
      adresse: 'Antananarivo 101',
    },
  });
  console.log('🏢 Flotte créée :', flotte1.nom);

  const user1 = await prisma.user.create({
    data: {
      email: 'rakoto@email.com',
      nom: 'Rakoto Jean',
      password: await bcrypt.hash('Proprio123!', 10),
      role: 'PROPRIETAIRE',
      flotteId: flotte1.id,
    },
  });
  console.log('👤 Propriétaire :', user1.email);

  await prisma.moto.createMany({
    data: [
      { immatriculation: '1234TBA', marque: 'Yamaha', modele: 'YBR 125', flotteId: flotte1.id, kmActuel: 15000 },
      { immatriculation: '5678TBB', marque: 'Honda', modele: 'CG 125', flotteId: flotte1.id, kmActuel: 22000 },
    ],
  });
  console.log('🏍️ 2 motos');

  await prisma.chauffeur.createMany({
    data: [
      { codeAcces: 'CH001', nom: 'Andry', telephone: '0320000001', pin: '1234', flotteId: flotte1.id, solde: 50000 },
      { codeAcces: 'CH002', nom: 'Hery', telephone: '0320000002', pin: '1234', flotteId: flotte1.id, solde: 50000 },
    ],
  });
  console.log('👨‍🔧 2 chauffeurs');

  await prisma.user.create({
    data: {
      email: 'finance-rakoto@email.com',
      nom: 'Lova Finance',
      password: await bcrypt.hash('Finance123!', 10),
      role: 'FINANCE',
      flotteId: flotte1.id,
    },
  });
  console.log('👤 Staff Finance');

  // ═══════════════════════════════════════════
  // Flotte 2 : Rabe Moto
  // ═══════════════════════════════════════════
  const flotte2 = await prisma.flotte.create({
    data: {
      nom: 'Rabe Moto',
      description: 'Location et transport Rabe',
      telephone: '0339876543',
      email: 'rabe@email.com',
      adresse: 'Toamasina 501',
    },
  });
  console.log('🏢 Flotte créée :', flotte2.nom);

  await prisma.user.create({
    data: {
      email: 'rabe@email.com',
      nom: 'Rabe Marie',
      password: await bcrypt.hash('Proprio123!', 10),
      role: 'PROPRIETAIRE',
      flotteId: flotte2.id,
    },
  });
  console.log('👤 Propriétaire : rabe@email.com');

  await prisma.moto.createMany({
    data: [
      { immatriculation: '9012TBC', marque: 'Suzuki', modele: 'GN 125', flotteId: flotte2.id, kmActuel: 8000 },
    ],
  });
  console.log('🏍️ 1 moto');

  await prisma.chauffeur.createMany({
    data: [
      { codeAcces: 'CH003', nom: 'Fidy', telephone: '0320000003', pin: '1234', flotteId: flotte2.id, solde: 50000 },
    ],
  });
  console.log('👨‍🔧 1 chauffeur');

  // ═══════════════════════════════════════════
  // SUPER_ADMIN (hors flotte)
  // ═══════════════════════════════════════════
  await prisma.user.create({
    data: {
      email: 'tovoniaina.rahendrison@gmail.com',
      nom: 'Tovoniaina RAHENDRISON',
      password: await bcrypt.hash('ByGagoos@2024!', 10),
      role: 'SUPER_ADMIN',
    },
  });
  console.log('👑 SUPER_ADMIN');

  await prisma.user.create({
    data: {
      email: 'admin@bygagoos.com',
      nom: 'Admin ByGagoos',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });
  console.log('🔑 ADMIN');

  // Paramètres
  const parametres = [
    { nom: 'prix_base', valeur: '2000', type: 'number' },
    { nom: 'prix_km', valeur: '500', type: 'number' },
    { nom: 'tarif_location_journalier', valeur: '15000', type: 'number' },
    { nom: 'commission', valeur: '20', type: 'number' },
  ];
  for (const p of parametres) {
    await prisma.parametre.create({ data: p });
  }
  console.log('⚙️ 4 paramètres');

  console.log('\n🎉 Seed terminé ! 2 Flottes, 3 Motos, 3 Chauffeurs, 5 Users');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
