/**
 * test-facets.ts
 *
 * A simple script to test faceted search with the mock server
 */
import axios from 'axios';

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
    const response = await axios.post<{
      data?: {
        searchProducts?: {
          query: string;
          pagination: { total: number };
          products: Array<{ id: string; title: string }>;
          facets?: {
            categories?: Array<{ name: string; count: number }>;
            brands?: Array<{ name: string; count: number }>;
            price?: { min: number; max: number };
          };
        };
      };
      errors?: Array<{ message: string }>;
    }>(API_URL, { query }, { headers: { 'Content-Type': 'application/json' } });

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

// Run the test
testFacets().catch(console.error);
