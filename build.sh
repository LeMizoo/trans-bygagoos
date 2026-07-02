#!/bin/bash
set -e

echo "📁 Création dossier data..."
mkdir -p /opt/render/project/data

echo "📦 Installation dépendances..."
npm install

echo "🔨 Build API..."
cd apps/api
npx prisma generate
npm run build

echo "🗄️ Migration DB..."
npx prisma db push --accept-data-loss

echo "🌱 Seed initial..."
npx ts-node prisma/seed.ts 2>/dev/null || echo "⚠️ Seed déjà fait"

echo "✅ Build terminé"
