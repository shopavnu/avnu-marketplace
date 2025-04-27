/**
 * test-mock-search.ts
 *
 * A simplified test script for testing the mock search server
 * This script is designed to work with the mock-search-server.ts
 */
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3001/graphql';

// Define response type
interface GraphQLResponse {
  data: {
    searchProducts?: {
      query: string;
      processedQuery?: string;
      products: Array<{
        id: string;
        title: string;
        description?: string;
        price: number;
        brandName: string;
      }>;
      pagination: {
        total: number;
        page: number;
        limit: number;
        hasNext?: boolean;
        hasPrevious?: boolean;
      };
      facets?: {
        categories?: Array<{ name: string; count: number }>;
        brands?: Array<{ name: string; count: number }>;
        colors?: Array<{ name: string; count: number }>;
        price?: { min: number; max: number };
      };
      nlpMetadata?: {
        recognizedEntities?: Record<string, string[]>;
        expandedTerms?: string[];
        detectedIntent?: string;
        confidence?: number;
        processingTimeMs?: number;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

// Simple function to execute GraphQL queries
async function executeQuery(query: string, variables: any): Promise<GraphQLResponse> {
  try {
    const response = await axios.post(
      API_URL,
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data as GraphQLResponse;
  } catch (error: any) {
    console.error('Error executing GraphQL query:', error.message);
    if (error.response?.data?.errors) {
      console.error('GraphQL errors:', error.response.data.errors);
    }
    throw error;
  }
}

// Test basic product search
async function testBasicSearch(query: string) {
  console.log(`\n=== Testing basic search for: "${query}" ===`);

  const graphqlQuery = `
    query ProductSearch($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        products {
          id
          title
          description
          price
          brandName
        }
        pagination {
          total
          page
          limit
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 5,
      page: 1,
    },
  };

  try {
    const result = await executeQuery(graphqlQuery, variables);
    const searchResult = result.data.searchProducts;

    console.log(
      `Found ${searchResult.pagination.total} products for query "${searchResult.query}"`,
    );

    if (searchResult.products.length > 0) {
      console.log('\nTop results:');
      searchResult.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
      });
    } else {
      console.log('No products found');
    }
  } catch (error) {
    console.error('Search failed:', error.message);
  }
}

// Test NLP-enhanced search
async function testNlpSearch(query: string) {
  console.log(`\n=== Testing NLP-enhanced search for: "${query}" ===`);

  const graphqlQuery = `
    query NlpSearch($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        processedQuery
        products {
          id
          title
          price
          brandName
        }
        pagination {
          total
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 5,
      page: 1,
      enableNlp: true,
    },
  };

  try {
    const result = await executeQuery(graphqlQuery, variables);
    const searchResult = result.data.searchProducts;

    console.log(
      `Found ${searchResult.pagination.total} products for query "${searchResult.query}"`,
    );

    if (searchResult.processedQuery && searchResult.processedQuery !== searchResult.query) {
      console.log(`Processed query: "${searchResult.processedQuery}"`);
    }

    // Note: NLP metadata is not available in the current schema
    console.log('\nNote: NLP metadata is not exposed in the current GraphQL schema');
    console.log(
      'To see NLP features, we would need to update the schema to include nlpMetadata field',
    );

    if (searchResult.products.length > 0) {
      console.log('\nTop results:');
      searchResult.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
      });
    } else {
      console.log('No products found');
    }
  } catch (error) {
    console.error('NLP search failed:', error.message);
  }
}

// Test faceted search
async function testFacetedSearch(query: string): Promise<void> {
  console.log(`\n=== Testing faceted search for: "${query}" ===`);

  const graphqlQuery = `
    query FacetedSearch($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        products {
          id
        }
        pagination {
          total
        }
        facets {
          categories {
            name
            count
          }
          brands {
            name
            count
          }
          price {
            min
            max
          }
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 0,
      page: 1,
    },
  };

  try {
    const result = await executeQuery(graphqlQuery, variables);

    if (!result.data.searchProducts) {
      console.error('Faceted search failed: No search results returned');
      return;
    }

    const searchResult = result.data.searchProducts;

    console.log(
      `Found ${searchResult.pagination.total} products for query "${searchResult.query}"`,
    );

    if (searchResult.facets) {
      console.log('\nFacets:');

      if (searchResult.facets.categories && searchResult.facets.categories.length > 0) {
        console.log('\nCategories:');
        searchResult.facets.categories.forEach(cat => {
          console.log(`  ${cat.name} (${cat.count})`);
        });
      }

      if (searchResult.facets.brands && searchResult.facets.brands.length > 0) {
        console.log('\nBrands:');
        searchResult.facets.brands.forEach(brand => {
          console.log(`  ${brand.name} (${brand.count})`);
        });
      }

      // Colors facet is not available in the current schema
      console.log('\nNote: Color facets are not exposed in the current GraphQL schema');

      if (searchResult.facets.price) {
        console.log(
          `\nPrice Range: $${searchResult.facets.price.min.toFixed(2)} - $${searchResult.facets.price.max.toFixed(2)}`,
        );
      }
    }
  } catch (error) {
    console.error('Faceted search failed:', error.message);
  }
}

// Test filtered search
async function testFilteredSearch(query: string, brandFilter: string) {
  console.log(`\n=== Testing filtered search for: "${query}" with brand: "${brandFilter}" ===`);

  const graphqlQuery = `
    query FilteredSearch($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        products {
          id
          title
          price
          brandName
        }
        pagination {
          total
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 5,
      page: 1,
      filters: [
        {
          field: 'brandName',
          values: [brandFilter],
          exact: true,
        },
      ],
    },
  };

  try {
    const result = await executeQuery(graphqlQuery, variables);
    const searchResult = result.data.searchProducts;

    console.log(
      `Found ${searchResult.pagination.total} ${brandFilter} products for query "${searchResult.query}"`,
    );

    if (searchResult.products.length > 0) {
      console.log('\nFiltered results:');
      searchResult.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
      });
    } else {
      console.log(`No ${brandFilter} products found`);
    }
  } catch (error) {
    console.error('Filtered search failed:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const query = args[0] || 'shoes';

  console.log('=== MOCK SEARCH SERVER TEST ===');
  console.log('Make sure the mock search server is running on port 3001');

  try {
    // Test basic search
    await testBasicSearch(query);

    // Test NLP-enhanced search
    await testNlpSearch(query);

    // Test faceted search
    await testFacetedSearch(query);

    // Test filtered search (if brand specified)
    if (args[1]) {
      await testFilteredSearch(query, args[1]);
    } else {
      // Use a default brand filter
      await testFilteredSearch(query, 'Nike');
    }

    console.log('\n=== All tests completed successfully ===');
  } catch (error) {
    console.error('\nTest suite failed:', error.message);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
