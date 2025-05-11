// Using built-in fetch API

async function fetchAllProducts() {
  const query = `
    query {
      products(pagination: { limit: 50 }) {
        items {
          id
          title
          description
          price
          brandName
          categories
        }
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:3001/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data.products.items;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

function searchProducts(products, searchTerm) {
  if (!searchTerm) return products;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return products.filter(product => {
    return (
      product.title.toLowerCase().includes(lowerSearchTerm) ||
      product.description.toLowerCase().includes(lowerSearchTerm) ||
      product.brandName.toLowerCase().includes(lowerSearchTerm) ||
      (product.categories &&
        product.categories.some(cat => cat.toLowerCase().includes(lowerSearchTerm)))
    );
  });
}

function filterProductsByCategory(products, category) {
  if (!category) return products;

  const lowerCategory = category.toLowerCase();
  return products.filter(product => {
    return (
      product.categories &&
      product.categories.some(cat => cat.toLowerCase().includes(lowerCategory))
    );
  });
}

function filterProductsByPriceRange(products, minPrice, maxPrice) {
  return products.filter(product => {
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    return true;
  });
}

async function runTests() {
  console.log('Fetching all products...');
  const allProducts = await fetchAllProducts();
  console.log(`Found ${allProducts.length} total products\n`);

  // Test 1: Search for "shirt"
  const searchTerm = 'shirt';
  const shirtProducts = searchProducts(allProducts, searchTerm);
  console.log(`\n===== Test 1: Search for "${searchTerm}" =====`);
  console.log(`Found ${shirtProducts.length} products matching "${searchTerm}"`);
  shirtProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
  });

  // Test 2: Filter by category "clothing"
  const category = 'clothing';
  const clothingProducts = filterProductsByCategory(allProducts, category);
  console.log(`\n===== Test 2: Filter by category "${category}" =====`);
  console.log(`Found ${clothingProducts.length} products in category "${category}"`);
  clothingProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
  });

  // Test 3: Filter by price range $30-$100
  const minPrice = 30;
  const maxPrice = 100;
  const priceRangeProducts = filterProductsByPriceRange(allProducts, minPrice, maxPrice);
  console.log(`\n===== Test 3: Filter by price range $${minPrice}-$${maxPrice} =====`);
  console.log(
    `Found ${priceRangeProducts.length} products in price range $${minPrice}-$${maxPrice}`,
  );
  priceRangeProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
  });

  // Test 4: Combined search and filter (shirts in price range $30-$60)
  const combinedResults = filterProductsByPriceRange(searchProducts(allProducts, 'shirt'), 30, 60);
  console.log(`\n===== Test 4: Combined search for "shirt" in price range $30-$60 =====`);
  console.log(`Found ${combinedResults.length} shirt products in price range $30-$60`);
  combinedResults.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - $${product.price} (${product.brandName})`);
  });
}

runTests();
