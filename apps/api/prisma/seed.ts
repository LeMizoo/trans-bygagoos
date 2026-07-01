import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed intelligent...\n');

  // SUPER_ADMIN
  await prisma.user.upsert({
    where: { email: 'tovoniaina.rahendrison@gmail.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'tovoniaina.rahendrison@gmail.com',
      nom: 'Tovoniaina RAHENDRISON',
      password: await bcrypt.hash('ByGagoos@2024!', 10),
      role: 'SUPER_ADMIN',
    },
  });
  console.log('👑 SUPER_ADMIN');

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

  // Paramètres d'abonnement
  const abonnementParams = [
    { nom: 'abonnement_gratuit_max_motos', valeur: '1', type: 'number', description: 'Nombre max de motos (gratuit)' },
    { nom: 'abonnement_2_5_prix_mensuel', valeur: '50000', type: 'number', description: 'Prix mensuel 2-5 motos (Ar)' },
    { nom: 'abonnement_6_10_prix_mensuel', valeur: '90000', type: 'number', description: 'Prix mensuel 6-10 motos (Ar)' },
    { nom: 'abonnement_11_plus_prix_mensuel', valeur: '150000', type: 'number', description: 'Prix mensuel 11+ motos (Ar)' },
    { nom: 'reduction_annuelle_pourcent', valeur: '7', type: 'number', description: 'Réduction abonnement annuel (%)' },
  ];
  
  for (const p of abonnementParams) {
    await prisma.parametre.upsert({ where: { nom: p.nom }, update: { valeur: p.valeur }, create: p });
  }
  console.log('⚙️ Paramètres abonnement');

  console.log('\n🎉 Seed terminé !');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
