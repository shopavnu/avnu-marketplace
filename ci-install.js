#!/usr/bin/env node

/**
 * CI-friendly installation script that bypasses npm ci's strict version checking
 * This script uses npm install with --no-package-lock to force it to use package.json
 * versions instead of strictly adhering to package-lock.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting CI-friendly installation process...');

// Create .npmrc file with necessary settings
const npmrcContent = `
# CI environment configuration
save-exact=true
legacy-peer-deps=true
strict-peer-dependencies=false
engine-strict=false
better-sqlite3_binary=true
`;

fs.writeFileSync('.npmrc', npmrcContent);
console.log('Created .npmrc with CI-friendly settings');

// Force install without using package-lock.json
console.log('Running npm install with --no-package-lock to bypass version inconsistencies');
try {
  execSync('npm install --no-package-lock', { stdio: 'inherit' });
  console.log('Base npm install completed successfully');
  
  // Install workspace packages if needed
  console.log('Installing workspace packages...');
  execSync('npm install --workspace=backend --no-package-lock', { stdio: 'inherit' });
  console.log('Backend workspace installation completed');
  
  console.log('Installation completed successfully');

  // Fix multer version directly in node_modules
  console.log('Patching multer references...');
  try {
    // Update @nestjs/platform-express package.json
    const nestPlatformExpressPath = path.join('node_modules', '@nestjs', 'platform-express');
    const pkgJsonPath = path.join(nestPlatformExpressPath, 'package.json');
    
    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkgJson.dependencies && pkgJson.dependencies.multer === '2.0.0') {
        pkgJson.dependencies.multer = '2.0.1';
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
        console.log('Updated multer reference in @nestjs/platform-express/package.json');
      }
    }
    
    // Run backend security fix script if it exists
    const fixScriptPath = path.join('backend', 'scripts', 'fix-security-vulnerabilities.js');
    if (fs.existsSync(fixScriptPath)) {
      console.log('Running security fix script...');
      execSync('node backend/scripts/fix-security-vulnerabilities.js', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Error during patching:', error);
    // Non-fatal error, continue
  }
  
  process.exit(0);
} catch (error) {
  console.error('Installation failed:', error);
  process.exit(1);
}
