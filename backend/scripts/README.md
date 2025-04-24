# Avnu Marketplace Search Scripts

This directory contains utility scripts for the Avnu Marketplace search functionality. These scripts help with indexing data into Elasticsearch and testing the GraphQL search API.

## Available Scripts

### `index-all-entities.ts`

This script indexes all entities (products, merchants, brands) into Elasticsearch.

#### Usage

```bash
# Run with ts-node
npx ts-node scripts/index-all-entities.ts

# Or use the npm script
npm run index-all-entities
```

#### Features

- Indexes products, merchants, and brands into Elasticsearch
- Creates appropriate mappings for each entity type
- Handles bulk indexing for better performance
- Provides progress feedback during indexing
- Implements error handling and retries

### `test-graphql-search.ts`

This script tests the GraphQL search API with various queries and filters.

#### Usage

```bash
# Run with ts-node
npx ts-node scripts/test-graphql-search.ts

# Or use the npm script
npm run test-graphql-search
```

#### Features

- Tests basic product search with different queries
- Tests filtered product search with price ranges and brand filters
- Tests facet generation and handling
- Provides detailed output of search results

### `test-graphql-search-fixed.ts`

An improved version of the test-graphql-search script with better TypeScript type safety.

#### Usage

```bash
# Run with ts-node
npx ts-node scripts/test-graphql-search-fixed.ts

# Or use the npm script
npm run test-graphql-search-fixed
```

#### Features

- Enhanced type safety with proper TypeScript interfaces
- Improved error handling for GraphQL queries
- More comprehensive testing of multi-entity search
- Better code organization and readability

## Common Issues and Solutions

### TypeScript Import Issues

If you encounter TypeScript errors related to imports, ensure you're using the correct import pattern:

```typescript
// Correct
import request from 'supertest';
import OAuth from 'oauth-1.0a';
import axios from 'axios';

// If you still have issues, use this workaround
import * as axios from 'axios';
const { default: axiosDefault } = axios as any;
```

### GraphQL Response Type Issues

If you encounter TypeScript errors related to GraphQL response types, ensure your interfaces match the exact structure of the GraphQL response:

```typescript
// Define the wrapper interface that matches the GraphQL response
interface ProductSearchResponseWrapper {
  searchProducts: {
    query: string;
    products: ProductSearchResult[];
    pagination: PaginationInfo;
    facets?: SearchFacets;
  };
}

// Use the wrapper type in your GraphQL query function
const result = await executeGraphQLQuery<ProductSearchResponseWrapper>(query, variables);

// Access the data with proper type safety
if (result.data && result.data.searchProducts) {
  const searchResult = result.data.searchProducts;
  console.log(`Found ${searchResult.products.length} products`);
}
```

### Running Scripts with Type Checking Issues

If you encounter TypeScript errors that you can't immediately fix, you can run the scripts with the `--transpile-only` flag:

```bash
npx ts-node --transpile-only scripts/test-graphql-search-fixed.ts
```

This will bypass type checking and allow the script to run if the runtime code is correct.

## Best Practices

For more detailed TypeScript best practices, see the [TypeScript Best Practices](../docs/typescript-best-practices.md) documentation.

## Adding New Scripts

When adding new scripts to this directory, please follow these guidelines:

1. Use TypeScript for all scripts
2. Implement proper error handling
3. Provide clear console output for user feedback
4. Document the script in this README
5. Add an npm script in package.json if appropriate

## Running Scripts in Production

These scripts are primarily intended for development and testing purposes. If you need to run these scripts in a production environment, consider:

1. Building the scripts with `tsc` before running them
2. Using environment variables for configuration
3. Implementing proper logging instead of console output
4. Adding additional error handling and recovery mechanisms
