import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetToday() {
  console.log('🔄 Reset quotidien des chauffeurs...\n');

  const updated = await prisma.chauffeur.updateMany({
    data: { statut: 'HORS_SERVICE' },
  });
  console.log(`✅ ${updated.count} chauffeurs remis à HORS_SERVICE`);

  const totalCourses = await prisma.course.count();
  const totalPointages = await prisma.pointage.count();
  const totalVersements = await prisma.versement.count();

  console.log('\n📊 Données conservées :');
  console.log(`   🚖 ${totalCourses} courses`);
  console.log(`   📍 ${totalPointages} pointages`);
  console.log(`   💰 ${totalVersements} versements`);

  const chauffeurs = await prisma.chauffeur.findMany({
    select: { nom: true, codeAcces: true, statut: true, solde: true },
  });
  console.log('\n👤 Chauffeurs :');
  chauffeurs.forEach(c => {
    console.log(`   ${c.nom} (${c.codeAcces}) - ${c.statut} - Solde: ${c.solde} Ar`);
  });

  console.log('\n✅ Reset terminé. Tous les chauffeurs doivent faire DÉPART ce matin.');
}

resetToday()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
