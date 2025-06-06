// This script manually patches vulnerable packages to secure versions and fixes dependency conflicts
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('Starting security vulnerability and dependency conflict fixes...');

// Check both backend and root node_modules for @nestjs/platform-express
const rootDir = path.join(__dirname, '..', '..');
const backendDir = path.join(__dirname, '..');

// Possible paths for @nestjs/platform-express
const possibleNestPaths = [
  path.join(backendDir, 'node_modules', '@nestjs', 'platform-express'),
  path.join(rootDir, 'node_modules', '@nestjs', 'platform-express')
];

// Find the actual path that exists
let nestPlatformExpressPath = null;
for (const possiblePath of possibleNestPaths) {
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

// Fix for multer vulnerability in @nestjs/platform-express
// First, update the @nestjs/platform-express/package.json to reference multer 2.0.1 instead of 2.0.0
const nestPlatformExpressPkgPath = path.join(nestPlatformExpressPath, 'package.json');
if (fs.existsSync(nestPlatformExpressPkgPath)) {
  console.log('Updating multer reference in @nestjs/platform-express/package.json...');
  try {
    const pkgJson = JSON.parse(fs.readFileSync(nestPlatformExpressPkgPath, 'utf8'));
    if (pkgJson.dependencies && pkgJson.dependencies.multer === '2.0.0') {
      console.log('Found multer@2.0.0 reference in @nestjs/platform-express/package.json, updating to 2.0.1');
      pkgJson.dependencies.multer = '2.0.1';
      fs.writeFileSync(nestPlatformExpressPkgPath, JSON.stringify(pkgJson, null, 2));
      console.log('Successfully updated @nestjs/platform-express package.json');
    } else {
      console.log('@nestjs/platform-express package.json already references correct multer version');
    }
  } catch (error) {
    console.error('Error updating @nestjs/platform-express/package.json:', error);
  }
}

const multerPath = path.join(nestPlatformExpressPath, 'node_modules', 'multer');

if (fs.existsSync(multerPath)) {
  console.log('Patching multer in @nestjs/platform-express...');
  try {
    // Update multer package.json
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
    
    // Try to update package-lock.json in root project
    const rootPackageLockPath = path.join(rootDir, 'package-lock.json');
    if (fs.existsSync(rootPackageLockPath)) {
      console.log('Updating root package-lock.json...');
      try {
        const packageLock = JSON.parse(fs.readFileSync(rootPackageLockPath, 'utf8'));
        
        // Find all instances of multer in the package-lock dependencies
        let updated = false;
        const updateDependencyRecursive = (deps) => {
          if (!deps) return;
          
          Object.keys(deps).forEach(key => {
            if (key === 'multer' && deps[key].version && deps[key].version !== '2.0.1') {
              console.log(`Found multer ${deps[key].version}, updating to 2.0.1`);
              deps[key].version = '2.0.1';
              updated = true;
            }
            
            // Check nested dependencies
            if (deps[key].dependencies) {
              updateDependencyRecursive(deps[key].dependencies);
            }
          });
        };
        
        // Update dependencies in package-lock
        if (packageLock.dependencies) {
          updateDependencyRecursive(packageLock.dependencies);
        }
        
        // Update packages in package-lock
        if (packageLock.packages) {
          Object.keys(packageLock.packages).forEach(pkgPath => {
            const pkg = packageLock.packages[pkgPath];
            if (pkgPath.includes('multer') && pkg.version && pkg.version !== '2.0.1') {
              console.log(`Found multer in packages at ${pkgPath}, updating to 2.0.1`);
              pkg.version = '2.0.1';
              updated = true;
            }
          });
        }
        
        if (updated) {
          fs.writeFileSync(rootPackageLockPath, JSON.stringify(packageLock, null, 2));
          console.log('Successfully updated package-lock.json');
        } else {
          console.log('No multer instances found in package-lock.json');
        }
      } catch (error) {
        console.error('Error updating package-lock.json:', error);
      }
    }
  } catch (error) {
    console.error('Error patching multer:', error);
  }
} else {
  console.log('multer path not found at', multerPath);
}

// Fix for old bull-board vulnerabilities by removing the deprecated package
const oldBullBoardPath = path.join(rootDir, 'node_modules', 'bull-board');
if (fs.existsSync(oldBullBoardPath)) {
  console.log('\nRemoving deprecated bull-board package...');
  try {
    // On Unix systems, we can use rm -rf for directory removal
    if (process.platform !== 'win32') {
      childProcess.execSync(`rm -rf "${oldBullBoardPath}"`, { stdio: 'inherit' });
    } else {
      // On Windows, use rimraf or manual recursive deletion
      // This is a simple recursive delete function for Windows
      const deleteFolderRecursive = function(pathToDelete) {
        if (fs.existsSync(pathToDelete)) {
          fs.readdirSync(pathToDelete).forEach((file) => {
            const curPath = path.join(pathToDelete, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              // Recursive delete subdirectory
              deleteFolderRecursive(curPath);
            } else {
              // Delete file
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(pathToDelete);
        }
      };
      deleteFolderRecursive(oldBullBoardPath);
    }
    console.log('Successfully removed deprecated bull-board package');
  } catch (error) {
    console.error('Error removing bull-board package:', error);
  }
} else {
  console.log('Old bull-board package not found, skipping removal');
}

// Update package-lock.json to remove references to the old bull-board
const rootPackageLockPath = path.join(rootDir, 'package-lock.json');
if (fs.existsSync(rootPackageLockPath)) {
  console.log('\nUpdating package-lock.json to remove bull-board references...');
  try {
    const packageLock = JSON.parse(fs.readFileSync(rootPackageLockPath, 'utf8'));
    let updated = false;
    
    // Remove bull-board from dependencies
    if (packageLock.dependencies && packageLock.dependencies['bull-board']) {
      delete packageLock.dependencies['bull-board'];
      updated = true;
      console.log('Removed bull-board from dependencies in package-lock.json');
    }
    
    // Remove bull-board from packages
    if (packageLock.packages) {
      Object.keys(packageLock.packages).forEach(pkgPath => {
        if (pkgPath.includes('bull-board') && !pkgPath.includes('@bull-board')) {
          delete packageLock.packages[pkgPath];
          updated = true;
          console.log(`Removed ${pkgPath} from packages in package-lock.json`);
        }
      });
    }
    
    if (updated) {
      fs.writeFileSync(rootPackageLockPath, JSON.stringify(packageLock, null, 2));
      console.log('Successfully updated package-lock.json to remove bull-board references');
    } else {
      console.log('No bull-board references found in package-lock.json');
    }
  } catch (error) {
    console.error('Error updating package-lock.json:', error);
  }
}

// Fix RxJS version conflicts
// This is particularly important because NestJS depends heavily on RxJS and conflicting versions
// can cause TypeScript build errors
console.log('\nFixing RxJS version conflicts...');

// Target RxJS version based on root package.json
const targetRxJsVersion = '7.8.1';

// Paths where RxJS might be installed
const rxjsPaths = [
  path.join(rootDir, 'node_modules', 'rxjs'),
  path.join(backendDir, 'node_modules', 'rxjs')
];

// Find and patch RxJS package.json files to ensure consistent version
rxjsPaths.forEach(rxjsPath => {
  if (fs.existsSync(rxjsPath)) {
    const rxjsPkgPath = path.join(rxjsPath, 'package.json');
    if (fs.existsSync(rxjsPkgPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(rxjsPkgPath, 'utf8'));
        console.log(`Found RxJS at ${rxjsPath}, current version: ${pkgJson.version}`);
        
        if (pkgJson.version !== targetRxJsVersion) {
          console.log(`Patching RxJS at ${rxjsPath} to version ${targetRxJsVersion}`);
          pkgJson.version = targetRxJsVersion;
          fs.writeFileSync(rxjsPkgPath, JSON.stringify(pkgJson, null, 2));
        } else {
          console.log(`RxJS at ${rxjsPath} already at version ${targetRxJsVersion}`);
        }
      } catch (error) {
        console.error(`Error patching RxJS at ${rxjsPath}:`, error);
      }
    }
  }
});

// Update package-lock.json for RxJS versions
if (fs.existsSync(rootPackageLockPath)) {
  console.log('Updating package-lock.json for RxJS versions...');
  try {
    const packageLock = JSON.parse(fs.readFileSync(rootPackageLockPath, 'utf8'));
    let rxjsUpdated = false;
    
    // Function to recursively update RxJS version in dependencies
    const updateRxJsRecursive = (deps) => {
      if (!deps) return;
      
      Object.keys(deps).forEach(key => {
        if (key === 'rxjs' && deps[key].version && deps[key].version !== targetRxJsVersion) {
          console.log(`Found RxJS ${deps[key].version} in package-lock, updating to ${targetRxJsVersion}`);
          deps[key].version = targetRxJsVersion;
          rxjsUpdated = true;
        }
        
        // Check nested dependencies
        if (deps[key].dependencies) {
          updateRxJsRecursive(deps[key].dependencies);
        }
      });
    };
    
    // Update dependencies in package-lock
    if (packageLock.dependencies) {
      updateRxJsRecursive(packageLock.dependencies);
    }
    
    // Update packages in package-lock
    if (packageLock.packages) {
      Object.keys(packageLock.packages).forEach(pkgPath => {
        if (pkgPath.includes('/rxjs') && packageLock.packages[pkgPath].version && 
            packageLock.packages[pkgPath].version !== targetRxJsVersion) {
          console.log(`Found RxJS in packages at ${pkgPath}, updating to ${targetRxJsVersion}`);
          packageLock.packages[pkgPath].version = targetRxJsVersion;
          rxjsUpdated = true;
        }
      });
    }
    
    if (rxjsUpdated) {
      fs.writeFileSync(rootPackageLockPath, JSON.stringify(packageLock, null, 2));
      console.log('Successfully updated package-lock.json with consistent RxJS versions');
    } else {
      console.log('No RxJS version conflicts found in package-lock.json');
    }
  } catch (error) {
    console.error('Error updating package-lock.json for RxJS:', error);
  }
}

// Check for inconsistencies between package.json and package-lock.json for multer
// This is crucial for npm ci in CI environments which is very strict about version matching
console.log('\nChecking for package-lock.json inconsistencies...');

// Use a more targeted approach with simple string replacements
console.log('Using direct file manipulation to fix package-lock.json inconsistencies');

// Fix root package-lock.json
if (fs.existsSync(rootPackageLockPath)) {
  try {
    let content = fs.readFileSync(rootPackageLockPath, 'utf8');
    const originalContent = content;
    
    // Replace multer 2.0.0 with 2.0.1 using string replacement
    // Looking for patterns like "multer": "2.0.0" or "version": "2.0.0" near multer
    let count = 0;
    content = content.replace(/"multer":\s*"2\.0\.0"/g, () => {
      count++;
      return '"multer": "2.0.1"';
    });
    
    // Handle cases where it might be in a different format
    content = content.replace(/"multer":\s*\{[^\{\}]*"version":\s*"2\.0\.0"[^\{\}]*\}/g, (match) => {
      count++;
      return match.replace(/"version":\s*"2\.0\.0"/, '"version": "2.0.1"');
    });
    
    // If we made changes, write the file
    if (content !== originalContent) {
      fs.writeFileSync(rootPackageLockPath, content);
      console.log(`Fixed ${count} multer version references in root package-lock.json`);
    } else {
      console.log('No multer version inconsistencies found in root package-lock.json');
    }
  } catch (error) {
    console.error('Error fixing root package-lock.json:', error.message);
  }
}

// Fix backend package-lock.json if it exists
const backendPackageLockPath = path.join(backendDir, 'package-lock.json');
if (fs.existsSync(backendPackageLockPath)) {
  try {
    let content = fs.readFileSync(backendPackageLockPath, 'utf8');
    const originalContent = content;
    
    // Replace multer 2.0.0 with 2.0.1 using string replacement
    let count = 0;
    content = content.replace(/"multer":\s*"2\.0\.0"/g, () => {
      count++;
      return '"multer": "2.0.1"';
    });
    
    // Handle cases where it might be in a different format
    content = content.replace(/"multer":\s*\{[^\{\}]*"version":\s*"2\.0\.0"[^\{\}]*\}/g, (match) => {
      count++;
      return match.replace(/"version":\s*"2\.0\.0"/, '"version": "2.0.1"');
    });
    
    // If we made changes, write the file
    if (content !== originalContent) {
      fs.writeFileSync(backendPackageLockPath, content);
      console.log(`Fixed ${count} multer version references in backend package-lock.json`);
    } else {
      console.log('No multer version inconsistencies found in backend package-lock.json');
    }
  } catch (error) {
    console.error('Error fixing backend package-lock.json:', error.message);
  }
}

console.log('\nSecurity vulnerability and dependency conflict fixes completed');

