#!/bin/bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx tsx reset-today.ts
node dist/main.js
