/**
 * Simple script to demonstrate search relevance enhancements
 * This script simulates different search scenarios to show how our enhancements improve results
 */

// Mock search data
const products = [
  { id: '1', title: 'Apple MacBook Pro 16" M1 Pro', description: 'Powerful laptop for professionals with excellent battery life', price: 2499, brandName: 'Apple', categories: ['laptops', 'electronics'], tags: ['premium', 'professional'], values: ['16GB RAM', '1TB SSD', 'M1 Pro'] },
  { id: '2', title: 'Dell XPS 15', description: 'High-performance Windows laptop with InfinityEdge display', price: 1899, brandName: 'Dell', categories: ['laptops', 'electronics'], tags: ['premium', 'professional'], values: ['16GB RAM', '512GB SSD', 'Intel i7'] },
  { id: '3', title: 'ASUS ROG Strix G15 Gaming Laptop', description: 'Powerful gaming laptop with RGB lighting and high refresh rate', price: 1299, brandName: 'ASUS', categories: ['laptops', 'gaming', 'electronics'], tags: ['gaming', 'performance'], values: ['16GB RAM', '1TB SSD', 'RTX 3070'] },
  { id: '4', title: 'Lenovo ThinkPad X1 Carbon', description: 'Business laptop with excellent keyboard and battery life', price: 1599, brandName: 'Lenovo', categories: ['laptops', 'business', 'electronics'], tags: ['business', 'professional'], values: ['16GB RAM', '512GB SSD', 'Intel i7'] },
  { id: '5', title: 'Acer Predator Helios 300 Gaming Laptop', description: 'Affordable gaming laptop with powerful graphics', price: 1199, brandName: 'Acer', categories: ['laptops', 'gaming', 'electronics'], tags: ['gaming', 'budget'], values: ['16GB RAM', '512GB SSD', 'RTX 3060'] },
  { id: '6', title: 'HP Spectre x360', description: 'Convertible laptop with touchscreen and pen support', price: 1399, brandName: 'HP', categories: ['laptops', 'convertible', 'electronics'], tags: ['premium', 'touchscreen'], values: ['16GB RAM', '512GB SSD', 'Intel i7'] },
  { id: '7', title: 'Microsoft Surface Laptop 4', description: 'Sleek and lightweight laptop with excellent display', price: 1299, brandName: 'Microsoft', categories: ['laptops', 'electronics'], tags: ['premium', 'lightweight'], values: ['16GB RAM', '512GB SSD', 'AMD Ryzen'] },
  { id: '8', title: 'Razer Blade 15 Gaming Laptop', description: 'Premium gaming laptop with high refresh rate display', price: 1999, brandName: 'Razer', categories: ['laptops', 'gaming', 'electronics'], tags: ['premium', 'gaming'], values: ['16GB RAM', '1TB SSD', 'RTX 3080'] },
  { id: '9', title: 'Apple MacBook Air M2', description: 'Thin and light laptop with excellent battery life', price: 1199, brandName: 'Apple', categories: ['laptops', 'electronics'], tags: ['lightweight', 'portable'], values: ['8GB RAM', '256GB SSD', 'M2'] },
  { id: '10', title: 'MSI GS66 Stealth Gaming Laptop', description: 'Powerful gaming laptop with sleek design', price: 1799, brandName: 'MSI', categories: ['laptops', 'gaming', 'electronics'], tags: ['gaming', 'premium'], values: ['32GB RAM', '1TB SSD', 'RTX 3070'] },
];

