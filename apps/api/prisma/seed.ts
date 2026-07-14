import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Nettoyer dans l'ordre (FK constraints)
  await prisma.location.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.vehicule.deleteMany();
  await prisma.coop.deleteMany();
  await prisma.user.deleteMany();

  // ==================== USERS ====================
  const users = [
    // 🔷 Super Admin & Admins (admin-web : Trans ByGagoos)
    { email: 'tovoniaina.rahendrison@gmail.com', password: 'ByGagoos@2024!', nom: 'Tovoniaina', role: 'ADMIN_COOP' },
    { email: 'admin@bygagoos.com', password: 'Admin123!', nom: 'Admin ByGagoos', role: 'ADMIN_COOP' },
    { email: 'finances@bygagoos.com', password: 'Finance123!', nom: 'Finances', role: 'ADMIN_COOP' },
    { email: 'logistique@bygagoos.com', password: 'Logistique123!', nom: 'Logistique', role: 'ADMIN_COOP' },
    { email: 'support@bygagoos.com', password: 'Support123!', nom: 'Support', role: 'ADMIN_COOP' },
    { email: 'miantsatianarahendrison@gmail.com', password: 'Mi2026!', nom: 'Miantsa', role: 'ADMIN_COOP' },

    // 🏍️ Gérants Flotte (flotte-web : Ma Flotte ByGagoos)
    { email: 'abela@me.eu', password: 'Proprio123!', nom: 'Abela', role: 'ADMIN_COOP' },
    { email: 'diego@speed.mg', password: 'Proprio123!', nom: 'Diego', role: 'ADMIN_COOP' },
    { email: 'rabe@email.com', password: 'Proprio123!', nom: 'Rabe', role: 'ADMIN_COOP' },
    { email: 'soa@flotte.mg', password: 'Flotte123!', nom: 'Soa Randria', role: 'ADMIN_COOP' },
    { email: 'lova@flotte.mg', password: 'Flotte123!', nom: 'Lova Andry', role: 'ADMIN_COOP' },

    // 📦 Gérants Coop (coop-web : Coop Express ByGagoos)
    { email: 'admin@coopexpress.com', password: 'Admin123!', nom: 'Admin Coop Express', role: 'ADMIN_COOP' },
    { email: 'rafilipo@moi.eu', password: 'VJFR1T89', nom: 'Rafilipo', role: 'ADMIN_COOP' },
    { email: 'rakoto@email.com', password: 'Proprio123!', nom: 'Rakoto', role: 'ADMIN_COOP' },
    { email: 'mirana@coop.mg', password: 'Coop123!', nom: 'Mirana Tiana', role: 'ADMIN_COOP' },
    { email: 'haja@coop.mg', password: 'Coop123!', nom: 'Haja Nivo', role: 'ADMIN_COOP' },

    // 🏍️ Chauffeurs Taxi-Moto (flotte-web)
    { email: 'koto@flotte.mg', password: 'Chauff123!', nom: 'Koto Be', role: 'LIVREUR' },
    { email: 'doda@flotte.mg', password: 'Chauff123!', nom: 'Doda Tsiry', role: 'LIVREUR' },
    { email: 'lala@flotte.mg', password: 'Chauff123!', nom: 'Lala Nomena', role: 'LIVREUR' },
    { email: 'bema@flotte.mg', password: 'Chauff123!', nom: 'Bema Herizo', role: 'LIVREUR' },
    { email: 'fidy@flotte.mg', password: 'Chauff123!', nom: 'Fidy Andry', role: 'LIVREUR' },
    { email: 'tina@flotte.mg', password: 'Chauff123!', nom: 'Tina Voary', role: 'LIVREUR' },

    // 🚚 Livreurs Coop (coop-web / mobile-pwa)
    { email: 'jean@coopexpress.com', password: 'Livreur123!', nom: 'Jean Rakoto', role: 'LIVREUR' },
    { email: 'marie@coopexpress.com', password: 'Livreur123!', nom: 'Marie Rasoa', role: 'LIVREUR' },
    { email: 'pierre@coopexpress.com', password: 'Livreur123!', nom: 'Pierre Rajaona', role: 'LIVREUR' },
    { email: 'nivo@coop.mg', password: 'Livreur123!', nom: 'Nivo Hanta', role: 'LIVREUR' },
    { email: 'toky@coop.mg', password: 'Livreur123!', nom: 'Toky Miaro', role: 'LIVREUR' },
    { email: 'sitraka@coop.mg', password: 'Livreur123!', nom: 'Sitraka Nomen', role: 'LIVREUR' },
    { email: 'mendrika@coop.mg', password: 'Livreur123!', nom: 'Mendrika Avotra', role: 'LIVREUR' },
    { email: 'anjara@coop.mg', password: 'Livreur123!', nom: 'Anjara Finaritra', role: 'LIVREUR' },
  ];

  const createdUsers = [];
  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        nom: u.nom,
        role: u.role,
      },
    });
    createdUsers.push(user);
    console.log(`✓ ${u.email} (${u.role})`);
  }

  // ==================== COOPS ====================
  const superAdmin = createdUsers.find(u => u.email === 'tovoniaina.rahendrison@gmail.com')!;
  const gerantFlotte = createdUsers.find(u => u.email === 'abela@me.eu')!;
  const gerantCoop = createdUsers.find(u => u.email === 'admin@coopexpress.com')!;

  const coopTrans = await prisma.coop.create({
    data: { nom: 'Trans ByGagoos', description: 'Plateforme principale - Supervision', adresse: 'Antananarivo', telephone: '034 00 000 00', adminId: superAdmin.id },
  });
  const coopFlotte = await prisma.coop.create({
    data: { nom: 'Ma Flotte ByGagoos', description: 'Flotte de taxi-motos', adresse: 'Antananarivo', telephone: '034 11 111 11', adminId: gerantFlotte.id },
  });
  const coopLivraison = await prisma.coop.create({
    data: { nom: 'Coop Express ByGagoos', description: 'Coopérative de livraison', adresse: 'Antananarivo', telephone: '034 22 222 22', adminId: gerantCoop.id },
  });

  console.log('✓ 3 Coops créées');

  // ==================== ASSIGNATIONS ====================
  const assignments: Record<string, string> = {
    // Trans ByGagoos (admin-web)
    'tovoniaina.rahendrison@gmail.com': coopTrans.id,
    'admin@bygagoos.com': coopTrans.id,
    'finances@bygagoos.com': coopTrans.id,
    'logistique@bygagoos.com': coopTrans.id,
    'support@bygagoos.com': coopTrans.id,
    'miantsatianarahendrison@gmail.com': coopTrans.id,
    // Ma Flotte ByGagoos (flotte-web) - Gérants + Chauffeurs
    'abela@me.eu': coopFlotte.id,
    'diego@speed.mg': coopFlotte.id,
    'rabe@email.com': coopFlotte.id,
    'soa@flotte.mg': coopFlotte.id,
    'lova@flotte.mg': coopFlotte.id,
    'koto@flotte.mg': coopFlotte.id,
    'doda@flotte.mg': coopFlotte.id,
    'lala@flotte.mg': coopFlotte.id,
    'bema@flotte.mg': coopFlotte.id,
    'fidy@flotte.mg': coopFlotte.id,
    'tina@flotte.mg': coopFlotte.id,
    // Coop Express ByGagoos (coop-web) - Gérants + Livreurs
    'admin@coopexpress.com': coopLivraison.id,
    'rafilipo@moi.eu': coopLivraison.id,
    'rakoto@email.com': coopLivraison.id,
    'mirana@coop.mg': coopLivraison.id,
    'haja@coop.mg': coopLivraison.id,
    'jean@coopexpress.com': coopLivraison.id,
    'marie@coopexpress.com': coopLivraison.id,
    'pierre@coopexpress.com': coopLivraison.id,
    'nivo@coop.mg': coopLivraison.id,
    'toky@coop.mg': coopLivraison.id,
    'sitraka@coop.mg': coopLivraison.id,
    'mendrika@coop.mg': coopLivraison.id,
    'anjara@coop.mg': coopLivraison.id,
  };

  for (const user of createdUsers) {
    const coopId = assignments[user.email];
    if (coopId) {
      await prisma.user.update({ where: { id: user.id }, data: { coopId } });
    }
  }

  // ==================== VÉHICULES FLOTTE (Taxi-Moto) ====================
  const chauffeursFlotte = createdUsers.filter(u => assignments[u.email] === coopFlotte.id && u.role === 'LIVREUR');
  const motosFlotte = [
    { immatriculation: 'MOTO-001', modele: 'Yamaha Cygnus', capacite: 30 },
    { immatriculation: 'MOTO-002', modele: 'Honda Wave', capacite: 25 },
    { immatriculation: 'MOTO-003', modele: 'Suzuki Smash', capacite: 20 },
    { immatriculation: 'MOTO-004', modele: 'Yamaha Cygnus', capacite: 30 },
    { immatriculation: 'MOTO-005', modele: 'Honda Wave', capacite: 25 },
    { immatriculation: 'MOTO-006', modele: 'Suzuki Smash', capacite: 20 },
  ];
  for (let i = 0; i < motosFlotte.length; i++) {
    await prisma.vehicule.create({
      data: { ...motosFlotte[i], coopId: coopFlotte.id, type: 'MOTO', livreurId: chauffeursFlotte[i]?.id || null },
    });
  }
  console.log(`✓ ${motosFlotte.length} motos (Flotte)`);

  // ==================== VÉHICULES COOP (Livraison) ====================
  const livreursCoop = createdUsers.filter(u => assignments[u.email] === coopLivraison.id && u.role === 'LIVREUR');
  const vehiculesCoop = [
    { type: 'MOTO', immatriculation: 'COOP-MOTO-01', modele: 'Yamaha Cygnus', capacite: 30 },
    { type: 'MOTO', immatriculation: 'COOP-MOTO-02', modele: 'Honda Wave', capacite: 25 },
    { type: 'MOTO', immatriculation: 'COOP-MOTO-03', modele: 'Suzuki Smash', capacite: 20 },
    { type: 'MOTO', immatriculation: 'COOP-MOTO-04', modele: 'Yamaha Cygnus', capacite: 30 },
    { type: 'VOITURE', immatriculation: 'COOP-VOIT-01', modele: 'Toyota Corolla', capacite: 200 },
    { type: 'CAMIONNETTE', immatriculation: 'COOP-CAM-01', modele: 'Suzuki Carry', capacite: 500 },
  ];
  for (let i = 0; i < vehiculesCoop.length; i++) {
    await prisma.vehicule.create({
      data: { ...vehiculesCoop[i], coopId: coopLivraison.id, livreurId: livreursCoop[i]?.id || null },
    });
  }
  console.log(`✓ ${vehiculesCoop.length} véhicules (Coop)`);

  // ==================== COMMANDES DE TEST ====================
  await prisma.commande.createMany({
    data: [
      { coopId: coopLivraison.id, clientNom: 'Client 1', clientTel: '034 99 999 01', depart: '67Ha', arrivee: 'Analakely', description: 'Plats malgaches x3', type: 'NOURRITURE', prix: 5000, livreurId: livreursCoop[0]?.id, statut: 'EN_COURS' },
      { coopId: coopLivraison.id, clientNom: 'Client 2', clientTel: '034 99 999 02', depart: 'Analakely', arrivee: 'Mahazo', description: 'Documents administratifs', type: 'COLIS', prix: 8000, livreurId: livreursCoop[1]?.id, statut: 'ASSIGNEE' },
      { coopId: coopLivraison.id, clientNom: 'Client 3', clientTel: '034 99 999 03', depart: 'Ambodifasina', arrivee: '67Ha', description: 'Réfrigérateur 200L', type: 'ELECTROMENAGER', prix: 15000, statut: 'EN_ATTENTE' },
      { coopId: coopLivraison.id, clientNom: 'Client 4', clientTel: '034 99 999 04', depart: 'Andraharo', arrivee: 'Ankorondrano', description: 'Pizza + boissons', type: 'NOURRITURE', prix: 12000, statut: 'EN_ATTENTE' },
      { coopId: coopLivraison.id, clientNom: 'Client 5', clientTel: '034 99 999 05', depart: 'Mahazo', arrivee: '67Ha', description: 'Colis documents', type: 'COLIS', prix: 6000, statut: 'LIVREE' },
    ],
  });
  console.log('✓ 5 commandes de test');

  console.log('');
  console.log('═══════════════════════════════════');
  console.log('✅ Seed terminé !');
  console.log('');
  console.log('📊 Coops :');
  console.log('   🏢 Trans ByGagoos      - 6 admins');
  console.log('   🏍️ Ma Flotte ByGagoos   - 5 gérants + 6 chauffeurs + 6 motos');
  console.log('   📦 Coop Express ByGagoos - 5 gérants + 8 livreurs + 6 véhicules');
  console.log('   👥 Total : 30 utilisateurs');
  console.log('═══════════════════════════════════');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
