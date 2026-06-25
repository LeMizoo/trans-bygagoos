#!/bin/bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
node dist/main
