import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // Créer le SUPER_ADMIN - Tovoniaina RAHENDRISON
  const superAdmin = await prisma.user.upsert({
    where: { email: 'tovoniaina.rahendrison@gmail.com' },
    update: {
      nom: 'RAHENDRISON',
      password: await bcrypt.hash('ByGagoos@2024!', 10),
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'tovoniaina.rahendrison@gmail.com',
      nom: 'RAHENDRISON',
      password: await bcrypt.hash('ByGagoos@2024!', 10),
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ SUPER_ADMIN créé :', superAdmin.email);

  // Créer l'ADMIN de backup
  const adminBackup = await prisma.user.upsert({
    where: { email: 'admin@bygagoos.com' },
    update: {
      nom: 'Backup',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bygagoos.com',
      nom: 'Backup',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin backup créé :', adminBackup.email);

  // Créer quelques chauffeurs de test
  const chauffeurs = [
    { codeAcces: 'CH001', nom: 'Jean Rakoto', pin: '1234' },
    { codeAcces: 'CH002', nom: 'Pierre Rabe', pin: '1234' },
    { codeAcces: 'CH003', nom: 'Michel Andry', pin: '1234' },
  ];

  for (const ch of chauffeurs) {
    const chauffeur = await prisma.chauffeur.upsert({
      where: { codeAcces: ch.codeAcces },
      update: {
        nom: ch.nom,
        pin: ch.pin,
      },
      create: {
        codeAcces: ch.codeAcces,
        nom: ch.nom,
        pin: ch.pin,
        statut: 'ACTIF',
        solde: 50000,
      },
    });
    console.log(`✅ Chauffeur créé : ${chauffeur.codeAcces} - ${chauffeur.nom}`);
  }

  console.log('\n🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
