# TypeScript Best Practices for Avnu Marketplace

This document outlines the TypeScript best practices implemented in the Avnu Marketplace codebase, particularly focusing on the search functionality. Following these guidelines will help maintain type safety and prevent common errors.

## Table of Contents

1. [Import Patterns](#import-patterns)
2. [Interface Design](#interface-design)
3. [Type Safety](#type-safety)
4. [Error Handling](#error-handling)
5. [GraphQL Type Definitions](#graphql-type-definitions)
6. [Configuration](#configuration)

## Import Patterns

### Default Imports vs Namespace Imports

When importing modules that have a default export, use default imports instead of namespace imports to avoid TypeScript errors:

```typescript
// ✅ Correct
import axios from 'axios';
import request from 'supertest';
import OAuth from 'oauth-1.0a';

// ❌ Incorrect - will cause TypeScript errors when calling or constructing
import * as axios from 'axios';
import * as request from 'supertest';
import * as OAuth from 'oauth-1.0a';
```

If you encounter TypeScript errors with default imports, ensure that `esModuleInterop` is enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    // other options...
  }
}
```

### Workaround for Problematic Modules

If you encounter modules that don't work well with either import pattern, you can use this workaround:

```typescript
import * as axios from 'axios';
const { default: axiosDefault } = axios as any;

// Then use axiosDefault instead of axios
const response = await axiosDefault.post('/api/endpoint', data);
```

## Interface Design

### GraphQL Response Interfaces

For GraphQL responses, define interfaces that match the exact structure returned by the API:

```typescript
// Define the base entity types
interface ProductSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  brandName: string;
  score?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Define the actual response structure
interface ProductSearchResponse {
  query: string;
  products: ProductSearchResult[];
  pagination: PaginationInfo;
  facets?: SearchFacets;
}

// Define the wrapper structure that matches the GraphQL response
interface ProductSearchResponseWrapper {
  searchProducts: ProductSearchResponse;
}

// Use the wrapper type in your GraphQL query function
const result = await executeGraphQLQuery<ProductSearchResponseWrapper>(query, variables);

// Access the data with proper type safety
if (result.data && result.data.searchProducts) {
  const searchResult = result.data.searchProducts;
  console.log(`Found ${searchResult.products.length} products`);
}
```

### Generic Response Types

Use generics for reusable response types:

```typescript
interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

async function executeGraphQLQuery<T>(query: string, variables?: any): Promise<GraphQLResponse<T>> {
  // Implementation...
}
```

## Type Safety

### Null and Undefined Checks

Always check for null or undefined values before accessing properties:

```typescript
// ✅ Correct
if (result.data && result.data.searchProducts) {
  const searchResult = result.data.searchProducts;
  // Now it's safe to access searchResult properties
}

// ❌ Incorrect - may cause runtime errors
const searchResult = result.data.searchProducts;
console.log(searchResult.products.length); // Error if searchProducts is undefined
```

### Type Assertions

Use type assertions only when you're certain about the type:

```typescript
// ✅ Correct - when you know the structure
const response = await axios.post('/api/endpoint');
return response.data as GraphQLResponse<T>;

// ❌ Incorrect - unsafe assertion that might cause runtime errors
const searchResult = result.data.searchProducts as ProductSearchResponse;
```

## Error Handling

### GraphQL Error Handling

Handle GraphQL errors properly:

```typescript
try {
  const result = await executeGraphQLQuery<ProductSearchResponseWrapper>(query, variables);
  
  if (result.errors && result.errors.length > 0) {
    console.error('GraphQL errors:', result.errors);
    // Handle errors appropriately
    return null;
  }
  
  if (!result.data || !result.data.searchProducts) {
    console.error('No data returned from GraphQL query');
    return null;
  }
  
  return result.data.searchProducts;
} catch (error) {
  console.error('Failed to execute GraphQL query:', error.message);
  throw error;
}
```

### HTTP Request Error Handling

Handle HTTP request errors with proper typing:

```typescript
interface CustomAxiosError {
  response?: {
    data?: {
      errors?: GraphQLError[] | unknown[];
    };
  };
  message: string;
}

try {
  const response = await axios.post('/api/endpoint', data);
  return response.data;
} catch (error) {
  const axiosError = error as CustomAxiosError;
  console.error(
    'Request failed:',
    axiosError.response?.data?.errors || axiosError.message
  );
  throw error;
}
```

## GraphQL Type Definitions

### Input Types

Define proper input types for GraphQL queries:

```typescript
interface SearchOptionsInput {
  query?: string;
  page?: number;
  limit?: number;
  enableNlp?: boolean;
  enableHighlighting?: boolean;
  filters?: Record<string, string[]>;
  rangeFilters?: Array<{
    field: string;
    min?: number;
    max?: number;
  }>;
}
```

### Union Types

Use union types for multi-entity search results:

```typescript
type SearchResult = ProductSearchResult | MerchantSearchResult | BrandSearchResult;

interface MultiEntitySearchResponse {
  query: string;
  results: SearchResult[];
  pagination: PaginationInfo;
  entityDistribution: {
    products: number;
    merchants: number;
    brands: number;
  };
}
```

## Configuration

### TypeScript Configuration

Ensure your `tsconfig.json` has these settings for optimal type safety:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Running TypeScript Checks

Run TypeScript checks regularly to catch type errors:

```bash
# Check all TypeScript files
npm run tsc -- --noEmit

# Check specific files
npx tsc --noEmit path/to/file.ts

# Run with transpile-only for development
npx ts-node --transpile-only path/to/file.ts
```

## Conclusion

Following these TypeScript best practices will help maintain a robust and type-safe codebase for the Avnu Marketplace. These guidelines should be followed when making changes to the search functionality or any other part of the application.
