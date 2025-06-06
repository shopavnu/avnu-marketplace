const fs = require('fs');
const path = require('path');

// Update root package-lock.json
const rootDir = __dirname;
const rootPackageLockPath = path.join(rootDir, 'package-lock.json');
console.log(`Updating ${rootPackageLockPath}`);

if (fs.existsSync(rootPackageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(rootPackageLockPath, 'utf8'));
  let replaced = 0;
  
  // Function to recursively find and replace all multer@2.0.0 occurrences
  function replaceMulterVersions(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Look for dependencies.multer
    if (obj.dependencies && obj.dependencies.multer && obj.dependencies.multer.version === '2.0.0') {
      obj.dependencies.multer.version = '2.0.1';
      replaced++;
    }
    
    // Look through packages
    if (obj.packages) {
      Object.keys(obj.packages).forEach(key => {
        const pkg = obj.packages[key];
        if (pkg && key.includes('multer') && pkg.version === '2.0.0') {
          pkg.version = '2.0.1';
          replaced++;
        }
      });
    }
    
    // Recursive search through all object properties
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceMulterVersions(obj[key]);
      }
    }
  }
  
  replaceMulterVersions(packageLock);
  console.log(`Updated ${replaced} multer references in root package-lock.json`);
  fs.writeFileSync(rootPackageLockPath, JSON.stringify(packageLock, null, 2));
} else {
  console.log('Root package-lock.json not found');
}

// Do the same for backend package-lock.json
const backendDir = path.join(rootDir, 'backend');
const backendPackageLockPath = path.join(backendDir, 'package-lock.json');
console.log(`Checking ${backendPackageLockPath}`);

if (fs.existsSync(backendPackageLockPath)) {
  const backendPackageLock = JSON.parse(fs.readFileSync(backendPackageLockPath, 'utf8'));
  let backendReplaced = 0;
  
  // Function to recursively find and replace all multer@2.0.0 occurrences
  function replaceMulterVersions(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Look for dependencies.multer
    if (obj.dependencies && obj.dependencies.multer && obj.dependencies.multer.version === '2.0.0') {
      obj.dependencies.multer.version = '2.0.1';
      backendReplaced++;
    }
    
    // Look through packages
    if (obj.packages) {
      Object.keys(obj.packages).forEach(key => {
        const pkg = obj.packages[key];
        if (pkg && key.includes('multer') && pkg.version === '2.0.0') {
          pkg.version = '2.0.1';
          backendReplaced++;
        }
      });
    }
    
    // Recursive search through all object properties
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceMulterVersions(obj[key]);
      }
    }
  }
  
  replaceMulterVersions(backendPackageLock);
  console.log(`Updated ${backendReplaced} multer references in backend package-lock.json`);
  fs.writeFileSync(backendPackageLockPath, JSON.stringify(backendPackageLock, null, 2));
} else {
  console.log('Backend package-lock.json not found');
}

console.log('Package-lock.json update completed. Run npm ci to verify fixes.');
