/**
 * Script to automatically fix @typescript-eslint/no-unused-vars warnings
 *
 * This script will:
 * 1. Prefix unused function parameters with an underscore
 * 2. Comment out unused imports with a note
 *
 * Usage: ts-node scripts/fix-lint-warnings.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { execSync } from 'child_process';

// Parse the ESLint output to identify files with warnings
const parseEslintOutput = (output: string): Map<string, string[]> => {
  const fileWarnings = new Map<string, string[]>();
  const lines = output.split('\n');

  let currentFile = '';

  for (const line of lines) {
    // Match file paths
    const fileMatch = line.match(/^\/(.+?):\s*$/);
    if (fileMatch) {
      currentFile = '/' + fileMatch[1];
      fileWarnings.set(currentFile, []);
      continue;
    }

    // Match warning lines
    const warningMatch = line.match(
      /^\s+\d+:\d+\s+warning\s+'(.+?)'\s+is\s+defined\s+but\s+never\s+used/,
    );
    if (warningMatch && currentFile) {
      const warnings = fileWarnings.get(currentFile) || [];
      warnings.push(warningMatch[1]);
      fileWarnings.set(currentFile, warnings);
    }
  }

  return fileWarnings;
};

// Fix unused variables in a file
const fixUnusedVars = (filePath: string, unusedVars: string[]): void => {
  console.log(`Fixing ${filePath}...`);

  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');

  // Create a TypeScript source file
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  // Fix imports first
  sourceFile.statements.forEach(statement => {
    if (ts.isImportDeclaration(statement)) {
      const namedBindings = statement.importClause?.namedBindings;

      if (namedBindings && ts.isNamedImports(namedBindings)) {
        namedBindings.elements.forEach(element => {
          const importName = element.name.text;

          if (unusedVars.includes(importName)) {
            // Get the position of the import
            const start = element.getStart(sourceFile);
            const end = element.getEnd();

            // Replace with commented version or underscore prefix
            const replacement =
              importName === importName.charAt(0).toUpperCase() + importName.slice(1)
                ? `/* ${importName} */` // For types, just comment out
                : `${importName} as _${importName}`; // For values, use as alias

            content = content.substring(0, start) + replacement + content.substring(end);
          }
        });
      }
    }
  });

  // Fix function parameters
  const fixFunctionParams = (node: ts.Node) => {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node)
    ) {
      node.parameters.forEach(param => {
        if (param.name && ts.isIdentifier(param.name)) {
          const paramName = param.name.text;

          if (unusedVars.includes(paramName) && !paramName.startsWith('_')) {
            // Get the position of the parameter name
            const start = param.name.getStart(sourceFile);
            const end = param.name.getEnd();

            // Replace with underscore prefix
            content = content.substring(0, start) + `_${paramName}` + content.substring(end);
          }
        }
      });
    }

    ts.forEachChild(node, fixFunctionParams);
  };

  fixFunctionParams(sourceFile);

  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf-8');
};

// Run ESLint to get the current warnings
const runEslint = (): string => {
  try {
    return execSync('npx eslint "{src,apps,libs,test}/**/*.ts" --format stylish', {
      encoding: 'utf-8',
    });
  } catch (error: any) {
    // ESLint will exit with non-zero code if there are warnings
    return error.stdout;
  }
};

// Main function
const main = () => {
  console.log('Running ESLint to identify warnings...');
  const eslintOutput = runEslint();

  const fileWarnings = parseEslintOutput(eslintOutput);
  console.log(`Found ${fileWarnings.size} files with unused variable warnings`);

  // Fix each file
  for (const [filePath, unusedVars] of fileWarnings.entries()) {
    if (unusedVars.length > 0) {
      fixUnusedVars(filePath, unusedVars);
    }
  }

  console.log('Done! Re-run ESLint to verify fixes.');
};

main();
