#!/bin/bash
npm install
cd apps/api
npx prisma generate
npx nest build
