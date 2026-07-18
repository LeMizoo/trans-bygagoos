import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Nettoyage
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

  console.log('✅ Données nettoyées');

  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // ========== 6 FLOTTES ==========
  const flottes = await Promise.all([
    prisma.flotte.create({ data: { nom: 'Speed Delivery', code: 'SPEED', adresse: 'Antananarivo Centre', telephone: '+261 20 22 123 45', email: 'contact@speed.mg', statut: 'ACTIF' } }),
    prisma.flotte.create({ data: { nom: 'Express Mada', code: 'EXPRESS', adresse: 'Toamasina Port', telephone: '+261 20 53 678 90', email: 'contact@express-mada.mg', statut: 'ACTIF' } }),
    prisma.flotte.create({ data: { nom: 'Taxi Be', code: 'TAXIBE', adresse: 'Antsirabe Centre', telephone: '+261 20 44 111 00', email: 'contact@taxibe.mg', statut: 'ACTIF' } }),
    prisma.flotte.create({ data: { nom: 'Moto Service Plus', code: 'MSP', adresse: 'Mahajanga Bord Mer', telephone: '+261 20 62 222 00', email: 'info@msp.mg', statut: 'ACTIF' } }),
    prisma.flotte.create({ data: { nom: 'Kely Transport', code: 'KELY', adresse: 'Fianarantsoa Haute Ville', telephone: '+261 20 75 333 00', email: 'kely@transport.mg', statut: 'INACTIF' } }),
    prisma.flotte.create({ data: { nom: 'Allo Moto', code: 'ALLO', adresse: 'Toliara Centre', telephone: '+261 20 94 444 00', email: 'allo@moto.mg', statut: 'ACTIF' } }),
  ]);

  // ========== 6 COOPS ==========
  const coops = await Promise.all([
    prisma.cooperative.create({ data: { nom: 'Coop Mada Livraison', code: 'COOP-MADA', adresse: 'Antsirabe, Madagascar', telephone: '+261 20 44 111 22', email: 'contact@coopmada.mg', statut: 'ACTIF' } }),
    prisma.cooperative.create({ data: { nom: 'Coop Rapide', code: 'COOP-RAPIDE', adresse: 'Mahajanga, Madagascar', telephone: '+261 20 62 333 44', email: 'contact@cooprapide.mg', statut: 'ACTIF' } }),
    prisma.cooperative.create({ data: { nom: 'Livraison Express Coop', code: 'LEC', adresse: 'Antananarivo Ivato', telephone: '+261 20 22 555 00', email: 'lec@coop.mg', statut: 'ACTIF' } }),
    prisma.cooperative.create({ data: { nom: 'Coop Tana Distribution', code: 'CTD', adresse: 'Antananarivo Analakely', telephone: '+261 20 22 666 00', email: 'ctd@distrib.mg', statut: 'ACTIF' } }),
    prisma.cooperative.create({ data: { nom: 'Service Plus Coop', code: 'SPC', adresse: 'Toamasina Centre', telephone: '+261 20 53 777 00', email: 'spc@service.mg', statut: 'INACTIF' } }),
    prisma.cooperative.create({ data: { nom: 'Coop Sud Livraison', code: 'CSL', adresse: 'Toliara Port', telephone: '+261 20 94 888 00', email: 'csl@sud.mg', statut: 'ACTIF' } }),
  ]);

  console.log('✅ 6 Flottes + 6 Coops créées');

  // ========== SUPER ADMINS ==========
  await prisma.user.create({ data: { email: 'admin@bygagoos.com', password: hashedPassword, nom: 'Admin', prenom: 'Principal', role: 'SUPER_ADMIN' } });
  await prisma.user.create({ data: { email: 'finances@bygagoos.com', password: hashedPassword, nom: 'Finance', prenom: 'Manager', role: 'SUPER_ADMIN' } });
  await prisma.user.create({ data: { email: 'logistique@bygagoos.com', password: hashedPassword, nom: 'Logistique', prenom: 'Manager', role: 'SUPER_ADMIN' } });
  await prisma.user.create({ data: { email: 'support@bygagoos.com', password: hashedPassword, nom: 'Support', prenom: 'Technique', role: 'SUPPORT' } });

  // ========== GERANTS FLOTTE (1 par flotte) ==========
  const gerantsFlotte = [
    { email: 'abela@me.eu', nom: 'Abela', prenom: 'Manager', flotteId: flottes[0].id },
    { email: 'rabe@email.com', nom: 'Rabe', prenom: 'Manager', flotteId: flottes[1].id },
    { email: 'diego@speed.mg', nom: 'Diego', prenom: 'Gérant', flotteId: flottes[2].id },
    { email: 'lova@msp.mg', nom: 'Lova', prenom: 'Gérant', flotteId: flottes[3].id },
    { email: 'soa@kely.mg', nom: 'Soa', prenom: 'Gérante', flotteId: flottes[4].id },
    { email: 'tiana@allo.mg', nom: 'Tiana', prenom: 'Gérant', flotteId: flottes[5].id },
  ];
  for (const g of gerantsFlotte) {
    await prisma.user.create({ data: { ...g, password: hashedPassword, role: 'GERANT_FLOTTE' } });
  }

  // ========== GERANTS COOP (1 par coop) ==========
  const gerantsCoop = [
    { email: 'rakoto@email.com', nom: 'Rakoto', prenom: 'Gérant', cooperativeId: coops[0].id },
    { email: 'rafilipo@moi.eu', nom: 'Rafilipo', prenom: 'Gérant', cooperativeId: coops[1].id },
    { email: 'noro@lec.mg', nom: 'Noro', prenom: 'Gérante', cooperativeId: coops[2].id },
    { email: 'fidy@ctd.mg', nom: 'Fidy', prenom: 'Gérant', cooperativeId: coops[3].id },
    { email: 'haja@spc.mg', nom: 'Haja', prenom: 'Gérant', cooperativeId: coops[4].id },
    { email: 'lala@csl.mg', nom: 'Lala', prenom: 'Gérant', cooperativeId: coops[5].id },
  ];
  for (const g of gerantsCoop) {
    await prisma.user.create({ data: { ...g, password: hashedPassword, role: 'GERANT_COOP' } });
  }

  // ========== CHAUFFEURS (2 par flotte = 12) ==========
  const chauffeursData = [
    { nom: 'Rakoto', prenom: 'Jean', codeAcces: 'BYG-CH001', pin: '1234', flotteId: flottes[0].id },
    { nom: 'Rabe', prenom: 'Pierre', codeAcces: 'BYG-CH002', pin: '5678', flotteId: flottes[0].id },
    { nom: 'Randria', prenom: 'Michel', codeAcces: 'BYG-CH003', pin: '9012', flotteId: flottes[1].id },
    { nom: 'Andria', prenom: 'David', codeAcces: 'BYG-CH004', pin: '3456', flotteId: flottes[1].id },
    { nom: 'Rasoa', prenom: 'Kevin', codeAcces: 'BYG-CH005', pin: '7890', flotteId: flottes[2].id },
    { nom: 'Rakoto', prenom: 'Freddy', codeAcces: 'BYG-CH006', pin: '1111', flotteId: flottes[2].id },
    { nom: 'Rabe', prenom: 'Nirina', codeAcces: 'BYG-CH007', pin: '2222', flotteId: flottes[3].id },
    { nom: 'Razafy', prenom: 'Tony', codeAcces: 'BYG-CH008', pin: '3333', flotteId: flottes[3].id },
    { nom: 'Randria', prenom: 'Hery', codeAcces: 'BYG-CH009', pin: '4444', flotteId: flottes[4].id },
    { nom: 'Rakoto', prenom: 'Tovo', codeAcces: 'BYG-CH010', pin: '5555', flotteId: flottes[4].id },
    { nom: 'Rabe', prenom: 'Faly', codeAcces: 'BYG-CH011', pin: '6666', flotteId: flottes[5].id },
    { nom: 'Andria', prenom: 'Mamy', codeAcces: 'BYG-CH012', pin: '7777', flotteId: flottes[5].id },
  ];
  for (const c of chauffeursData) {
    await prisma.user.create({ data: { ...c, email: `${c.prenom.toLowerCase()}.${c.nom.toLowerCase()}@email.com`, password: hashedPassword, role: 'CHAUFFEUR' } });
  }

  // ========== LIVREURS (2 par coop = 12) ==========
  const livreursData = [
    { nom: 'Rafilipo', prenom: 'Marc', codeAcces: 'BYG-LV001', pin: '4321', cooperativeId: coops[0].id },
    { nom: 'Rasoanaivo', prenom: 'Luc', codeAcces: 'BYG-LV002', pin: '8765', cooperativeId: coops[0].id },
    { nom: 'Randriamora', prenom: 'Serge', codeAcces: 'BYG-LV003', pin: '2109', cooperativeId: coops[1].id },
    { nom: 'Rakotomalala', prenom: 'Paul', codeAcces: 'BYG-LV004', pin: '6543', cooperativeId: coops[1].id },
    { nom: 'Razafimandimby', prenom: 'Eric', codeAcces: 'BYG-LV005', pin: '9999', cooperativeId: coops[2].id },
    { nom: 'Andrianarivo', prenom: 'Annie', codeAcces: 'BYG-LV006', pin: '8888', cooperativeId: coops[2].id },
    { nom: 'Rabemananjara', prenom: 'Hanta', codeAcces: 'BYG-LV007', pin: '7777', cooperativeId: coops[3].id },
    { nom: 'Rakotonirina', prenom: 'Dina', codeAcces: 'BYG-LV008', pin: '6666', cooperativeId: coops[3].id },
    { nom: 'Randrianasolo', prenom: 'Zo', codeAcces: 'BYG-LV009', pin: '5555', cooperativeId: coops[4].id },
    { nom: 'Razafintsalama', prenom: 'Irina', codeAcces: 'BYG-LV010', pin: '4444', cooperativeId: coops[4].id },
    { nom: 'Andriamahefa', prenom: 'Njaka', codeAcces: 'BYG-LV011', pin: '3333', cooperativeId: coops[5].id },
    { nom: 'Rakotoarisoa', prenom: 'Lanto', codeAcces: 'BYG-LV012', pin: '2222', cooperativeId: coops[5].id },
  ];
  for (const l of livreursData) {
    await prisma.user.create({ data: { ...l, email: `${l.prenom.toLowerCase()}.${l.nom.toLowerCase()}@email.com`, password: hashedPassword, role: 'LIVREUR' } });
  }

  console.log('✅ 40 utilisateurs créés');

  // ========== MOTOS (2 par flotte = 12) ==========
  const motosData = [
    { immatriculation: '1234 TAB', marque: 'Yamaha', modele: 'XSR155', annee: 2023, flotteId: flottes[0].id },
    { immatriculation: '5678 TAB', marque: 'Honda', modele: 'CBF190', annee: 2024, flotteId: flottes[0].id },
    { immatriculation: '9012 TAB', marque: 'Bajaj', modele: 'Boxer', annee: 2023, flotteId: flottes[1].id },
    { immatriculation: '3456 TAA', marque: 'Suzuki', modele: 'GSX150', annee: 2024, flotteId: flottes[1].id },
    { immatriculation: '7890 TAC', marque: 'TVS', modele: 'Apache', annee: 2023, flotteId: flottes[2].id },
    { immatriculation: '2345 TAD', marque: 'KTM', modele: 'Duke200', annee: 2024, flotteId: flottes[2].id },
    { immatriculation: '6789 TAE', marque: 'Yamaha', modele: 'MT15', annee: 2023, flotteId: flottes[3].id },
    { immatriculation: '1122 TAF', marque: 'Honda', modele: 'CB150R', annee: 2024, flotteId: flottes[3].id },
    { immatriculation: '3344 TAG', marque: 'Bajaj', modele: 'Pulsar', annee: 2023, flotteId: flottes[4].id },
    { immatriculation: '5566 TAH', marque: 'Suzuki', modele: 'Intruder', annee: 2024, flotteId: flottes[4].id },
    { immatriculation: '7788 TAI', marque: 'TVS', modele: 'Raider', annee: 2023, flotteId: flottes[5].id },
    { immatriculation: '9900 TAJ', marque: 'KTM', modele: 'RC200', annee: 2024, flotteId: flottes[5].id },
  ];
  for (const m of motosData) {
    await prisma.moto.create({ data: m });
  }

  // ========== VEHICULES (2 par coop = 12) ==========
  const vehiculesData = [
    { immatriculation: '1111 TBA', marque: 'Toyota', modele: 'Hiace', annee: 2022, cooperativeId: coops[0].id },
    { immatriculation: '2222 TBB', marque: 'Renault', modele: 'Kangoo', annee: 2023, cooperativeId: coops[0].id },
    { immatriculation: '3333 TBC', marque: 'Peugeot', modele: 'Partner', annee: 2022, cooperativeId: coops[1].id },
    { immatriculation: '4444 TBD', marque: 'Citroen', modele: 'Berlingo', annee: 2023, cooperativeId: coops[1].id },
    { immatriculation: '5555 TBE', marque: 'Toyota', modele: 'Dyna', annee: 2021, cooperativeId: coops[2].id },
    { immatriculation: '6666 TBF', marque: 'Nissan', modele: 'NV350', annee: 2023, cooperativeId: coops[2].id },
    { immatriculation: '7777 TBG', marque: 'Mitsubishi', modele: 'L300', annee: 2022, cooperativeId: coops[3].id },
    { immatriculation: '8888 TBH', marque: 'Hyundai', modele: 'H1', annee: 2023, cooperativeId: coops[3].id },
    { immatriculation: '9999 TBI', marque: 'Kia', modele: 'Bongo', annee: 2022, cooperativeId: coops[4].id },
    { immatriculation: '1212 TBJ', marque: 'Suzuki', modele: 'Carry', annee: 2023, cooperativeId: coops[4].id },
    { immatriculation: '3434 TBK', marque: 'Mazda', modele: 'Bongo', annee: 2022, cooperativeId: coops[5].id },
    { immatriculation: '5656 TBL', marque: 'Ford', modele: 'Transit', annee: 2023, cooperativeId: coops[5].id },
  ];
  for (const v of vehiculesData) {
    await prisma.vehicule.create({ data: v });
  }

  console.log('✅ 12 Motos + 12 Véhicules créés');

  // ========== PARAMETRES ==========
  await prisma.parametre.createMany({
    data: [
      { cle: 'VERSION', valeur: '2.0.0' },
      { cle: 'DEVISE', valeur: 'MGA' },
      { cle: 'TAUX_COMMISSION', valeur: '10' },
    ]
  });

  console.log('🎉 Seed terminé !');
  console.log(`📊 Total: 6 Flottes | 6 Coops | 40 Utilisateurs | 12 Motos | 12 Véhicules`);
  console.log(`🔑 Mot de passe unique: Test123!`);
}

main()
  .catch((e) => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// Le seed est déjà complet, on va juste insérer des abonnements après
