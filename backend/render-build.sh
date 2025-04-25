#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Installing TypeScript globally..."
npm install -g typescript

echo "Compiling TypeScript..."
tsc -p tsconfig.build.json

echo "Build completed successfully!"