// Mock NLP processing
function processQuery(query) {
  console.log(`\nProcessing query: "${query}"`);
  
  // Extract intent
  let intent = 'general';
  if (query.includes('gaming') || query.includes('game')) {
    intent = 'gaming';
  } else if (query.includes('business') || query.includes('professional')) {
    intent = 'business';
  } else if (query.includes('battery') || query.includes('portable')) {
    intent = 'portable';
  }
  
  // Extract entities
  const entities = [];
  
  // Brand detection
  const brands = ['Apple', 'Dell', 'ASUS', 'Lenovo', 'Acer', 'HP', 'Microsoft', 'Razer', 'MSI'];
  for (const brand of brands) {
    if (query.toLowerCase().includes(brand.toLowerCase())) {
      entities.push({ type: 'brand', value: brand, confidence: 0.9 });
    }
  }
  
  // Price range detection
  const priceRegex = /\$(\d+)(?:\s*-\s*\$?(\d+))?/;
  const priceMatch = query.match(priceRegex);
  if (priceMatch) {
    if (priceMatch[2]) {
      // Range: $X - $Y
      entities.push({ 
        type: 'price_range', 
        value: { min: parseInt(priceMatch[1]), max: parseInt(priceMatch[2]) },
        confidence: 0.9 
      });
    } else {
      // Single price: under $X or $X
      if (query.toLowerCase().includes('under') || query.toLowerCase().includes('less than')) {
        entities.push({ 
          type: 'price_range', 
          value: { max: parseInt(priceMatch[1]) },
          confidence: 0.9 
        });
      } else if (query.toLowerCase().includes('over') || query.toLowerCase().includes('more than')) {
        entities.push({ 
          type: 'price_range', 
          value: { min: parseInt(priceMatch[1]) },
          confidence: 0.9 
        });
      }
    }
  }
  
  // Category detection
  const categories = ['gaming', 'business', 'convertible', 'lightweight', 'professional'];
  for (const category of categories) {
    if (query.toLowerCase().includes(category)) {
      entities.push({ type: 'category', value: category, confidence: 0.8 });
    }
  }
  
  // Feature detection
  const features = ['RAM', 'SSD', 'battery', 'display', 'touchscreen', 'keyboard'];
  for (const feature of features) {
    if (query.toLowerCase().includes(feature.toLowerCase())) {
      entities.push({ type: 'feature', value: feature, confidence: 0.7 });
    }
  }
  
  console.log(`Detected intent: ${intent}`);
  console.log(`Detected entities: ${JSON.stringify(entities, null, 2)}`);
  
  return { intent, entities };
}

// Standard search (basic keyword matching)
function standardSearch(query, products) {
  console.log(`\nStandard search for: "${query}"`);
  
  const keywords = query.toLowerCase().split(/\s+/);
  
  const results = products
    .map(product => {
      // Calculate a simple relevance score based on keyword matches
      const titleMatches = keywords.filter(keyword => 
        product.title.toLowerCase().includes(keyword)
      ).length;
      
      const descriptionMatches = keywords.filter(keyword => 
        product.description.toLowerCase().includes(keyword)
      ).length;
      
      const brandMatch = keywords.filter(keyword => 
        product.brandName.toLowerCase().includes(keyword)
      ).length;
      
      const categoryMatches = product.categories.filter(category => 
        keywords.some(keyword => category.toLowerCase().includes(keyword))
      ).length;
      
      const tagMatches = product.tags.filter(tag => 
        keywords.some(keyword => tag.toLowerCase().includes(keyword))
      ).length;
      
      // Calculate score with simple weighting
      const score = 
        (titleMatches * 3) + 
        (descriptionMatches * 1) + 
        (brandMatch * 2) + 
        (categoryMatches * 1.5) + 
        (tagMatches * 1);
      
      return { ...product, score };
    })
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return results;
}

