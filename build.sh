#!/bin/bash
npm install
cd apps/api
npx prisma generate
# Utiliser le chemin absolu vers nest
/opt/render/project/src/node_modules/.bin/nest build
