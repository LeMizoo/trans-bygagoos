import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // 1. SUPER_ADMIN principal - Tovoniaina RAHENDRISON
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
  console.log('✅ SUPER_ADMIN :', superAdmin.email);

  // 2. Admin backup
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bygagoos.com' },
    update: {
      nom: 'Admin',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
    create: {
      email: 'admin@bygagoos.com',
      nom: 'Admin',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin backup :', admin.email);

  // 3. Chauffeurs de test
  const chauffeurs = [
    { codeAcces: 'CH001', nom: 'Jean Rakoto', telephone: '0320000001', pin: '1234' },
    { codeAcces: 'CH002', nom: 'Pierre Rabe', telephone: '0320000002', pin: '1234' },
    { codeAcces: 'CH003', nom: 'Michel Andry', telephone: '0320000003', pin: '1234' },
  ];

  for (const ch of chauffeurs) {
    const chauffeur = await prisma.chauffeur.upsert({
      where: { codeAcces: ch.codeAcces },
      update: {
        nom: ch.nom,
        telephone: ch.telephone,
        pin: ch.pin,
      },
      create: {
        codeAcces: ch.codeAcces,
        nom: ch.nom,
        telephone: ch.telephone,
        pin: ch.pin,
        statut: 'ACTIF',
        solde: 50000,
      },
    });
    console.log(`✅ Chauffeur : ${chauffeur.codeAcces} - ${chauffeur.nom}`);
  }

  // 4. Paramètres par défaut
  const parametres = [
    { nom: 'prix_base', valeur: '2000', type: 'number', description: 'Prix de base d\'une course' },
    { nom: 'prix_km', valeur: '500', type: 'number', description: 'Prix par kilomètre' },
    { nom: 'tarif_location_journalier', valeur: '15000', type: 'number', description: 'Tarif location journalière moto' },
  ];

  for (const p of parametres) {
    await prisma.parametre.upsert({
      where: { nom: p.nom },
      update: { valeur: p.valeur },
      create: p,
    });
    console.log(`✅ Paramètre : ${p.nom} = ${p.valeur}`);
  }

  console.log('\n🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
