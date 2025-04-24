#!/bin/bash
echo "Compiling seed script..."
npx tsc -p tsconfig.json scripts/seed-data.ts --outDir dist/scripts

echo "Running seed script..."
node dist/scripts/seed-data.js

echo "Seed process completed!"
