"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const axios = __importStar(require("axios"));
const { default: axiosDefault } = axios;
const API_URL = 'http://localhost:3001/graphql';
async function executeGraphQLQuery(query, variables) {
    try {
        const response = await axiosDefault.post(API_URL, {
            query,
            variables,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('GraphQL query error:', error.response?.data || error.message);
        throw error;
    }
}
async function testBasicProductSearch(query) {
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
    const result = await executeGraphQLQuery(graphqlQuery, variables);
    if (result.data.searchProducts) {
        const searchResult = result.data.searchProducts;
        console.log('Search results:');
        console.log('Query:', searchResult.query);
        console.log('Total results:', searchResult.pagination.total);
        console.log('Products:', searchResult.products.length > 0
            ? searchResult.products.map(p => `${p.title} ($${p.price})`)
            : 'No products found');
        return result;
    }
    else {
        console.log('No search results found');
        return null;
    }
}
async function testFilteredProductSearch(query, priceMin, priceMax, brandName) {
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
    const result = await executeGraphQLQuery(graphqlQuery, variables);
    if (result.data.searchProducts) {
        console.log('Search results:');
        console.log('Query:', result.data.searchProducts.query);
        console.log('Total results:', result.data.searchProducts.pagination.total);
        console.log('Products:', result.data.searchProducts.products.length > 0
            ? result.data.searchProducts.products.map(p => `${p.title} ($${p.price})`)
            : 'No products found');
    }
    else {
        console.log('No search results returned');
    }
    return result;
}
async function testMultiEntitySearch(query) {
    console.log(`\n🔍 Testing search across multiple entity types for: "${query}"`);
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
        const productResult = await executeGraphQLQuery(productQuery, variables);
        if (productResult.data && productResult.data.searchProducts) {
            const products = productResult.data.searchProducts.products || [];
            console.log(`Products (${products.length}):`);
            if (products.length > 0) {
                products.forEach(p => console.log(`  - ${p.title} ($${p.price}) by ${p.brandName}`));
            }
            else {
                console.log('  No products found');
            }
        }
        else if (productResult.errors && productResult.errors.length > 0) {
            console.log('❌ Product search error:', productResult.errors[0]);
        }
        const merchantResult = await executeGraphQLQuery(merchantQuery, variables);
        if (merchantResult.data && merchantResult.data.searchMerchants) {
            const merchants = merchantResult.data.searchMerchants.merchants || [];
            console.log(`\nMerchants (${merchants.length})`);
            if (merchants.length > 0) {
                merchants.forEach(m => console.log(`  - ${m.name}`));
            }
            else {
                console.log('  No merchants found');
            }
        }
        else if (merchantResult.errors && merchantResult.errors.length > 0) {
            console.log('❌ Merchant search error:', merchantResult.errors[0]);
        }
        const brandResult = await executeGraphQLQuery(brandQuery, variables);
        if (brandResult.data && brandResult.data.searchBrands) {
            const brands = brandResult.data.searchBrands.brands || [];
            console.log(`\nBrands (${brands.length})`);
            if (brands.length > 0) {
                brands.forEach(b => console.log(`  - ${b.name}`));
            }
            else {
                console.log('  No brands found');
            }
        }
        else if (brandResult.errors && brandResult.errors.length > 0) {
            console.log('❌ Brand search error:', brandResult.errors[0]);
        }
        const productCount = productResult.data?.searchProducts?.products?.length || 0;
        const merchantCount = merchantResult.data?.searchMerchants?.merchants?.length || 0;
        const brandCount = brandResult.data?.searchBrands?.brands?.length || 0;
        const totalCount = productCount + merchantCount + brandCount;
        console.log(`\n📊 Search Summary for "${query}":`);
        console.log(`Total results: ${totalCount}`);
        console.log(`Products: ${productCount}`);
        console.log(`Merchants: ${merchantCount}`);
        console.log(`Brands: ${brandCount}`);
    }
    catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}
async function runTests() {
    try {
        console.log('🚀 Starting GraphQL search tests...');
        await testBasicProductSearch('shirt');
        await testBasicProductSearch('shoes');
        await testBasicProductSearch('electronics');
        await testFilteredProductSearch('jacket', 50, 200);
        await testFilteredProductSearch('watch', undefined, 1000, 'Rolex');
        await testMultiEntitySearch('luxury');
        console.log('\n✅ All tests completed successfully!');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}
runTests();
//# sourceMappingURL=test-graphql-search-fixed.js.map