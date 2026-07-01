#!/bin/bash
npm install
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npx tsc -p tsconfig.build.json
cd ../..
