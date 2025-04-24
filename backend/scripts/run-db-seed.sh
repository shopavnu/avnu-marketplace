#!/bin/bash
echo "Compiling database seed script..."
npx tsc scripts/db-seed.ts --outDir dist/scripts

echo "Running database seed script..."
node dist/scripts/db-seed.js

echo "Seed process completed!"
