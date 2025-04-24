#!/bin/bash
echo "Compiling simple seed script..."
npx tsc scripts/simple-seed.ts --outDir dist/scripts

echo "Running simple seed script..."
node dist/scripts/simple-seed.js

echo "Seed process completed!"
