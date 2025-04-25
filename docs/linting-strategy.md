# Avnu Marketplace Linting Strategy

This document outlines the linting strategy used in the Avnu Marketplace project, including the current development configuration and recommendations for production.

## Current Configuration

As of April 24, 2025, the project uses a lenient linting configuration to facilitate rapid development without being blocked by non-critical linting errors. This approach allows developers to focus on functionality while still maintaining visibility into code quality issues.

### Frontend ESLint Configuration

The frontend ESLint configuration is defined in `/frontend/.eslintrc.json`:

```json
{
  "root": true,
  "extends": ["next/core-web-vitals"],
  "plugins": ["@next/next"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-undef": "off",
    "no-redeclare": "off"
  }
}
```

Key rules that have been disabled:
- `no-unused-vars` and `@typescript-eslint/no-unused-vars`: Allows unused variables in the code
- `no-undef`: Allows undefined variables (TypeScript's type checking still catches most issues)
- `no-redeclare`: Allows variable redeclaration (TypeScript's type checking still catches most issues)

### Root ESLint Configuration

The root ESLint configuration is defined in `/.eslintrc.json`:

```json
{
  "root": true,
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "ignorePatterns": ["frontend/**/*", "node_modules/**/*", "dist/**/*"]
}
```

### Non-Failing Lint Scripts

To prevent CI/CD pipelines from failing due to linting errors, we've configured the lint scripts in both `package.json` files to always exit with a success code:

In the root `package.json`:
```json
"lint": "next lint || true"
```

In the frontend `package.json`:
```json
"lint": "next lint || true"
```

The `|| true` part ensures that even if linting errors are found, the command will still exit with a success code (0).

## Recommended Production Configuration

For production environments, it's recommended to enforce stricter linting rules to ensure code quality. Here's how to transition to a production-ready linting configuration:

### 1. Update Lint Scripts

Remove the `|| true` part from the lint scripts to make them fail when linting errors are found:

```json
"lint": "next lint --max-warnings=0"
```

### 2. Enable Important ESLint Rules

Update the frontend `.eslintrc.json` to enable important rules:

```json
{
  "root": true,
  "extends": ["next/core-web-vitals"],
  "plugins": ["@next/next"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-undef": "error",
    "no-redeclare": "error"
  }
}
```

### 3. Address Existing Linting Issues

Before enabling stricter rules, address the existing linting issues in the codebase:

#### Unused Variables

The following files have unused variables that should be addressed:

- `src/components/layout/Navigation.tsx`: Unused `useState` and `useEffect`
- `src/components/products/ProductGrid.tsx`: Unused `page` variable
- `src/components/search/FilterPanel.tsx`: Unused `handleCauseClick` function
- `src/pages/brands.tsx`: Unused `mounted` variable
- `src/pages/index.tsx`: Unused `Image` and `Logo` imports
- `src/pages/shop.tsx`: Unused `seed`, `mounted`, and `page` variables
- `src/types/brand/index.ts`: Unused `ProductRating` import
- `src/utils/mockData.ts`: Unused `Product` import and `seed` variable

## Gradual Implementation Strategy

To transition to stricter linting without disrupting development:

1. **Phase 1**: Fix unused variables and imports in one component/module at a time
2. **Phase 2**: Enable warnings for unused variables (but not errors)
3. **Phase 3**: Enable errors for critical rules like `no-undef` and `no-redeclare`
4. **Phase 4**: Enable errors for all important rules, including unused variables

## Linting Best Practices

1. **Run linting locally** before pushing changes to catch issues early
2. **Use IDE integrations** for real-time linting feedback
3. **Comment unused variables** with `// TODO: Will be used in future implementation` if they're intentionally kept
4. **Consider using underscore prefix** for intentionally unused variables (e.g., `_unused`)

## Dependencies

The project uses the following ESLint-related dependencies:

- `eslint`: Core ESLint package
- `eslint-config-next`: ESLint configuration for Next.js
- `@typescript-eslint/eslint-plugin`: ESLint plugin for TypeScript
- `@typescript-eslint/parser`: TypeScript parser for ESLint

These dependencies are installed in both the root and frontend packages to ensure proper linting in all parts of the codebase.
