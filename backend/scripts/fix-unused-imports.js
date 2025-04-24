#!/usr/bin/env node

/**
 * This script automatically fixes TypeScript errors related to unused imports
 * by adding the underscore prefix to them.
 * 
 * Usage: node fix-unused-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Regex patterns to identify unused import errors
const UNUSED_IMPORT_PATTERN = /'([^']+)' has no exported member named '([^']+)'\. Did you mean '([^']+)'/g;
const IMPORT_STATEMENT_PATTERN = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;

// Function to find all TypeScript files recursively
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix unused imports in a file
function fixUnusedImports(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Run TypeScript compiler to get errors
  try {
    execSync(`npx tsc --noEmit ${filePath}`, { stdio: 'pipe' });
    // If no errors, return
    return false;
  } catch (error) {
    const errorOutput = error.stderr.toString();
    const matches = [...errorOutput.matchAll(UNUSED_IMPORT_PATTERN)];
    
    if (matches.length === 0) {
      return false;
    }
    
    // Extract the module path and import names that need fixing
    const importsToFix = matches.map(match => ({
      modulePath: match[1],
      wrongImport: match[2],
      correctImport: match[3]
    }));
    
    // Fix each import statement
    importsToFix.forEach(({ modulePath, wrongImport, correctImport }) => {
      // Find the import statement for this module
      const importRegex = new RegExp(`import\\s+{([^}]+)}\\s+from\\s+['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
      const importMatches = [...content.matchAll(importRegex)];
      
      if (importMatches.length > 0) {
        const importStatement = importMatches[0][0];
        const importNames = importMatches[0][1].split(',').map(name => name.trim());
        
        // Replace the wrong import with the correct one with underscore prefix
        const newImportNames = importNames.map(name => {
          if (name === wrongImport || name.endsWith(` as ${wrongImport}`)) {
            return `${correctImport} as _${correctImport}`;
          }
          return name;
        });
        
        // Create the new import statement
        const newImportStatement = `import { ${newImportNames.join(', ')} } from '${modulePath}'`;
        
        // Replace the old import statement with the new one
        content = content.replace(importStatement, newImportStatement);
        modified = true;
        console.log(`  Fixed import: ${wrongImport} -> ${correctImport} as _${correctImport}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  Updated ${filePath}`);
    }
    
    return modified;
  }
}

// Main function
function main() {
  console.log('Finding TypeScript files...');
  const srcDir = path.join(__dirname, '..', 'src');
  const testDir = path.join(__dirname, '..', 'test');
  
  const srcFiles = findTsFiles(srcDir);
  const testFiles = findTsFiles(testDir);
  const allFiles = [...srcFiles, ...testFiles];
  
  console.log(`Found ${allFiles.length} TypeScript files.`);
  console.log('Fixing unused imports...');
  
  let fixedCount = 0;
  allFiles.forEach(file => {
    if (fixUnusedImports(file)) {
      fixedCount++;
    }
  });
  
  console.log(`Fixed unused imports in ${fixedCount} files.`);
}

main();
