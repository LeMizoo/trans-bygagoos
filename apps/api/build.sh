#!/bin/bash
npm install
cd apps/api
npx prisma generate
npx tsc -p tsconfig.build.json
cd ../..
