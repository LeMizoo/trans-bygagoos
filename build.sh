#!/bin/bash
npm install
cd apps/api
npx prisma generate
# Compiler avec tsc au lieu de nest
npx tsc -p tsconfig.build.json

# Seed automatique des flottes
echo "🌱 Seed flottes de test..."
sleep 5
curl -s -X POST https://trans-bygagoos.onrender.com/api/v1/flottes/seed-create || echo "⚠️ Seed non exécuté"
