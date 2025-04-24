"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const ts = __importStar(require("typescript"));
const parseEslintOutput = (output) => {
    const fileWarnings = new Map();
    const lines = output.split('\n');
    let currentFile = '';
    for (const line of lines) {
        const fileMatch = line.match(/^\/(.+?):\s*$/);
        if (fileMatch) {
            currentFile = '/' + fileMatch[1];
            fileWarnings.set(currentFile, []);
            continue;
        }
        const warningMatch = line.match(/^\s+\d+:\d+\s+warning\s+'(.+?)'\s+is\s+defined\s+but\s+never\s+used/);
        if (warningMatch && currentFile) {
            const warnings = fileWarnings.get(currentFile) || [];
            warnings.push(warningMatch[1]);
            fileWarnings.set(currentFile, warnings);
        }
    }
    return fileWarnings;
};
const fixUnusedVars = (filePath, unusedVars) => {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    sourceFile.statements.forEach(statement => {
        if (ts.isImportDeclaration(statement)) {
            const namedBindings = statement.importClause?.namedBindings;
            if (namedBindings && ts.isNamedImports(namedBindings)) {
                namedBindings.elements.forEach(element => {
                    const importName = element.name.text;
                    if (unusedVars.includes(importName)) {
                        const start = element.getStart(sourceFile);
                        const end = element.getEnd();
                        const replacement = importName === importName.charAt(0).toUpperCase() + importName.slice(1)
                            ? `/* ${importName} */`
                            : `${importName} as _${importName}`;
                        content = content.substring(0, start) + replacement + content.substring(end);
                    }
                });
            }
        }
    });
    const fixFunctionParams = (node) => {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ||
            ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
            node.parameters.forEach(param => {
                if (param.name && ts.isIdentifier(param.name)) {
                    const paramName = param.name.text;
                    if (unusedVars.includes(paramName) && !paramName.startsWith('_')) {
                        const start = param.name.getStart(sourceFile);
                        const end = param.name.getEnd();
                        content = content.substring(0, start) + `_${paramName}` + content.substring(end);
                    }
                }
            });
        }
        ts.forEachChild(node, fixFunctionParams);
    };
    fixFunctionParams(sourceFile);
    fs.writeFileSync(filePath, content, 'utf-8');
};
const runEslint = () => {
    const { execSync } = require('child_process');
    try {
        return execSync('npx eslint "{src,apps,libs,test}/**/*.ts" --format stylish', { encoding: 'utf-8' });
    }
    catch (error) {
        return error.stdout;
    }
};
const main = () => {
    console.log('Running ESLint to identify warnings...');
    const eslintOutput = runEslint();
    const fileWarnings = parseEslintOutput(eslintOutput);
    console.log(`Found ${fileWarnings.size} files with unused variable warnings`);
    for (const [filePath, unusedVars] of fileWarnings.entries()) {
        if (unusedVars.length > 0) {
            fixUnusedVars(filePath, unusedVars);
        }
    }
    console.log('Done! Re-run ESLint to verify fixes.');
};
main();
//# sourceMappingURL=fix-lint-warnings.js.map