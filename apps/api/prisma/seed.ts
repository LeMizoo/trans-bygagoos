import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer
  await prisma.location.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.vehicule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coop.deleteMany();

  const password = await bcrypt.hash('Admin123!', 10);
  const livreurPassword = await bcrypt.hash('Livreur123!', 10);

  // Admin Coop
  const admin = await prisma.user.create({
    data: {
      email: 'admin@coopexpress.com',
      password,
      nom: 'Admin Coop',
      telephone: '034 00 000 01',
      role: 'ADMIN_COOP',
    },
  });

  // Coopérative
  const coop = await prisma.coop.create({
    data: {
      nom: 'COOP LIVRAISON EXPRESS',
      description: 'Coopérative de livraison rapide à Antananarivo',
      adresse: 'Analakely, Antananarivo',
      telephone: '034 00 000 00',
      adminId: admin.id,
    },
  });

  // Mettre à jour l'admin avec le coopId
  await prisma.user.update({
    where: { id: admin.id },
    data: { coopId: coop.id },
  });

  // Livreurs
  const livreurs = await Promise.all([
    prisma.user.create({
      data: {
        email: 'jean@coopexpress.com',
        password: livreurPassword,
        nom: 'Jean Rakoto',
        telephone: '034 12 345 67',
        role: 'LIVREUR',
        coopId: coop.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'marie@coopexpress.com',
        password: livreurPassword,
        nom: 'Marie Rasoa',
        telephone: '034 23 456 78',
        role: 'LIVREUR',
        coopId: coop.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'pierre@coopexpress.com',
        password: livreurPassword,
        nom: 'Pierre Rajaona',
        telephone: '034 34 567 89',
        role: 'LIVREUR',
        coopId: coop.id,
      },
    }),
  ]);

  // Véhicules
  const vehicules = await Promise.all([
    prisma.vehicule.create({
      data: {
        coopId: coop.id,
        type: 'MOTO',
        immatriculation: 'MOTO-001',
        modele: 'Yamaha Cygnus',
        capacite: 30,
        livreurId: livreurs[0].id,
      },
    }),
    prisma.vehicule.create({
      data: {
        coopId: coop.id,
        type: 'MOTO',
        immatriculation: 'MOTO-002',
        modele: 'Honda Wave',
        capacite: 25,
        livreurId: livreurs[1].id,
      },
    }),
    prisma.vehicule.create({
      data: {
        coopId: coop.id,
        type: 'CAMIONNETTE',
        immatriculation: 'CAM-001',
        modele: 'Suzuki Carry',
        capacite: 500,
        livreurId: livreurs[2].id,
      },
    }),
  ]);

  // Commandes de test
  await Promise.all([
    prisma.commande.create({
      data: {
        coopId: coop.id,
        clientNom: 'Client Test 1',
        clientTel: '034 99 999 01',
        clientAdresse: 'Andraharo',
        depart: '67Ha',
        arrivee: 'Analakely',
        description: 'Plats malgaches x 3',
        type: 'NOURRITURE',
        urgence: 'NORMAL',
        prix: 5000,
        livreurId: livreurs[0].id,
        vehiculeId: vehicules[0].id,
        statut: 'EN_COURS',
      },
    }),
    prisma.commande.create({
      data: {
        coopId: coop.id,
        clientNom: 'Client Test 2',
        clientTel: '034 99 999 02',
        depart: 'Analakely',
        arrivee: 'Mahazo',
        description: 'Documents administratifs',
        type: 'COLIS',
        urgence: 'URGENT',
        prix: 8000,
        livreurId: livreurs[1].id,
        vehiculeId: vehicules[1].id,
        statut: 'ASSIGNEE',
      },
    }),
    prisma.commande.create({
      data: {
        coopId: coop.id,
        clientNom: 'Client Test 3',
        clientTel: '034 99 999 03',
        depart: 'Ambodifasina',
        arrivee: '67Ha',
        description: 'Réfrigérateur 200L',
        type: 'ELECTROMENAGER',
        urgence: 'NORMAL',
        prix: 15000,
        statut: 'EN_ATTENTE',
      },
    }),
  ]);

  console.log('✅ Seed terminé !');
  console.log('📧 Admin : admin@coopexpress.com / Admin123!');
  console.log('📧 Livreur : jean@coopexpress.com / Livreur123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
