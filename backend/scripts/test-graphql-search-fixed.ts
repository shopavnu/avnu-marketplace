/**
 * Test script for GraphQL search functionality
 * 
 * This script demonstrates how to use the GraphQL search API
 * and can be used to test different search queries and filters.
 */
import * as axios from 'axios';
const { default: axiosDefault } = axios as any;

// Define types for GraphQL responses
interface ProductSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  brandName: string;
  score?: number;
}

interface MerchantSearchResult {
  id: string;
  name: string;
}

interface BrandSearchResult {
  id: string;
  name: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ProductSearchResponse {
  searchProducts: {
    query: string;
    pagination: PaginationInfo;
    products: ProductSearchResult[];
  };
}

interface AllEntitySearchResponse {
  query: string;
  products: ProductSearchResult[];
  merchants: MerchantSearchResult[];
  brands: BrandSearchResult[];
  pagination: PaginationInfo;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: any[];
}

const API_URL = 'http://localhost:3001/graphql';

// Helper function to execute GraphQL queries
async function executeGraphQLQuery<T>(query: string, variables?: any): Promise<GraphQLResponse<T>> {
  try {
    const response = await axiosDefault.post(API_URL, {
      query,
      variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Ensure we return a properly typed response
    return response.data as GraphQLResponse<T>;
  } catch (error) {
    console.error('GraphQL query error:', error.response?.data || error.message);
    throw error;
  }
}

// Test basic product search
async function testBasicProductSearch(query: string): Promise<any> {
  console.log(`\n🔍 Testing basic product search for: "${query}"`);
  
  const graphqlQuery = `
    query SearchProducts($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        products {
          id
          title
          description
          price
          brandName
          score
        }
        pagination {
          total
          page
          limit
          hasNext
          hasPrevious
        }
      }
    }
  `;

  const variables = {
    input: {
      query,
      limit: 10,
      page: 1,
    },
  };

  const result = await executeGraphQLQuery<ProductSearchResponse>(graphqlQuery, variables);
  
  if (result.data.searchProducts) {
    const searchResult = result.data.searchProducts;
    console.log('Search results:');
    console.log('Query:', searchResult.query);
    console.log('Total results:', searchResult.pagination.total);
    console.log('Products:', searchResult.products.length > 0 
      ? searchResult.products.map(p => `${p.title} ($${p.price})`)
      : 'No products found');
    return result;
  } else {
    console.log('No search results found');
    return null;
  }
}

// Test product search with filters
async function testFilteredProductSearch(query: string, priceMin?: number, priceMax?: number, brandName?: string): Promise<any> {
  console.log(`\n🔍 Testing filtered product search for: "${query}"`);
  if (priceMin !== undefined || priceMax !== undefined) {
    console.log(`Price range: ${priceMin || 0} - ${priceMax || 'unlimited'}`);
  }
  if (brandName) {
    console.log(`Brand: ${brandName}`);
  }
  
  const graphqlQuery = `
    query SearchProducts($input: SearchOptionsInput!) {
      searchProducts(input: $input) {
        query
        products {
          id
          title
          description
          price
          brandName
          score
        }
        pagination {
          total
          page
          limit
        }
      }
    }
  `;

  const rangeFilters = [];
  if (priceMin !== undefined || priceMax !== undefined) {
    rangeFilters.push({
      field: 'price',
      min: priceMin,
      max: priceMax,
    });
  }

  const filters = [];
  if (brandName) {
    filters.push({
      field: 'brandName',
      values: [brandName],
    });
  }

  const variables = {
    input: {
      query,
      limit: 10,
      page: 1,
      filters,
      rangeFilters,
    },
  };

  const result = await executeGraphQLQuery<ProductSearchResponse>(graphqlQuery, variables);
  
  if (result.data.searchProducts) {
    console.log('Search results:');
    console.log('Query:', result.data.searchProducts.query);
    console.log('Total results:', result.data.searchProducts.pagination.total);
    console.log('Products:', result.data.searchProducts.products.length > 0 
      ? result.data.searchProducts.products.map(p => `${p.title} ($${p.price})`)
      : 'No products found');
  } else {
    console.log('No search results returned');
  }
  
  return result;
}

// Test search across multiple entity types separately
async function testMultiEntitySearch(query: string): Promise<void> {
  console.log(`\n🔍 Testing search across multiple entity types for: "${query}"`);
  
  // Test product search
  const productQuery = `
    query SearchProducts($input: SearchOptionsInput!) {
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

  // Test merchant search
  const merchantQuery = `
    query SearchMerchants($input: SearchOptionsInput!) {
      searchMerchants(input: $input) {
        query
        merchants {
          id
          name
        }
        pagination {
          total
        }
      }
    }
  `;

  // Test brand search
  const brandQuery = `
    query SearchBrands($input: SearchOptionsInput!) {
      searchBrands(input: $input) {
        query
        brands {
          id
          name
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
    console.log('\n📊 Entity search results for:', query);
    
    // Execute product search
    type ProductQueryResult = { 
      searchProducts: { 
        products: ProductSearchResult[]; 
        pagination: PaginationInfo; 
        query: string; 
      } 
    };
    const productResult = await executeGraphQLQuery<ProductQueryResult>(productQuery, variables);
    if (productResult.data && productResult.data.searchProducts) {
      const products = productResult.data.searchProducts.products || [];
      console.log(`Products (${products.length}):`); 
      if (products.length > 0) {
        products.forEach(p => console.log(`  - ${p.title} ($${p.price}) by ${p.brandName}`));
      } else {
        console.log('  No products found');
      }
    } else if (productResult.errors && productResult.errors.length > 0) {
      console.log('❌ Product search error:', productResult.errors[0]);
    }
    
    // Execute merchant search
    type MerchantQueryResult = { 
      searchMerchants: { 
        merchants: MerchantSearchResult[]; 
        pagination: PaginationInfo; 
        query: string; 
      } 
    };
    const merchantResult = await executeGraphQLQuery<MerchantQueryResult>(merchantQuery, variables);
    if (merchantResult.data && merchantResult.data.searchMerchants) {
      const merchants = merchantResult.data.searchMerchants.merchants || [];
      console.log(`\nMerchants (${merchants.length})`);
      if (merchants.length > 0) {
        merchants.forEach(m => console.log(`  - ${m.name}`));
      } else {
        console.log('  No merchants found');
      }
    } else if (merchantResult.errors && merchantResult.errors.length > 0) {
      console.log('❌ Merchant search error:', merchantResult.errors[0]);
    }
    
    // Execute brand search
    type BrandQueryResult = { 
      searchBrands: { 
        brands: BrandSearchResult[]; 
        pagination: PaginationInfo; 
        query: string; 
      } 
    };
    const brandResult = await executeGraphQLQuery<BrandQueryResult>(brandQuery, variables);
    if (brandResult.data && brandResult.data.searchBrands) {
      const brands = brandResult.data.searchBrands.brands || [];
      console.log(`\nBrands (${brands.length})`);
      if (brands.length > 0) {
        brands.forEach(b => console.log(`  - ${b.name}`));
      } else {
        console.log('  No brands found');
      }
    } else if (brandResult.errors && brandResult.errors.length > 0) {
      console.log('❌ Brand search error:', brandResult.errors[0]);
    }
    
    // Summary
    const productCount = productResult.data?.searchProducts?.products?.length || 0;
    const merchantCount = merchantResult.data?.searchMerchants?.merchants?.length || 0;
    const brandCount = brandResult.data?.searchBrands?.brands?.length || 0;
    const totalCount = productCount + merchantCount + brandCount;
    
    console.log(`\n📊 Search Summary for "${query}":`);
    console.log(`Total results: ${totalCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Merchants: ${merchantCount}`);
    console.log(`Brands: ${brandCount}`);
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the tests
async function runTests() {
  try {
    console.log('🚀 Starting GraphQL search tests...');
    
    // Test basic search
    await testBasicProductSearch('shirt');
    
    // Test with different queries
    await testBasicProductSearch('shoes');
    await testBasicProductSearch('electronics');
    
    // Test with filters
    await testFilteredProductSearch('jacket', 50, 200);
    await testFilteredProductSearch('watch', undefined, 1000, 'Rolex');
    
    // Test multi-entity search
    await testMultiEntitySearch('luxury');
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Execute the tests
runTests();
