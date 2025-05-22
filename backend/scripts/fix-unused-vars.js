/**
 * Script to automatically fix @typescript-eslint/no-unused-vars warnings
 *
 * This script will prefix unused variables with an underscore (_)
 * which is the convention recognized by our ESLint configuration.
 *
 * Usage: node scripts/fix-unused-vars.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run ESLint to get the list of files with unused variable warnings
function getFilesWithUnusedVars() {
  try {
    // Run ESLint with the custom format to get just the file paths and variable names
    const output = execSync('npx eslint "{src,apps,libs,test}/**/*.ts" --format json', {
      encoding: 'utf8',
    });

    const results = JSON.parse(output);
    const filesWithUnusedVars = new Map();

    for (const result of results) {
      const filePath = result.filePath;
      const unusedVars = [];

      for (const message of result.messages) {
        if (message.ruleId === '@typescript-eslint/no-unused-vars') {
          // Extract the variable name from the message
          const match = message.message.match(/'([^']+)'/);
          if (match && match[1]) {
            unusedVars.push({
              name: match[1],
              line: message.line,
              column: message.column,
            });
          }
        }
      }

      if (unusedVars.length > 0) {
        filesWithUnusedVars.set(filePath, unusedVars);
      }
    }

    return filesWithUnusedVars;
  } catch (error) {
    // If ESLint exits with a non-zero code (which it will if there are warnings)
    // we need to parse the output from stderr
    if (error.stdout) {
      try {
        const results = JSON.parse(error.stdout);
        const filesWithUnusedVars = new Map();

        for (const result of results) {
          const filePath = result.filePath;
          const unusedVars = [];

          for (const message of result.messages) {
            if (message.ruleId === '@typescript-eslint/no-unused-vars') {
              // Extract the variable name from the message
              const match = message.message.match(/'([^']+)'/);
              if (match && match[1]) {
                unusedVars.push({
                  name: match[1],
                  line: message.line,
                  column: message.column,
                });
              }
            }
          }

          if (unusedVars.length > 0) {
            filesWithUnusedVars.set(filePath, unusedVars);
          }
        }

        return filesWithUnusedVars;
      } catch (parseError) {
        console.error('Error parsing ESLint output:', parseError);
        return new Map();
      }
    }

    console.error('Error running ESLint:', error);
    return new Map();
  }
}

// Fix unused variables in a file
function fixUnusedVarsInFile(filePath, unusedVars) {
  console.log(`Fixing ${path.basename(filePath)}...`);

  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Sort unused vars by line and column in descending order
  // to avoid position shifts when making changes
  unusedVars.sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  // Process each unused variable
  for (const { name, line, column } of unusedVars) {
    // Skip variables that already start with underscore
    if (name.startsWith('_')) continue;

    // Get the line content
    const lineContent = lines[line - 1];

    // Check if this is an import statement
    if (lineContent.includes('import ')) {
      // Handle imports differently - comment them out or use "as _Name" syntax
      if (lineContent.includes(`import { ${name} `)) {
        // Named import
        lines[line - 1] = lineContent.replace(`import { ${name}`, `import { /* ${name} */`);
      } else if (lineContent.includes(`{ ${name} }`)) {
        // Single named import
        lines[line - 1] = lineContent.replace(`{ ${name} }`, `{ /* ${name} */ }`);
      } else if (lineContent.includes(`{ ${name},`)) {
        // First in a list of named imports
        lines[line - 1] = lineContent.replace(`{ ${name},`, `{ /* ${name} */,`);
      } else if (lineContent.includes(`, ${name} }`)) {
        // Last in a list of named imports
        lines[line - 1] = lineContent.replace(`, ${name} }`, `, /* ${name} */ }`);
      } else if (lineContent.includes(`, ${name},`)) {
        // Middle in a list of named imports
        lines[line - 1] = lineContent.replace(`, ${name},`, `, /* ${name} */,`);
      }
    } else {
      // For other variables (function parameters, local variables, etc.)
      // Prefix with underscore
      const position = column - 1;
      const before = lineContent.substring(0, position);
      const after = lineContent.substring(position + name.length);
      lines[line - 1] = `${before}_${name}${after}`;
    }
  }

  // Write the modified content back to the file
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

// Main function
function main() {
  console.log('Analyzing files for unused variables...');
  const filesWithUnusedVars = getFilesWithUnusedVars();

  console.log(`Found ${filesWithUnusedVars.size} files with unused variables.`);

  // Fix each file
  for (const [filePath, unusedVars] of filesWithUnusedVars.entries()) {
    fixUnusedVarsInFile(filePath, unusedVars);
  }

  console.log('Done! Re-run ESLint to verify fixes.');
}

main();