// Enhanced search with NLP and relevance features
function enhancedSearch(query, products, userPreferences = null) {
  console.log(`\nEnhanced search for: "${query}"`);
  
  // Process the query with NLP
  const { intent, entities } = processQuery(query);
  
  // Apply filters based on entities
  let filteredProducts = [...products];
  
  // Filter by brand if specified
  const brandEntity = entities.find(e => e.type === 'brand');
  if (brandEntity) {
    filteredProducts = filteredProducts.filter(p => 
      p.brandName.toLowerCase() === brandEntity.value.toLowerCase()
    );
  }
  
  // Filter by price range if specified
  const priceEntity = entities.find(e => e.type === 'price_range');
  if (priceEntity) {
    if (priceEntity.value.min !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= priceEntity.value.min);
    }
    if (priceEntity.value.max !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= priceEntity.value.max);
    }
  }
  
  // Calculate relevance scores
  const results = filteredProducts.map(product => {
    // Base score from keyword matching (similar to standard search)
    const keywords = query.toLowerCase().split(/\s+/);
    
    const titleMatches = keywords.filter(keyword => 
      product.title.toLowerCase().includes(keyword)
    ).length;
    
    const descriptionMatches = keywords.filter(keyword => 
      product.description.toLowerCase().includes(keyword)
    ).length;
    
    const baseScore = 
      (titleMatches * 3) + 
      (descriptionMatches * 1);
    
    // Intent-based scoring
    let intentScore = 0;
    if (intent === 'gaming' && (
      product.categories.includes('gaming') || 
      product.tags.includes('gaming')
    )) {
      intentScore += 5;
    } else if (intent === 'business' && (
      product.categories.includes('business') || 
      product.tags.includes('business') || 
      product.tags.includes('professional')
    )) {
      intentScore += 5;
    } else if (intent === 'portable' && (
      product.tags.includes('lightweight') || 
      product.tags.includes('portable')
    )) {
      intentScore += 5;
    }
    
    // Entity-based scoring
    let entityScore = 0;
    for (const entity of entities) {
      if (entity.type === 'category' && 
          product.categories.includes(entity.value)) {
        entityScore += 3;
      }
      
      if (entity.type === 'feature') {
        const featureValue = entity.value.toLowerCase();
        if (product.values.some(v => v.toLowerCase().includes(featureValue))) {
          entityScore += 3;
        }
        if (product.description.toLowerCase().includes(featureValue)) {
          entityScore += 2;
        }
      }
    }
    
    // User preference scoring (if provided)
    let preferenceScore = 0;
    if (userPreferences) {
      // Brand preference
      if (userPreferences.preferredBrands.includes(product.brandName)) {
        preferenceScore += 2;
      }
      
      // Category preference
      const matchingCategories = product.categories.filter(c => 
        userPreferences.preferredCategories.includes(c)
      ).length;
      preferenceScore += matchingCategories * 1.5;
      
      // Price range preference
      if (product.price >= userPreferences.priceRange.min && 
          product.price <= userPreferences.priceRange.max) {
        preferenceScore += 2;
      }
    }
    
    // Calculate final score
    const finalScore = baseScore + intentScore + entityScore + preferenceScore;
    
    return { 
      ...product, 
      score: finalScore,
      scoreBreakdown: {
        base: baseScore,
        intent: intentScore,
        entity: entityScore,
        preference: preferenceScore
      }
    };
  })
  .sort((a, b) => b.score - a.score);
  
  return results;
}

// Format and display search results
function displayResults(results, limit = 5) {
  if (results.length === 0) {
    console.log("No results found");
    return;
  }
  
  console.log(`\nFound ${results.length} results. Top ${Math.min(limit, results.length)}:`);
  
  results.slice(0, limit).forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.title} - $${product.price}`);
    console.log(`   Brand: ${product.brandName}`);
    console.log(`   Description: ${product.description}`);
    console.log(`   Categories: ${product.categories.join(', ')}`);
    console.log(`   Score: ${product.score.toFixed(2)}`);
    
    if (product.scoreBreakdown) {
      console.log(`   Score Breakdown: Base=${product.scoreBreakdown.base.toFixed(2)}, ` +
                  `Intent=${product.scoreBreakdown.intent.toFixed(2)}, ` +
                  `Entity=${product.scoreBreakdown.entity.toFixed(2)}, ` +
                  `Preference=${product.scoreBreakdown.preference.toFixed(2)}`);
    }
  });
}

// Mock user preferences
const userPreferences = {
  preferredBrands: ['Apple', 'Dell'],
  preferredCategories: ['laptops', 'electronics'],
  priceRange: { min: 1000, max: 2000 }
};

// Run test searches
function runTestSearches() {
  console.log("=== SEARCH RELEVANCE ENHANCEMENT DEMO ===\n");
  
  const testQueries = [
    "laptop",
    "gaming laptop under $1500",
    "Apple laptop with good battery life",
    "business laptop with 16GB RAM",
    "lightweight portable laptop for travel"
  ];
  
  for (const query of testQueries) {
    console.log("\n==================================================");
    console.log(`TESTING QUERY: "${query}"`);
    console.log("==================================================");
    
    // Run standard search
    const standardResults = standardSearch(query, products);
    console.log("\n--- STANDARD SEARCH RESULTS ---");
    displayResults(standardResults, 3);
    
    // Run enhanced search without personalization
    const enhancedResults = enhancedSearch(query, products);
    console.log("\n--- ENHANCED SEARCH RESULTS ---");
    displayResults(enhancedResults, 3);
    
    // Run enhanced search with personalization
    const personalizedResults = enhancedSearch(query, products, userPreferences);
    console.log("\n--- PERSONALIZED SEARCH RESULTS ---");
    displayResults(personalizedResults, 3);
    
    console.log("\n--------------------------------------------------");
  }
}

// Run the demo
runTestSearches();
