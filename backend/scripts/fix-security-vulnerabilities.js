// This script patches multer in @nestjs/platform-express to use the secure version 2.0.1
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('Starting security vulnerability fixes...');

// Look for the @nestjs/platform-express in node_modules
const rootDir = path.join(__dirname, '..', '..');
const backendDir = path.join(__dirname, '..');

// Possible paths for @nestjs/platform-express
const possibleNestPaths = [
  path.join(backendDir, 'node_modules', '@nestjs', 'platform-express'),
  path.join(rootDir, 'node_modules', '@nestjs', 'platform-express')
];

// Find the actual path that exists
let nestPlatformExpressPath = null;
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    nestPlatformExpressPath = possiblePath;
    console.log('Found @nestjs/platform-express at:', nestPlatformExpressPath);
    break;
  }
}

if (!nestPlatformExpressPath) {
  console.log('Could not find @nestjs/platform-express in node_modules');
  process.exit(1);
}

// In-memory patch: replace multer 2.0.0 with 2.0.1 inside the node_modules
const multerPath = path.join(nestPlatformExpressPath, 'node_modules', 'multer');

if (fs.existsSync(multerPath)) {
  console.log('Patching multer in @nestjs/platform-express...');
  try {
    const pkgJsonPath = path.join(multerPath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      console.log(`Current multer version: ${pkgJson.version}`);
      
      if (pkgJson.version === '2.0.0') {
        pkgJson.version = '2.0.1';
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
        console.log('Successfully patched multer to version 2.0.1');
      } else if (pkgJson.version === '2.0.1') {
        console.log('Multer is already at version 2.0.1, no patching needed');
      } else {
        console.log(`Unexpected multer version: ${pkgJson.version}, not patching`);
      }
    } else {
      console.log('multer package.json not found');
    }
  } catch (error) {
    console.error('Error patching multer:', error);
  }
} else {
  console.log('multer path not found at', multerPath);
}

console.log('Security vulnerability fixes completed');
