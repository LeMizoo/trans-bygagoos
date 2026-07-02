#!/bin/bash
set -e

echo "📦 Installation dépendances..."
npm install

echo "📁 Création dossier data..."
mkdir -p /opt/render/project/data

echo "🔨 Build API..."
cd apps/api
npx prisma generate
npm run build

echo "🗄️ Migration DB..."
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma migrate deploy

echo "✅ Build terminé"
