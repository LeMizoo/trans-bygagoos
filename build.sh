#!/bin/bash
set -e

echo "📦 Installation dépendances..."
npm install

echo "🔨 Build API..."
cd apps/api
npx prisma generate
npm run build

echo "🗄️ Push DB schema..."
npx prisma db push --accept-data-loss

echo "✅ Build terminé"
