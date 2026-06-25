#!/bin/bash
cd /opt/render/project/src/apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
node dist/main.js
