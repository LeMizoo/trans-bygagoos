import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // ═══════════════════════════════════════
  // 1. SUPER_ADMIN
  // ═══════════════════════════════════════
  const superAdmin = await prisma.user.upsert({
    where: { email: 'tovoniaina.rahendrison@gmail.com' },
    update: { nom: 'Tovoniaina RAHENDRISON', password: await bcrypt.hash('ByGagoos@2024!', 10), role: 'SUPER_ADMIN' },
    create: { email: 'tovoniaina.rahendrison@gmail.com', nom: 'Tovoniaina RAHENDRISON', password: await bcrypt.hash('ByGagoos@2024!', 10), role: 'SUPER_ADMIN' },
  });
  console.log('✅ SUPER_ADMIN :', superAdmin.email);

  // ═══════════════════════════════════════
  // 2. ADMINS
  // ═══════════════════════════════════════
  const admins = [
    { email: 'admin@bygagoos.com', nom: 'Admin Backup', password: 'Admin123!', role: 'ADMIN' },
    { email: 'finances@bygagoos.com', nom: 'Lova Finance', password: 'Finance123!', role: 'FINANCE' },
    { email: 'logistique@bygagoos.com', nom: 'Andry Logistique', password: 'Logistique123!', role: 'LOGISTIQUE' },
    { email: 'support@bygagoos.com', nom: 'Miora Support', password: 'Support123!', role: 'SUPPORT' },
  ];

  for (const a of admins) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: { nom: a.nom, password: await bcrypt.hash(a.password, 10), role: a.role },
      create: { email: a.email, nom: a.nom, password: await bcrypt.hash(a.password, 10), role: a.role },
    });
    console.log(`✅ ${a.role} : ${user.email}`);
  }

  // ═══════════════════════════════════════
  // 3. PROPRIETAIRES (avec motos)
  // ═══════════════════════════════════════
  const proprietaires = [
    { email: 'rakoto@email.com', nom: 'Rakoto Jean', telephone: '0341234567', cin: '117072001609', role: 'PROPRIETAIRE', password: 'Proprio123!' },
    { email: 'rabe@email.com', nom: 'Rabe Marie', telephone: '0339876543', cin: '118083002710', role: 'PROPRIETAIRE', password: 'Proprio123!' },
  ];

  for (const p of proprietaires) {
    const proprietaire = await prisma.proprietaire.upsert({
      where: { telephone: p.telephone },
      update: { nom: p.nom, telephone: p.telephone, email: p.email },
      create: { nom: p.nom, telephone: p.telephone, email: p.email, cin: p.cin },
    });

    // Créer un compte utilisateur pour le propriétaire
    await prisma.user.upsert({
      where: { email: p.email },
      update: { nom: p.nom, password: await bcrypt.hash(p.password, 10), role: 'PROPRIETAIRE' },
      create: { email: p.email, nom: p.nom, password: await bcrypt.hash(p.password, 10), role: 'PROPRIETAIRE' },
    });

    console.log(`✅ Propriétaire : ${proprietaire.nom} (${p.email})`);
  }

  // ═══════════════════════════════════════
  // 4. MOTOS
  // ═══════════════════════════════════════
  const motos = [
    { immatriculation: '1234TBA', marque: 'Yamaha', modele: 'YBR 125', proprietaireCin: '117072001609', couleur: 'Noir', kmActuel: 15000 },
    { immatriculation: '5678TBB', marque: 'Honda', modele: 'CG 125', proprietaireCin: '117072001609', couleur: 'Rouge', kmActuel: 22000 },
    { immatriculation: '9012TBC', marque: 'Suzuki', modele: 'GN 125', proprietaireCin: '118083002710', couleur: 'Bleu', kmActuel: 8000 },
  ];

  const proprietairesMap: Record<string, string> = {};
  const props = await prisma.proprietaire.findMany();
  props.forEach(p => { if (p.cin) proprietairesMap[p.cin] = p.id; });

  const motosIds: string[] = [];
  for (const m of motos) {
    const moto = await prisma.moto.upsert({
      where: { immatriculation: m.immatriculation },
      update: { marque: m.marque, modele: m.modele, proprietaireId: proprietairesMap[m.proprietaireCin] },
      create: {
        immatriculation: m.immatriculation,
        marque: m.marque,
        modele: m.modele,
        couleur: m.couleur,
        kmActuel: m.kmActuel,
        proprietaireId: proprietairesMap[m.proprietaireCin],
        statut: 'disponible',
      },
    });
    motosIds.push(moto.id);
    console.log(`✅ Moto : ${moto.immatriculation} → ${m.proprietaireCin}`);
  }

  // ═══════════════════════════════════════
  // 5. CHAUFFEURS (avec motos assignées)
  // ═══════════════════════════════════════
  const chauffeurs = [
    { codeAcces: 'CH001', nom: 'Andry', telephone: '0320000001', pin: '1234', moto: 0 },
    { codeAcces: 'CH002', nom: 'Hery', telephone: '0320000002', pin: '1234', moto: 1 },
    { codeAcces: 'CH003', nom: 'Fidy', telephone: '0320000003', pin: '1234', moto: 2 },
  ];

  for (const ch of chauffeurs) {
    const chauffeur = await prisma.chauffeur.upsert({
      where: { codeAcces: ch.codeAcces },
      update: { nom: ch.nom, telephone: ch.telephone, pin: ch.pin, motoId: motosIds[ch.moto] },
      create: {
        codeAcces: ch.codeAcces,
        nom: ch.nom,
        telephone: ch.telephone,
        pin: ch.pin,
        motoId: motosIds[ch.moto],
        statut: 'HORS_SERVICE',
        solde: 0,
      },
    });
    console.log(`✅ Chauffeur : ${chauffeur.codeAcces} - ${chauffeur.nom} → 🏍️ ${motos[ch.moto].immatriculation}`);
  }

  // ═══════════════════════════════════════
  // 6. PARAMÈTRES
  // ═══════════════════════════════════════
  const parametres = [
    { nom: 'prix_base', valeur: '2000', type: 'number', description: 'Prix de base course (Ar)' },
    { nom: 'prix_km', valeur: '500', type: 'number', description: 'Prix par kilomètre (Ar)' },
    { nom: 'tarif_location_journalier', valeur: '15000', type: 'number', description: 'Tarif location journalière (Ar)' },
    { nom: 'commission', valeur: '20', type: 'number', description: 'Commission ByGagoos (%)' },
  ];

  for (const p of parametres) {
    await prisma.parametre.upsert({ where: { nom: p.nom }, update: { valeur: p.valeur }, create: p });
  }
  console.log('✅ Paramètres par défaut');

  console.log('\n═══════════════════════════════════');
  console.log('🎉 Seed terminé avec succès !');
  console.log('═══════════════════════════════════\n');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
