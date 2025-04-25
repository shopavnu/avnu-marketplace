# TypeScript and Linting Guide

This document provides guidelines and details about the TypeScript configuration and linting rules used in the Avnu Marketplace project.

## TypeScript Configuration

### Frontend

The frontend uses TypeScript with strict mode enabled. Key configurations include:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Backend

The backend uses TypeScript with NestJS-specific configurations:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

## ESLint Configuration

### Frontend

The frontend uses Next.js ESLint configuration with some custom rules:

```json
{
  "root": true,
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off"
  }
}
```

### Backend

The backend uses a more permissive ESLint configuration with a higher warning threshold:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint/eslint-plugin"],
  "extends": [
    "plugin:@typescript-eslint/recommended"
  ],
  "root": true,
  "env": {
    "node": true,
    "jest": true
  },
  "ignorePatterns": [".eslintrc.js"],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

## Common TypeScript Issues and Solutions

### 1. Implicit 'any' Type Errors

**Problem:** TypeScript complains about variables with implicit 'any' type.

**Solution:** Add explicit type annotations to function parameters, especially in callbacks:

```typescript
// Before - causes error
data.map(item => item.value)

// After - fixed
data.map((item: DataItem) => item.value)
```

### 2. Missing Properties in Interfaces

**Problem:** Objects don't match their interface definitions.

**Solution:** Ensure all required properties are included:

```typescript
// Interface definition
interface Product {
  id: string;
  title: string;
  slug: string;  // Required property
  categories: string[];  // Required property
}

// Correct implementation
const product: Product = {
  id: "1",
  title: "Product Name",
  slug: "product-name",
  categories: ["Category1", "Category2"]
};
```

### 3. Null/Undefined Handling

**Problem:** Properties might be undefined or null, causing runtime errors.

**Solution:** Use default values or optional chaining:

```typescript
// Using default values
const data = fetchData() || { value: 0 };

// Using optional chaining
const value = data?.value;
```

### 4. Chart.js and Visualization Libraries

**Problem:** Strict typing with visualization libraries like Chart.js.

**Solution:** Always return properly typed objects, never null:

```typescript
// Before - causes error
return hasData ? chartData : null;

// After - fixed
return hasData ? chartData : { labels: [], datasets: [] };
```

## Best Practices

1. **Always define interfaces** for data structures, especially for API responses and component props.
2. **Use explicit type annotations** for function parameters and return types.
3. **Avoid using `any` type** unless absolutely necessary.
4. **Handle null and undefined values** properly with optional chaining and default values.
5. **Run TypeScript checks and linting** before committing code.

## Running Checks

### Frontend

```bash
# Check TypeScript errors
cd frontend
npm run build

# Check linting errors
npm run lint
```

### Backend

```bash
# Check TypeScript errors
cd backend
npm run build

# Check linting errors (allows up to 50 warnings)
npm run lint
```

## Troubleshooting Common Errors

### "Cannot find module" or "Cannot find name"

1. Check import paths and make sure the module exists
2. Verify that the type definition is imported or defined
3. Check for typos in import statements or variable names

### "Property does not exist on type"

1. Make sure the property is defined in the interface
2. Check for typos in property names
3. Use optional chaining (`?.`) for properties that might not exist

### "Type 'X' is not assignable to type 'Y'"

1. Make sure the object has all required properties
2. Check for type mismatches (e.g., string vs. number)
3. Use type assertions if necessary (but avoid if possible)
