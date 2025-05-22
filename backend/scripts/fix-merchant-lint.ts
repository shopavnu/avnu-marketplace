/**
 * Script to fix linting issues in the merchants module
 * This script prefixes unused variables, imports, and function parameters with underscores
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Files to process
const filesToFix = [
  // Resolvers
  'src/modules/merchants/resolvers/ad-budget-management.resolver.ts',
  'src/modules/merchants/resolvers/ad-placement.resolver.spec.ts',
  'src/modules/merchants/resolvers/ad-placement.resolver.ts',

  // Services
  'src/modules/merchants/services/ad-budget-management.service.spec.ts',
  'src/modules/merchants/services/ad-placement.service.spec.ts',
  'src/modules/merchants/services/merchant-analytics-filter.service.ts',
  'src/modules/merchants/services/merchant-dashboard-analytics.service.ts',
  'src/modules/merchants/services/merchant-data-aggregation.service.ts',
  'src/modules/merchants/services/merchant-revenue-analytics.service.ts',

  // Test mocks
  'src/modules/merchants/test/mocks/ad-budget-management.resolver.mock.ts',
  'src/modules/merchants/test/mocks/ad-budget-management.service.mock.ts',
  'src/modules/merchants/test/mocks/ad-placement.service.mock.ts',

  // Scripts and utils
  'src/scripts/test-analytics-services.ts',
  'src/utils/decorator-compatibility.ts',
];

// Map of files and the variables/imports to prefix
const fixMap = {
  'src/modules/merchants/resolvers/ad-budget-management.resolver.ts': {
    imports: ['MerchantAdCampaign'],
  },
  'src/modules/merchants/resolvers/ad-placement.resolver.spec.ts': {
    variables: ['mockProductRecommendations'],
  },
  'src/modules/merchants/resolvers/ad-placement.resolver.ts': {
    parameters: ['user'],
  },
  'src/modules/merchants/services/ad-budget-management.service.spec.ts': {
    imports: ['BudgetUtilization', 'BudgetForecast', 'BudgetUpdateResult'],
    variables: ['adCampaignRepository', 'eventEmitter'],
  },
  'src/modules/merchants/services/ad-placement.service.spec.ts': {
    imports: ['AdPlacementOptions', 'AdPlacementResult', 'BudgetUpdateResult'],
    variables: ['campaignRepository'],
  },
  'src/modules/merchants/services/merchant-analytics-filter.service.ts': {
    imports: ['Raw'],
  },
  'src/modules/merchants/services/merchant-dashboard-analytics.service.ts': {
    imports: ['Between', 'IsNull', 'Not', 'FindOptionsWhere', 'In', 'MetricType'],
  },
  'src/modules/merchants/services/merchant-data-aggregation.service.ts': {
    imports: ['IsNull', 'Not', 'In', 'Raw'],
  },
  'src/modules/merchants/services/merchant-revenue-analytics.service.ts': {
    imports: ['IsNull'],
  },
  'src/modules/merchants/test/mocks/ad-budget-management.resolver.mock.ts': {
    parameters: ['user', 'user', 'user', 'user'],
  },
  'src/modules/merchants/test/mocks/ad-budget-management.service.mock.ts': {
    parameters: ['merchantId', 'merchantId', 'merchantId'],
    variables: ['impressionCount'],
  },
  'src/modules/merchants/test/mocks/ad-placement.service.mock.ts': {
    parameters: ['options', 'userId', 'sessionId'],
  },
  'src/scripts/test-analytics-services.ts': {
    parameters: ['options'],
  },
  'src/utils/decorator-compatibility.ts': {
    parameters: ['entity', 'index'],
  },
};

// Function to process a file
function processFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const fixes = fixMap[filePath];

  if (!fixes) {
    console.log(`No fixes defined for ${filePath}`);
    return;
  }

  // Fix imports
  if (fixes.imports) {
    for (const importName of fixes.imports) {
      // Match the import but not if it's already prefixed with underscore
      const importRegex = new RegExp(`import [^;]*\\b(?<!_)${importName}\\b[^;]*;`, 'g');
      const importMatches = content.match(importRegex);

      if (importMatches) {
        for (const match of importMatches) {
          const fixed = match.replace(new RegExp(`\\b${importName}\\b`, 'g'), `_${importName}`);
          content = content.replace(match, fixed);
        }
      }

      // Also fix any named imports like { Something }
      const namedImportRegex = new RegExp(
        `import [^;]*{[^}]*\\b(?<!_)${importName}\\b[^}]*}[^;]*;`,
        'g',
      );
      const namedImportMatches = content.match(namedImportRegex);

      if (namedImportMatches) {
        for (const match of namedImportMatches) {
          const fixed = match.replace(
            new RegExp(`\\b${importName}\\b`, 'g'),
            `${importName} as _${importName}`,
          );
          content = content.replace(match, fixed);
        }
      }
    }
  }

  // Fix variables
  if (fixes.variables) {
    for (const varName of fixes.variables) {
      // Match variable declarations but not if already prefixed
      const varRegex = new RegExp(`\\b(?<!_)${varName}\\b\\s*=`, 'g');
      content = content.replace(varRegex, `_${varName} =`);

      // Also fix const/let declarations
      const constRegex = new RegExp(`(const|let)\\s+\\b(?<!_)${varName}\\b`, 'g');
      content = content.replace(constRegex, `$1 _${varName}`);
    }
  }

  // Fix parameters
  if (fixes.parameters) {
    for (const paramName of fixes.parameters) {
      // Match function parameters but not if already prefixed
      const paramRegex = new RegExp(`\\(([^)]*)\\b(?<!_)${paramName}\\b([^)]*)\\)`, 'g');
      content = content.replace(paramRegex, `($1_${paramName}$2)`);

      // Also fix arrow functions
      const arrowRegex = new RegExp(`\\b(?<!_)${paramName}\\b\\s*=>`, 'g');
      content = content.replace(arrowRegex, `_${paramName} =>`);
    }
  }

  // Write the fixed content back to the file
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

// Process all files
for (const filePath of filesToFix) {
  processFile(filePath);
}

console.log('All files processed. Run eslint to verify the fixes.');
