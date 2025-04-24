import fetch from 'node-fetch';

// Define API response interface
interface ApiResponse {
  data: {
    products: {
      items: Product[];
    };
  };
}

// Define product interface
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  brandName: string;
  categories?: string[];
  inStock?: boolean;
  merchantId?: string;
}

// Client-side search utility
class ClientSearchUtility {
  private products: Product[] = [];
  private isLoaded = false;

  constructor(private apiUrl: string) {}

  // Load all products from the API
  async loadProducts(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              products(pagination: { limit: 50 }) {
                items {
                  id
                  title
                  description
                  price
                  brandName
                  categories
                  inStock
                  merchantId
                }
              }
            }
          `,
        }),
      });

      const data = await response.json() as ApiResponse;
      this.products = data.data.products.items;
      this.isLoaded = true;
      console.log(`Loaded ${this.products.length} products from API`);
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  }

  // Search products by query
  search(query: string): Product[] {
    if (!this.isLoaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }

    if (!query) return this.products;

    const lowerQuery = query.toLowerCase();
    return this.products.filter(product => {
      return (
        product.title.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.brandName.toLowerCase().includes(lowerQuery) ||
        (product.categories &&
          product.categories.some(category => category.toLowerCase().includes(lowerQuery)))
      );
    });
  }

  // Filter products by price range
  filterByPrice(minPrice?: number, maxPrice?: number): Product[] {
    if (!this.isLoaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }

    return this.products.filter(product => {
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;
      return true;
    });
  }

  // Filter products by brand
  filterByBrand(brandName: string): Product[] {
    if (!this.isLoaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }

    const lowerBrand = brandName.toLowerCase();
    return this.products.filter(product =>
      product.brandName.toLowerCase().includes(lowerBrand)
    );
  }

  // Filter products by category
  filterByCategory(category: string): Product[] {
    if (!this.isLoaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }

    const lowerCategory = category.toLowerCase();
    return this.products.filter(
      product =>
        product.categories &&
        product.categories.some(cat => cat.toLowerCase().includes(lowerCategory))
    );
  }

  // Combined search and filter
  searchAndFilter(options: {
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    brandName?: string;
    category?: string;
  }): Product[] {
    if (!this.isLoaded) {
      throw new Error('Products not loaded. Call loadProducts() first.');
    }

    let results = this.products;

    if (options.query) {
      results = this.search(options.query);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      results = results.filter(product => {
        if (options.minPrice !== undefined && product.price < options.minPrice) return false;
        if (options.maxPrice !== undefined && product.price > options.maxPrice) return false;
        return true;
      });
    }

    if (options.brandName) {
      const lowerBrand = options.brandName.toLowerCase();
      results = results.filter(product =>
        product.brandName.toLowerCase().includes(lowerBrand)
      );
    }

    if (options.category) {
      const lowerCategory = options.category.toLowerCase();
      results = results.filter(
        product =>
          product.categories &&
          product.categories.some(cat => cat.toLowerCase().includes(lowerCategory))
      );
    }

    return results;
  }
}

// Main function to demonstrate the client-side search utility
async function main() {
  const apiUrl = 'http://localhost:3001/graphql';
  const searchUtil = new ClientSearchUtility(apiUrl);

  try {
    // Load products from API
    await searchUtil.loadProducts();

    // Test 1: Search for "shirt"
    const shirtResults = searchUtil.search('shirt');
    console.log('\n===== Test 1: Search for "shirt" =====');
    console.log(`Found ${shirtResults.length} products matching "shirt"`);
    shirtResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
    });

    // Test 2: Filter by price range $30-$60
    const priceResults = searchUtil.filterByPrice(30, 60);
    console.log('\n===== Test 2: Filter by price range $30-$60 =====');
    console.log(`Found ${priceResults.length} products in price range $30-$60`);
    priceResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
    });

    // Test 3: Filter by brand "FashionForward"
    const brandResults = searchUtil.filterByBrand('FashionForward');
    console.log('\n===== Test 3: Filter by brand "FashionForward" =====');
    console.log(`Found ${brandResults.length} products from brand "FashionForward"`);
    brandResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
    });

    // Test 4: Combined search and filter (shirts in price range $30-$60)
    const combinedResults = searchUtil.searchAndFilter({
      query: 'shirt',
      minPrice: 30,
      maxPrice: 60,
    });
    console.log('\n===== Test 4: Combined search for "shirt" in price range $30-$60 =====');
    console.log(`Found ${combinedResults.length} shirt products in price range $30-$60`);
    combinedResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(console.error);
