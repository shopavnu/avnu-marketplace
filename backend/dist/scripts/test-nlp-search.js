'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const axios_1 = __importDefault(require('axios'));
const readline = __importStar(require('readline'));
const API_URL = 'http://localhost:3001/graphql';
async function checkServerAvailability() {
  try {
    await axios_1.default.get('http://localhost:3001/health', {
      timeout: 5000,
    });
    return true;
  } catch (error) {
    try {
      await axios_1.default.post(
        API_URL,
        {
          query: `{ __schema { queryType { name } } }`,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
      );
      return true;
    } catch (innerError) {
      return false;
    }
  }
}
async function executeGraphQLQuery(query, variables) {
  try {
    const response = await axios_1.default.post(
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
    return response.data;
  } catch (error) {
    const axiosError = error;
    console.error('GraphQL query error:', axiosError.response?.data || axiosError.message);
    throw error;
  }
}
async function performNlpSearch(query) {
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
  return await executeGraphQLQuery(graphqlQuery, variables);
}
async function performStandardSearch(query) {
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
  return await executeGraphQLQuery(graphqlQuery, variables);
}
function displayNlpSearchResults(result) {
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
  if (searchResult.nlpMetadata) {
    console.log('\n=== NLP METADATA ===');
    if (searchResult.nlpMetadata.recognizedEntities) {
      console.log('\nRecognized Entities:');
      for (const [entityType, entities] of Object.entries(
        searchResult.nlpMetadata.recognizedEntities,
      )) {
        console.log(`  ${entityType}: ${entities.join(', ')}`);
      }
    }
    if (
      searchResult.nlpMetadata.expandedTerms &&
      searchResult.nlpMetadata.expandedTerms.length > 0
    ) {
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
  console.log('\n=== PRODUCTS ===');
  if (searchResult.products.length > 0) {
    searchResult.products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title} ($${product.price.toFixed(2)})`);
      console.log(`   Brand: ${product.brandName}`);
    });
  } else {
    console.log('No products found');
  }
  if (searchResult.facets) {
    console.log('\n=== FACETS ===');
    if (searchResult.facets.categories && searchResult.facets.categories.length > 0) {
      console.log('\nCategories:');
      searchResult.facets.categories
        .slice(0, 5)
        .forEach(c => console.log(`  ${c.name} (${c.count})`));
    }
    if (searchResult.facets.brands && searchResult.facets.brands.length > 0) {
      console.log('\nBrands:');
      searchResult.facets.brands.slice(0, 5).forEach(b => console.log(`  ${b.name} (${b.count})`));
    }
    if (searchResult.facets.colors && searchResult.facets.colors.length > 0) {
      console.log('\nColors:');
      searchResult.facets.colors.slice(0, 5).forEach(c => console.log(`  ${c.name} (${c.count})`));
    }
    if (searchResult.facets.materials && searchResult.facets.materials.length > 0) {
      console.log('\nMaterials:');
      searchResult.facets.materials
        .slice(0, 5)
        .forEach(m => console.log(`  ${m.name} (${m.count})`));
    }
    if (searchResult.facets.price) {
      console.log(
        `\nPrice Range: $${searchResult.facets.price.min.toFixed(2)} - $${searchResult.facets.price.max.toFixed(2)}`,
      );
    }
  }
}
async function compareSearchResults(query) {
  console.log(`\n=== COMPARING SEARCH RESULTS FOR: "${query}" ===\n`);
  const nlpResults = await performNlpSearch(query);
  const standardResults = await performStandardSearch(query);
  if (!nlpResults.data.searchProducts || !standardResults.data.searchProducts) {
    console.log('Error: Could not retrieve search results for comparison');
    return;
  }
  const nlpSearch = nlpResults.data.searchProducts;
  const stdSearch = standardResults.data.searchProducts;
  console.log('=== RESULT COUNT COMPARISON ===');
  console.log(`Standard Search: ${stdSearch.pagination.total} results`);
  console.log(`NLP-Enhanced Search: ${nlpSearch.pagination.total} results`);
  console.log(`Difference: ${nlpSearch.pagination.total - stdSearch.pagination.total} results`);
  console.log('\n=== TOP RESULTS COMPARISON ===');
  const stdProductIds = stdSearch.products.map(p => p.id);
  const nlpProductIds = nlpSearch.products.map(p => p.id);
  const uniqueToNlp = nlpSearch.products.filter(p => !stdProductIds.includes(p.id));
  const uniqueToStd = stdSearch.products.filter(p => !nlpProductIds.includes(p.id));
  const commonProducts = nlpSearch.products.filter(p => stdProductIds.includes(p.id));
  console.log(`\nProducts unique to NLP search: ${uniqueToNlp.length}`);
  if (uniqueToNlp.length > 0) {
    uniqueToNlp.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.title} ($${product.price.toFixed(2)})`);
    });
  }
  console.log(`\nProducts unique to standard search: ${uniqueToStd.length}`);
  if (uniqueToStd.length > 0) {
    uniqueToStd.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.title} ($${product.price.toFixed(2)})`);
    });
  }
  console.log(`\nProducts in both searches: ${commonProducts.length}`);
  if (nlpSearch.nlpMetadata) {
    console.log('\n=== NLP PROCESSING DETAILS ===');
    if (nlpSearch.processedQuery && nlpSearch.processedQuery !== query) {
      console.log(`Original query: "${query}"`);
      console.log(`Processed query: "${nlpSearch.processedQuery}"`);
    }
    if (nlpSearch.nlpMetadata.recognizedEntities) {
      console.log('\nRecognized Entities:');
      for (const [entityType, entities] of Object.entries(
        nlpSearch.nlpMetadata.recognizedEntities,
      )) {
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
const testQueries = [
  'red nike shoes',
  'summer dresses under $50',
  'comfortable running shoes',
  "business casual men's attire",
  'waterproof hiking boots',
  'gifts for mom',
  'similar to north face jacket',
  'breathable workout clothes',
  'evening gown for wedding',
  'sustainable eco-friendly products',
];
async function runInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log('\n=== AVNU MARKETPLACE NLP SEARCH TESTER ===');
  console.log('Enter a search query or choose from the following options:');
  console.log('1. Run all test queries');
  console.log('2. Compare NLP vs standard search');
  console.log('3. Exit');
  const promptUser = () => {
    rl.question('\nEnter your choice or search query: ', async input => {
      if (input === '1') {
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
        rl.question('\nEnter query to compare: ', async query => {
          try {
            await compareSearchResults(query);
          } catch (error) {
            console.error('Error comparing search results:', error);
          }
          promptUser();
        });
      } else if (
        input === '3' ||
        input.toLowerCase() === 'exit' ||
        input.toLowerCase() === 'quit'
      ) {
        rl.close();
        return;
      } else if (input.trim()) {
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
async function main() {
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
    await runInteractiveMode();
  } else if (args[0] === '--all') {
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
    await compareSearchResults(args[1]);
  } else {
    const query = args.join(' ');
    try {
      const result = await performNlpSearch(query);
      displayNlpSearchResults(result);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }
}
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
//# sourceMappingURL=test-nlp-search.js.map
