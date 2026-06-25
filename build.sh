#!/bin/bash
npm install
cd apps/api
npx prisma generate
# Compiler avec tsc au lieu de nest
npx tsc -p tsconfig.build.json
