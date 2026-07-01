import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed intelligent - mise à jour sans suppression...\n');

  // SUPER_ADMIN - upsert (ne supprime pas)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'tovoniaina.rahendrison@gmail.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'tovoniaina.rahendrison@gmail.com',
      nom: 'Tovoniaina RAHENDRISON',
      password: await bcrypt.hash('ByGagoos@2024!', 10),
      role: 'SUPER_ADMIN',
    },
  });
  console.log('👑 SUPER_ADMIN :', superAdmin.email);

  // Admin backup
  await prisma.user.upsert({
    where: { email: 'admin@bygagoos.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@bygagoos.com',
      nom: 'Admin ByGagoos',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'ADMIN',
    },
  });
  console.log('🔑 ADMIN : admin@bygagoos.com');

  // Ajouter des chauffeurs aux flottes existantes (si pas déjà)
  const flottes = await prisma.flotte.findMany({ include: { chauffeurs: true } });
  
  for (const flotte of flottes) {
    const nbChauffeurs = flotte.chauffeurs.length;
    if (nbChauffeurs === 0) {
      // Créer 2 chauffeurs par flotte
      await prisma.chauffeur.createMany({
        data: [
          {
            codeAcces: 'CH001',
            nom: `Chauffeur 1 - ${flotte.nom}`,
            telephone: `032${flotte.id.substring(0, 7)}1`.replace(/[^0-9]/g, '').substring(0, 10),
            pin: '1234',
            flotteId: flotte.id,
            solde: 50000,
          },
          {
            codeAcces: 'CH002',
            nom: `Chauffeur 2 - ${flotte.nom}`,
            telephone: `032${flotte.id.substring(0, 7)}2`.replace(/[^0-9]/g, '').substring(0, 10),
            pin: '1234',
            flotteId: flotte.id,
            solde: 50000,
          },
        ],
      });
      console.log(`👨‍🔧 2 chauffeurs ajoutés à ${flotte.nom} (CH001, CH002)`);
    } else {
      console.log(`⏭️ ${flotte.nom} a déjà ${nbChauffeurs} chauffeur(s)`);
    }
  }

  // Paramètres par défaut (upsert)
  const parametres = [
    { nom: 'prix_base', valeur: '2000', type: 'number' },
    { nom: 'prix_km', valeur: '500', type: 'number' },
    { nom: 'tarif_location_journalier', valeur: '15000', type: 'number' },
    { nom: 'commission', valeur: '20', type: 'number' },
  ];
  for (const p of parametres) {
    await prisma.parametre.upsert({
      where: { nom: p.nom },
      update: { valeur: p.valeur },
      create: p,
    });
  }
  console.log('⚙️ Paramètres à jour');

  console.log('\n🎉 Seed terminé - Aucune flotte supprimée !');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
