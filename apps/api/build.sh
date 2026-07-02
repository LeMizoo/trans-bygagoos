#!/bin/bash
npm install
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx tsc -p tsconfig.build.json
cd ../..

# Seed des flottes de test
echo "🌱 Seed flottes..."
curl -s -X POST http://localhost:10000/api/v1/flottes/seed-create || echo "⚠️ Seed échoué (API pas encore démarrée)"
