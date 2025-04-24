/**
 * test-nlp-search.ts
 * 
 * This script tests the NLP-enhanced search capabilities of the Avnu Marketplace
 * It evaluates entity recognition, query expansion, intent detection, and semantic search
 */
import axios from 'axios';
import * as readline from 'readline';

// Configuration
const API_URL = 'http://localhost:3001/graphql';

// Check if server is available before running queries
async function checkServerAvailability(): Promise<boolean> {
  try {
    await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    return true;
  } catch (error) {
    // Try the GraphQL endpoint directly as a fallback
    try {
      await axios.post(API_URL, {
        query: `{ __schema { queryType { name } } }`
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      return true;
    } catch (innerError) {
      return false;
    }
  }
}

// Define types for GraphQL responses
interface ProductSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  brandName: string;
  imageUrl?: string;
  highlights?: string[];
}

interface MerchantSearchResult {
  id: string;
  name: string;
}

interface BrandSearchResult {
  id: string;
  name: string;
}

interface CategoryFacet {
  name: string;
  count: number;
}

interface TermFacet {
  name: string;
  count: number;
}

interface PriceFacet {
  min: number;
  max: number;
}

interface SearchFacets {
  categories: CategoryFacet[];
  brands: TermFacet[];
  price?: PriceFacet;
  colors?: TermFacet[];
  materials?: TermFacet[];
  sizes?: TermFacet[];
  styles?: TermFacet[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ProductSearchResponse {
  query: string;
  processedQuery?: string;
  products: ProductSearchResult[];
  pagination: PaginationInfo;
  facets?: SearchFacets;
  nlpMetadata?: NlpMetadata;
}

interface AllEntitySearchResponse {
  query: string;
  processedQuery?: string;
  experimentVariant?: string;
  pagination: PaginationInfo;
  facets?: SearchFacets;
  products: ProductSearchResult[];
  merchants: MerchantSearchResult[];
  brands: BrandSearchResult[];
  nlpMetadata?: NlpMetadata;
}

interface NlpMetadata {
  recognizedEntities?: {
    [entityType: string]: string[];
  };
  expandedTerms?: string[];
  detectedIntent?: string;
  confidence?: number;
  processingTimeMs?: number;
}

interface GraphQLResponse<T> {
  data: {
    searchProducts?: T;
    searchAll?: T;
    [key: string]: any;
  };
  errors?: unknown[];
}

interface CustomAxiosError extends Error {
  response?: {
    data: any;
    status: number;
    headers: any;
  };
}

// Helper function to execute GraphQL queries
async function executeGraphQLQuery<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
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
      }
    );

    return response.data as GraphQLResponse<T>;
  } catch (error) {
    const axiosError = error as CustomAxiosError;
    console.error('GraphQL query error:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}

// Function to perform a search with NLP processing enabled
async function performNlpSearch(query: string): Promise<GraphQLResponse<ProductSearchResponse>> {
  const graphqlQuery = `
    query SearchWithNlp($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        processedQuery
        products {
          id
          title
          description
          price
          brandName
          imageUrl
        }
        pagination {
          total
          page
          limit
          hasNext
          hasPrevious
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
          colors {
            name
            count
          }
          materials {
            name
            count
          }
          sizes {
            name
            count
          }
        }
        nlpMetadata {
          recognizedEntities
          expandedTerms
          detectedIntent
          confidence
          processingTimeMs
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 10,
      page: 1,
      enableNlp: true,
      enableHighlighting: true,
    },
  };

  return await executeGraphQLQuery<ProductSearchResponse>(graphqlQuery, variables);
}

// Function to perform a search without NLP processing for comparison
async function performStandardSearch(query: string): Promise<GraphQLResponse<ProductSearchResponse>> {
  const graphqlQuery = `
    query StandardSearch($input: SearchOptionsInput!) {
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
      limit: 10,
      page: 1,
      enableNlp: false,
    },
  };

  return await executeGraphQLQuery<ProductSearchResponse>(graphqlQuery, variables);
}

// Function to display search results with NLP metadata
function displayNlpSearchResults(result: GraphQLResponse<ProductSearchResponse>): void {
  if (!result.data.searchProducts) {
    console.log('No search results returned');
    return;
  }

  const searchResult = result.data.searchProducts;
  
  console.log('\n=== NLP-ENHANCED SEARCH RESULTS ===');
  console.log(`Original Query: "${searchResult.query}"`);
  
  if (searchResult.processedQuery && searchResult.processedQuery !== searchResult.query) {
    console.log(`Processed Query: "${searchResult.processedQuery}"`);
  }
  
  console.log(`Total Results: ${searchResult.pagination.total}`);
  
  // Display NLP metadata if available
  if (searchResult.nlpMetadata) {
    console.log('\n=== NLP METADATA ===');
    
    if (searchResult.nlpMetadata.recognizedEntities) {
      console.log('\nRecognized Entities:');
      for (const [entityType, entities] of Object.entries(searchResult.nlpMetadata.recognizedEntities)) {
        console.log(`  ${entityType}: ${entities.join(', ')}`);
      }
    }
    
    if (searchResult.nlpMetadata.expandedTerms && searchResult.nlpMetadata.expandedTerms.length > 0) {
      console.log('\nExpanded Terms:', searchResult.nlpMetadata.expandedTerms.join(', '));
    }
    
    if (searchResult.nlpMetadata.detectedIntent) {
      console.log('\nDetected Intent:', searchResult.nlpMetadata.detectedIntent);
      if (searchResult.nlpMetadata.confidence !== undefined) {
        console.log(`Confidence: ${(searchResult.nlpMetadata.confidence * 100).toFixed(2)}%`);
      }
    }
    
    if (searchResult.nlpMetadata.processingTimeMs !== undefined) {
      console.log(`\nNLP Processing Time: ${searchResult.nlpMetadata.processingTimeMs}ms`);
    }
  }
  
  // Display product results
  console.log('\n=== PRODUCTS ===');
  if (searchResult.products.length > 0) {
    searchResult.products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title} ($${product.price.toFixed(2)})`);
      console.log(`   Brand: ${product.brandName}`);
      // Highlights are not available in our mock server implementation
    });
  } else {
    console.log('No products found');
  }
  
  // Display facet information
  if (searchResult.facets) {
    console.log('\n=== FACETS ===');
    
    if (searchResult.facets.categories && searchResult.facets.categories.length > 0) {
      console.log('\nCategories:');
      searchResult.facets.categories.slice(0, 5).forEach(c => 
        console.log(`  ${c.name} (${c.count})`)
      );
    }
    
    if (searchResult.facets.brands && searchResult.facets.brands.length > 0) {
      console.log('\nBrands:');
      searchResult.facets.brands.slice(0, 5).forEach(b => 
        console.log(`  ${b.name} (${b.count})`)
      );
    }
    
    if (searchResult.facets.colors && searchResult.facets.colors.length > 0) {
      console.log('\nColors:');
      searchResult.facets.colors.slice(0, 5).forEach(c => 
        console.log(`  ${c.name} (${c.count})`)
      );
    }
    
    if (searchResult.facets.materials && searchResult.facets.materials.length > 0) {
      console.log('\nMaterials:');
      searchResult.facets.materials.slice(0, 5).forEach(m => 
        console.log(`  ${m.name} (${m.count})`)
      );
    }
    
    if (searchResult.facets.price) {
      console.log(`\nPrice Range: $${searchResult.facets.price.min.toFixed(2)} - $${searchResult.facets.price.max.toFixed(2)}`);
    }
  }
}

// Function to compare NLP vs standard search results
async function compareSearchResults(query: string): Promise<void> {
  console.log(`\n=== COMPARING SEARCH RESULTS FOR: "${query}" ===\n`);
  
  // Get results with and without NLP
  const nlpResults = await performNlpSearch(query);
  const standardResults = await performStandardSearch(query);
  
  if (!nlpResults.data.searchProducts || !standardResults.data.searchProducts) {
    console.log('Error: Could not retrieve search results for comparison');
    return;
  }
  
  const nlpSearch = nlpResults.data.searchProducts;
  const stdSearch = standardResults.data.searchProducts;
  
  // Compare result counts
  console.log('=== RESULT COUNT COMPARISON ===');
  console.log(`Standard Search: ${stdSearch.pagination.total} results`);
  console.log(`NLP-Enhanced Search: ${nlpSearch.pagination.total} results`);
  console.log(`Difference: ${nlpSearch.pagination.total - stdSearch.pagination.total} results`);
  
  // Compare top products
  console.log('\n=== TOP RESULTS COMPARISON ===');
  
  // Get product IDs from both searches
  const stdProductIds = stdSearch.products.map(p => p.id);
  const nlpProductIds = nlpSearch.products.map(p => p.id);
  
  // Find products that appear in NLP results but not in standard results
  const uniqueToNlp = nlpSearch.products.filter(p => !stdProductIds.includes(p.id));
  
  // Find products that appear in standard results but not in NLP results
  const uniqueToStd = stdSearch.products.filter(p => !nlpProductIds.includes(p.id));
  
  // Find products that appear in both but in different positions
  const commonProducts = nlpSearch.products.filter(p => stdProductIds.includes(p.id));
  
  console.log(`\nProducts unique to NLP search: ${uniqueToNlp.length}`);
  if (uniqueToNlp.length > 0) {
    uniqueToNlp.forEach((product, i) => {
      console.log(`  ${i+1}. ${product.title} ($${product.price.toFixed(2)})`);
    });
  }
  
  console.log(`\nProducts unique to standard search: ${uniqueToStd.length}`);
  if (uniqueToStd.length > 0) {
    uniqueToStd.forEach((product, i) => {
      console.log(`  ${i+1}. ${product.title} ($${product.price.toFixed(2)})`);
    });
  }
  
  console.log(`\nProducts in both searches: ${commonProducts.length}`);
  
  // Display NLP metadata for reference
  if (nlpSearch.nlpMetadata) {
    console.log('\n=== NLP PROCESSING DETAILS ===');
    
    if (nlpSearch.processedQuery && nlpSearch.processedQuery !== query) {
      console.log(`Original query: "${query}"`);
      console.log(`Processed query: "${nlpSearch.processedQuery}"`);
    }
    
    if (nlpSearch.nlpMetadata.recognizedEntities) {
      console.log('\nRecognized Entities:');
      for (const [entityType, entities] of Object.entries(nlpSearch.nlpMetadata.recognizedEntities)) {
        console.log(`  ${entityType}: ${entities.join(', ')}`);
      }
    }
    
    if (nlpSearch.nlpMetadata.expandedTerms && nlpSearch.nlpMetadata.expandedTerms.length > 0) {
      console.log('\nExpanded Terms:', nlpSearch.nlpMetadata.expandedTerms.join(', '));
    }
    
    if (nlpSearch.nlpMetadata.processingTimeMs !== undefined) {
      console.log(`\nNLP Processing Time: ${nlpSearch.nlpMetadata.processingTimeMs}ms`);
    }
  }
}

// Sample test queries that demonstrate different NLP capabilities
const testQueries = [
  "red nike shoes",                   // Basic entity recognition (color + brand + product)
  "summer dresses under $50",         // Price filtering + seasonal intent
  "comfortable running shoes",        // Product attribute + activity intent
  "business casual men's attire",     // Style + gender intent
  "waterproof hiking boots",          // Product attribute + activity
  "gifts for mom",                    // Occasion/intent detection
  "similar to north face jacket",     // Similarity/recommendation intent
  "breathable workout clothes",       // Material property + activity
  "evening gown for wedding",         // Occasion + formal wear
  "sustainable eco-friendly products" // Ethical shopping intent
];

// Interactive CLI for testing NLP search
async function runInteractiveMode(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n=== AVNU MARKETPLACE NLP SEARCH TESTER ===');
  console.log('Enter a search query or choose from the following options:');
  console.log('1. Run all test queries');
  console.log('2. Compare NLP vs standard search');
  console.log('3. Exit');
  
  const promptUser = () => {
    rl.question('\nEnter your choice or search query: ', async (input) => {
      if (input === '1') {
        // Run all test queries
        console.log('\n=== RUNNING ALL TEST QUERIES ===');
        for (const query of testQueries) {
          console.log(`\n\nTesting query: "${query}"`);
          try {
            const result = await performNlpSearch(query);
            displayNlpSearchResults(result);
          } catch (error) {
            console.error(`Error testing query "${query}":`, error);
          }
        }
        promptUser();
      } else if (input === '2') {
        // Compare NLP vs standard search
        rl.question('\nEnter query to compare: ', async (query) => {
          try {
            await compareSearchResults(query);
          } catch (error) {
            console.error('Error comparing search results:', error);
          }
          promptUser();
        });
      } else if (input === '3' || input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        // Exit
        rl.close();
        return;
      } else if (input.trim()) {
        // Perform search with the input query
        try {
          const result = await performNlpSearch(input);
          displayNlpSearchResults(result);
        } catch (error) {
          console.error('Error performing search:', error);
        }
        promptUser();
      } else {
        promptUser();
      }
    });
  };
  
  promptUser();
}

// Main function
async function main(): Promise<void> {
  // Check if server is available
  const isServerAvailable = await checkServerAvailability();
  if (!isServerAvailable) {
    console.error('\nERROR: Cannot connect to the GraphQL server at ' + API_URL);
    console.error('Please make sure the server is running and try again.');
    console.error('You may need to:');
    console.error('1. Start your NestJS server');
    console.error('2. Check that the API_URL in this script is correct');
    console.error('3. Ensure your server has the GraphQL endpoint enabled');
    process.exit(1);
  }
  
  console.log('Successfully connected to the GraphQL server!');
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments, run interactive mode
    await runInteractiveMode();
  } else if (args[0] === '--all') {
    // Run all test queries
    for (const query of testQueries) {
      console.log(`\n\nTesting query: "${query}"`);
      try {
        const result = await performNlpSearch(query);
        displayNlpSearchResults(result);
      } catch (error) {
        console.error(`Error testing query "${query}":`, error);
      }
    }
  } else if (args[0] === '--compare' && args[1]) {
    // Compare NLP vs standard search
    await compareSearchResults(args[1]);
  } else {
    // Treat arguments as a search query
    const query = args.join(' ');
    try {
      const result = await performNlpSearch(query);
      displayNlpSearchResults(result);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
