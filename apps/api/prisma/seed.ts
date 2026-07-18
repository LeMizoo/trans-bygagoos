import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Nettoyage des données existantes
  await prisma.log.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.assistance.deleteMany();
  await prisma.pointage.deleteMany();
  await prisma.depense.deleteMany();
  await prisma.versement.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.course.deleteMany();
  await prisma.vehicule.deleteMany();
  await prisma.moto.deleteMany();
  await prisma.abonnement.deleteMany();
  await prisma.parametre.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.flotte.deleteMany();

  console.log('✅ Données existantes nettoyées');

  // 1. Création des flottes
  const flotteSpeed = await prisma.flotte.create({
    data: {
      nom: 'Speed Delivery',
      code: 'SPEED',
      adresse: 'Antananarivo, Madagascar',
      telephone: '+261 20 22 123 45',
      email: 'contact@speed.mg',
    }
  });

  const flotteExpress = await prisma.flotte.create({
    data: {
      nom: 'Express Mada',
      code: 'EXPRESS',
      adresse: 'Toamasina, Madagascar',
      telephone: '+261 20 53 678 90',
      email: 'contact@express-mada.mg',
    }
  });

  console.log('✅ Flottes créées');

  // 2. Création des coopératives
  const coopMada = await prisma.cooperative.create({
    data: {
      nom: 'Coop Mada Livraison',
      code: 'COOP-MADA',
      adresse: 'Antsirabe, Madagascar',
      telephone: '+261 20 44 111 22',
      email: 'contact@coopmada.mg',
    }
  });

  const coopRapide = await prisma.cooperative.create({
    data: {
      nom: 'Coop Rapide',
      code: 'COOP-RAPIDE',
      adresse: 'Mahajanga, Madagascar',
      telephone: '+261 20 62 333 44',
      email: 'contact@cooprapide.mg',
    }
  });

  console.log('✅ Coopératives créées');

  // 3. Création des utilisateurs avec leurs codes d'accès
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@bygagoos.com',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Principal',
      role: 'SUPER_ADMIN',
    }
  });

  // Admins web
  await prisma.user.create({
    data: {
      email: 'finances@bygagoos.com',
      password: hashedPassword,
      nom: 'Finance',
      prenom: 'Manager',
      role: 'SUPER_ADMIN',
    }
  });

  await prisma.user.create({
    data: {
      email: 'logistique@bygagoos.com',
      password: hashedPassword,
      nom: 'Logistique',
      prenom: 'Manager',
      role: 'SUPER_ADMIN',
    }
  });

  await prisma.user.create({
    data: {
      email: 'support@bygagoos.com',
      password: hashedPassword,
      nom: 'Support',
      prenom: 'Technique',
      role: 'SUPPORT',
    }
  });

  // Gérants Flotte
  await prisma.user.create({
    data: {
      email: 'abela@me.eu',
      password: hashedPassword,
      nom: 'Abela',
      prenom: 'Manager',
      role: 'GERANT_FLOTTE',
      flotteId: flotteSpeed.id,
    }
  });

  await prisma.user.create({
    data: {
      email: 'rabe@email.com',
      password: hashedPassword,
      nom: 'Rabe',
      prenom: 'Manager',
      role: 'GERANT_FLOTTE',
      flotteId: flotteExpress.id,
    }
  });

  await prisma.user.create({
    data: {
      email: 'diego@speed.mg',
      password: hashedPassword,
      nom: 'Diego',
      prenom: 'Gérant',
      role: 'GERANT_FLOTTE',
      flotteId: flotteSpeed.id,
    }
  });

  // Gérants Coop
  await prisma.user.create({
    data: {
      email: 'rakoto@email.com',
      password: hashedPassword,
      nom: 'Rakoto',
      prenom: 'Gérant',
      role: 'GERANT_COOP',
      cooperativeId: coopMada.id,
    }
  });

  await prisma.user.create({
    data: {
      email: 'rafilipo@moi.eu',
      password: hashedPassword,
      nom: 'Rafilipo',
      prenom: 'Gérant',
      role: 'GERANT_COOP',
      cooperativeId: coopRapide.id,
    }
  });

  // Chauffeurs avec codes d'accès
  const chauffeurs = [
    {
      nom: 'Rakoto',
      prenom: 'Jean',
      email: 'jean.rakoto@email.com',
      codeAcces: 'BYG-CH001',
      pin: '1234',
      role: 'CHAUFFEUR',
      flotteId: flotteSpeed.id,
    },
    {
      nom: 'Rabe',
      prenom: 'Pierre',
      email: 'pierre.rabe@email.com',
      codeAcces: 'BYG-CH002',
      pin: '5678',
      role: 'CHAUFFEUR',
      flotteId: flotteSpeed.id,
    },
    {
      nom: 'Randria',
      prenom: 'Michel',
      email: 'michel.randria@email.com',
      codeAcces: 'BYG-CH003',
      pin: '9012',
      role: 'CHAUFFEUR',
      flotteId: flotteExpress.id,
    },
    {
      nom: 'Andria',
      prenom: 'David',
      email: 'david.andria@email.com',
      codeAcces: 'BYG-CH004',
      pin: '3456',
      role: 'CHAUFFEUR',
      flotteId: flotteExpress.id,
    },
  ];

  for (const chauffeur of chauffeurs) {
    await prisma.user.create({
      data: {
        ...chauffeur,
        password: hashedPassword,
      }
    });
  }

  // Livreurs avec codes d'accès
  const livreurs = [
    {
      nom: 'Rafilipo',
      prenom: 'Marc',
      email: 'marc.rafilipo@email.com',
      codeAcces: 'BYG-LV001',
      pin: '4321',
      role: 'LIVREUR',
      cooperativeId: coopMada.id,
    },
    {
      nom: 'Rasoanaivo',
      prenom: 'Luc',
      email: 'luc.rasoanaivo@email.com',
      codeAcces: 'BYG-LV002',
      pin: '8765',
      role: 'LIVREUR',
      cooperativeId: coopMada.id,
    },
    {
      nom: 'Randriamora',
      prenom: 'Serge',
      email: 'serge.randriamora@email.com',
      codeAcces: 'BYG-LV003',
      pin: '2109',
      role: 'LIVREUR',
      cooperativeId: coopRapide.id,
    },
    {
      nom: 'Rakotomalala',
      prenom: 'Paul',
      email: 'paul.rakotomalala@email.com',
      codeAcces: 'BYG-LV004',
      pin: '6543',
      role: 'LIVREUR',
      cooperativeId: coopRapide.id,
    },
  ];

  for (const livreur of livreurs) {
    await prisma.user.create({
      data: {
        ...livreur,
        password: hashedPassword,
      }
    });
  }

  console.log('✅ Utilisateurs créés avec codes d\'accès');

  // 4. Création des motos
  await prisma.moto.createMany({
    data: [
      { immatriculation: '1234 TAB', marque: 'Yamaha', modele: 'XSR155', annee: 2023, flotteId: flotteSpeed.id },
      { immatriculation: '5678 TAB', marque: 'Honda', modele: 'CBF190', annee: 2024, flotteId: flotteSpeed.id },
      { immatriculation: '9012 TAB', marque: 'Bajaj', modele: 'Boxer', annee: 2023, flotteId: flotteExpress.id },
    ]
  });

  // 5. Création des véhicules
  await prisma.vehicule.createMany({
    data: [
      { immatriculation: '3456 TAC', marque: 'Toyota', modele: 'Hiace', annee: 2022, cooperativeId: coopMada.id },
      { immatriculation: '7890 TAD', marque: 'Renault', modele: 'Kangoo', annee: 2023, cooperativeId: coopRapide.id },
    ]
  });

  // 6. Paramètres globaux
  await prisma.parametre.createMany({
    data: [
      { cle: 'VERSION', valeur: '2.0.0' },
      { cle: 'DEVISE', valeur: 'MGA' },
      { cle: 'TAUX_COMMISSION', valeur: '10' },
    ]
  });

  console.log('✅ Motos, véhicules et paramètres créés');
  console.log('🎉 Seed terminé avec succès !');
  
  console.log('\n📋 Récapitulatif des codes d\'accès :');
  console.log('Chauffeurs :');
  chauffeurs.forEach(c => console.log(`  ${c.nom} ${c.prenom}: ${c.codeAcces} / PIN: ${c.pin}`));
  console.log('Livreurs :');
  livreurs.forEach(l => console.log(`  ${l.nom} ${l.prenom}: ${l.codeAcces} / PIN: ${l.pin}`));
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
