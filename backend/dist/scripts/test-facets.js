'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const axios_1 = __importDefault(require('axios'));
const API_URL = 'http://localhost:3001/graphql';
async function testFacets() {
  console.log('Testing faceted search with mock server...');
  const query = `
    query {
      searchProducts(input: { query: "shoes", limit: 10 }) {
        query
        pagination {
          total
        }
        products {
          id
          title
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
  try {
    const response = await axios_1.default.post(
      API_URL,
      { query },
      { headers: { 'Content-Type': 'application/json' } },
    );
    console.log('Response received:');
    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors);
      return;
    }
    const result = response.data.data;
    if (!result || !result.searchProducts) {
      console.error('No search results returned');
      return;
    }
    const searchResult = result.searchProducts;
    console.log(
      `\nFound ${searchResult.pagination.total} products for query "${searchResult.query}"`,
    );
    console.log(`\nProducts: ${searchResult.products.map(p => p.title).join(', ')}`);
    if (searchResult.facets) {
      console.log('\n=== FACETS ===');
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
      if (searchResult.facets.price) {
        console.log(
          `\nPrice Range: $${searchResult.facets.price.min.toFixed(2)} - $${searchResult.facets.price.max.toFixed(2)}`,
        );
      }
    } else {
      console.log('\nNo facets returned in the response');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}
testFacets().catch(console.error);
//# sourceMappingURL=test-facets.js.map
