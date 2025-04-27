import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserPreferenceService } from '../src/modules/search/services/user-preference.service';
import { PreferenceCollectorService } from '../src/modules/search/services/preference-collector.service';
import { PreferenceDecayService } from '../src/modules/search/services/preference-decay.service';
import { SearchRelevanceService } from '../src/modules/search/services/search-relevance.service';
import { ProductsService } from '../src/modules/products/products.service';

/**
 * Demonstration script for time-based preference decay
 *
 * This script simulates:
 * 1. Creating initial user preferences
 * 2. Showing search results based on those preferences
 * 3. Applying time-based decay to simulate passage of time
 * 4. Showing how search results change after decay
 * 5. Adding new preferences and showing how they become dominant
 */
async function bootstrap() {
  // Create NestJS application context to access services
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get required services
  const userPreferenceService = app.get(UserPreferenceService);
  const preferenceCollectorService = app.get(PreferenceCollectorService);
  const preferenceDecayService = app.get(PreferenceDecayService);
  const searchRelevanceService = app.get(SearchRelevanceService);
  const productsService = app.get(ProductsService);

  // Demo user ID
  const userId = 'demo-user-123';

  console.log('=== PREFERENCE DECAY DEMONSTRATION ===');
  console.log('This demo shows how time-based preference decay affects search personalization');
  console.log('');

  // Step 1: Create initial user preferences
  console.log('Step 1: Creating initial user preferences...');

  // Clear any existing preferences
  await userPreferenceService.deleteUserPreferences(userId);

  // Create initial preferences with strong bias towards eco-friendly products
  const initialPreferences = {
    userId,
    categories: {
      clothing: 0.9,
      accessories: 0.7,
      home: 0.4,
    },
    brands: {
      'eco collective': 0.95,
      'sustainable threads': 0.85,
      'green living': 0.75,
    },
    priceRanges: [
      { min: 0, max: 50, weight: 0.6 },
      { min: 50, max: 100, weight: 0.8 },
    ],
    values: {
      sustainable: 0.95,
      organic: 0.9,
      vegan: 0.8,
      recycled: 0.85,
    },
    recentSearches: [
      { term: 'organic cotton t-shirts', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
      { term: 'sustainable dresses', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { term: 'recycled denim', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    ],
    recentlyViewedProducts: [],
    purchaseHistory: [],
    lastUpdated: Date.now(),
    additionalData: {},
  };

  await userPreferenceService.saveUserPreferences(initialPreferences);
  console.log('Initial preferences created with focus on eco-friendly products');

  // Simulate viewing eco-friendly products
  const mockProducts = await getMockProducts(productsService);
  for (const product of mockProducts.slice(0, 3)) {
    await preferenceCollectorService.trackProductView(userId, product);
  }

  // Step 2: Show search results based on initial preferences
  console.log('\nStep 2: Showing search results based on initial preferences...');
  const initialResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  console.log('Initial search results for "t-shirt" (showing top 5):');
  displaySearchResults(initialResults.slice(0, 5));

  // Step 3: Apply time-based decay to simulate passage of time
  console.log('\nStep 3: Applying time-based decay to simulate passage of time...');
  console.log('Simulating 60 days of preference decay...');

  // Get current preferences
  const currentPrefs = await userPreferenceService.getUserPreferences(userId);

  // Apply manual decay to simulate 60 days passing
  // We'll use exponential decay with a 30-day half-life
  const decayFactor = Math.pow(0.5, 60 / 30); // 60 days with 30-day half-life = 0.25

  // Apply immediate decay to all preference types
  await preferenceCollectorService.applyImmediateDecay(userId, 'categories', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'brands', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'values', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'priceRanges', decayFactor);

  // Get decayed preferences
  const decayedPrefs = await userPreferenceService.getUserPreferences(userId);

  console.log('Preferences before decay:');
  displayPreferences(currentPrefs);

  console.log('\nPreferences after decay:');
  displayPreferences(decayedPrefs);

  // Step 4: Show search results after decay
  console.log('\nStep 4: Showing search results after decay...');
  const decayedResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  console.log('Search results for "t-shirt" after decay (showing top 5):');
  displaySearchResults(decayedResults.slice(0, 5));

  // Step 5: Add new preferences and show how they become dominant
  console.log('\nStep 5: Adding new preferences for athletic wear...');

  // Simulate user suddenly becoming interested in athletic wear
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');

  // Simulate viewing athletic products
  for (const product of mockProducts.slice(5, 8)) {
    await preferenceCollectorService.trackProductView(userId, product);
  }

  // Simulate searches for athletic wear
  await preferenceCollectorService.trackSearch(userId, 'running shoes');
  await preferenceCollectorService.trackSearch(userId, 'workout clothes');
  await preferenceCollectorService.trackSearch(userId, 'athletic t-shirts');

  // Get updated preferences
  const updatedPrefs = await userPreferenceService.getUserPreferences(userId);

  console.log('Preferences after adding new athletic wear interests:');
  displayPreferences(updatedPrefs);

  // Show search results with new preferences
  console.log('\nSearch results for "t-shirt" with new preferences (showing top 5):');
  const newResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  displaySearchResults(newResults.slice(0, 5));

  // Step 6: Demonstrate preference decay configuration
  console.log('\nStep 6: Preference decay configuration');
  console.log('Half-life days for different preference types:');
  console.log(`- Categories: ${preferenceDecayService.getHalfLifeDays('categories')} days`);
  console.log(`- Brands: ${preferenceDecayService.getHalfLifeDays('brands')} days`);
  console.log(`- Values: ${preferenceDecayService.getHalfLifeDays('values')} days`);
  console.log(`- Price Ranges: ${preferenceDecayService.getHalfLifeDays('priceRanges')} days`);

  // Clean up
  await app.close();
}

/**
 * Helper function to simulate search with personalization
 */
async function simulateSearch(
  query: string,
  userId: string,
  searchRelevanceService: SearchRelevanceService,
): Promise<any[]> {
  // Create a mock Elasticsearch query
  const mockQuery = {
    bool: {
      must: [
        {
          multi_match: {
            query,
            fields: ['name^3', 'description', 'categories^2', 'brand^1.5', 'tags^1.2'],
          },
        },
      ],
      filter: [],
    },
  };

  // Apply user preference boosts
  const personalizedQuery = await searchRelevanceService.applyScoringProfile(
    mockQuery,
    'user_preference',
    { id: userId } as any,
  );

  // Simulate search results
  // In a real implementation, this would call Elasticsearch
  // For demo purposes, we'll return mock results
  return getMockSearchResults(query, personalizedQuery);
}

/**
 * Helper function to get mock products
 */
async function getMockProducts(productsService: ProductsService): Promise<any[]> {
  // In a real implementation, this would fetch from the database
  // For demo purposes, we'll return mock products
  return [
    {
      id: 'prod-001',
      name: 'Organic Cotton T-Shirt',
      description: 'Made from 100% organic cotton, eco-friendly and sustainable.',
      categories: ['clothing', 'sustainable'],
      brand: 'eco collective',
      price: 29.99,
      attributes: { material: 'organic cotton', color: 'natural' },
      values: ['sustainable', 'organic'],
    },
    {
      id: 'prod-002',
      name: 'Recycled Denim Jeans',
      description: 'Made from recycled denim, reducing waste and environmental impact.',
      categories: ['clothing', 'sustainable'],
      brand: 'sustainable threads',
      price: 79.99,
      attributes: { material: 'recycled denim', color: 'blue' },
      values: ['sustainable', 'recycled'],
    },
    {
      id: 'prod-003',
      name: 'Bamboo Fiber T-Shirt',
      description: 'Soft, breathable t-shirt made from sustainable bamboo fibers.',
      categories: ['clothing', 'sustainable'],
      brand: 'green living',
      price: 34.99,
      attributes: { material: 'bamboo', color: 'green' },
      values: ['sustainable', 'eco-friendly'],
    },
    {
      id: 'prod-004',
      name: 'Cotton Blend T-Shirt',
      description: 'Comfortable cotton blend t-shirt for everyday wear.',
      categories: ['clothing'],
      brand: 'casual basics',
      price: 19.99,
      attributes: { material: 'cotton blend', color: 'blue' },
      values: [],
    },
    {
      id: 'prod-005',
      name: 'Designer Graphic T-Shirt',
      description: 'Premium graphic t-shirt with designer prints.',
      categories: ['clothing', 'designer'],
      brand: 'urban style',
      price: 49.99,
      attributes: { material: 'cotton', color: 'black' },
      values: ['premium'],
    },
    {
      id: 'prod-006',
      name: 'Performance Athletic T-Shirt',
      description: 'Moisture-wicking athletic t-shirt for workouts and sports.',
      categories: ['clothing', 'athletic wear'],
      brand: 'active life',
      price: 39.99,
      attributes: { material: 'polyester blend', color: 'red' },
      values: ['performance', 'athletic'],
    },
    {
      id: 'prod-007',
      name: 'Compression Athletic T-Shirt',
      description: 'Compression fit t-shirt for high-intensity workouts.',
      categories: ['clothing', 'athletic wear'],
      brand: 'power fitness',
      price: 44.99,
      attributes: { material: 'spandex blend', color: 'black' },
      values: ['performance', 'athletic'],
    },
    {
      id: 'prod-008',
      name: 'Running Performance T-Shirt',
      description: 'Lightweight t-shirt designed specifically for runners.',
      categories: ['clothing', 'athletic wear', 'running'],
      brand: 'active life',
      price: 42.99,
      attributes: { material: 'technical fabric', color: 'blue' },
      values: ['performance', 'athletic'],
    },
  ];
}

/**
 * Helper function to get mock search results
 */
function getMockSearchResults(query: string, personalizedQuery: any): any[] {
  // In a real implementation, this would call Elasticsearch
  // For demo purposes, we'll return mock results with scores

  // Extract the function_score functions to determine personalization
  const functions = personalizedQuery.function_score?.functions || [];

  // Create a map of boosted categories, brands, and values
  const boosts = {
    categories: {} as Record<string, number>,
    brands: {} as Record<string, number>,
    values: {} as Record<string, number>,
  };

  // Extract boosts from the query
  for (const func of functions) {
    if (func.filter?.match?.categories) {
      const category = func.filter.match.categories;
      boosts.categories[category] = func.weight || 1;
    } else if (func.filter?.match?.brand) {
      const brand = func.filter.match.brand;
      boosts.brands[brand] = func.weight || 1;
    } else if (func.filter?.match?.values) {
      const value = func.filter.match.values;
      boosts.values[value] = func.weight || 1;
    }
  }

  // Get all mock products
  const products = [
    {
      id: 'prod-001',
      name: 'Organic Cotton T-Shirt',
      description: 'Made from 100% organic cotton, eco-friendly and sustainable.',
      categories: ['clothing', 'sustainable'],
      brand: 'eco collective',
      price: 29.99,
      attributes: { material: 'organic cotton', color: 'natural' },
      values: ['sustainable', 'organic'],
      baseScore: 0.95,
    },
    {
      id: 'prod-002',
      name: 'Recycled Denim Jeans',
      description: 'Made from recycled denim, reducing waste and environmental impact.',
      categories: ['clothing', 'sustainable'],
      brand: 'sustainable threads',
      price: 79.99,
      attributes: { material: 'recycled denim', color: 'blue' },
      values: ['sustainable', 'recycled'],
      baseScore: 0.6, // Lower because it's jeans, not a t-shirt
    },
    {
      id: 'prod-003',
      name: 'Bamboo Fiber T-Shirt',
      description: 'Soft, breathable t-shirt made from sustainable bamboo fibers.',
      categories: ['clothing', 'sustainable'],
      brand: 'green living',
      price: 34.99,
      attributes: { material: 'bamboo', color: 'green' },
      values: ['sustainable', 'eco-friendly'],
      baseScore: 0.9,
    },
    {
      id: 'prod-004',
      name: 'Cotton Blend T-Shirt',
      description: 'Comfortable cotton blend t-shirt for everyday wear.',
      categories: ['clothing'],
      brand: 'casual basics',
      price: 19.99,
      attributes: { material: 'cotton blend', color: 'blue' },
      values: [],
      baseScore: 0.85,
    },
    {
      id: 'prod-005',
      name: 'Designer Graphic T-Shirt',
      description: 'Premium graphic t-shirt with designer prints.',
      categories: ['clothing', 'designer'],
      brand: 'urban style',
      price: 49.99,
      attributes: { material: 'cotton', color: 'black' },
      values: ['premium'],
      baseScore: 0.8,
    },
    {
      id: 'prod-006',
      name: 'Performance Athletic T-Shirt',
      description: 'Moisture-wicking athletic t-shirt for workouts and sports.',
      categories: ['clothing', 'athletic wear'],
      brand: 'active life',
      price: 39.99,
      attributes: { material: 'polyester blend', color: 'red' },
      values: ['performance', 'athletic'],
      baseScore: 0.85,
    },
    {
      id: 'prod-007',
      name: 'Compression Athletic T-Shirt',
      description: 'Compression fit t-shirt for high-intensity workouts.',
      categories: ['clothing', 'athletic wear'],
      brand: 'power fitness',
      price: 44.99,
      attributes: { material: 'spandex blend', color: 'black' },
      values: ['performance', 'athletic'],
      baseScore: 0.8,
    },
    {
      id: 'prod-008',
      name: 'Running Performance T-Shirt',
      description: 'Lightweight t-shirt designed specifically for runners.',
      categories: ['clothing', 'athletic wear', 'running'],
      brand: 'active life',
      price: 42.99,
      attributes: { material: 'technical fabric', color: 'blue' },
      values: ['performance', 'athletic'],
      baseScore: 0.75,
    },
  ];

  // Filter products that match the query
  const matchingProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()),
  );

  // Calculate personalized scores
  const scoredProducts = matchingProducts.map(product => {
    let personalizedScore = product.baseScore;

    // Apply category boosts
    for (const category of product.categories) {
      if (boosts.categories[category]) {
        personalizedScore += boosts.categories[category] * 0.2;
      }
    }

    // Apply brand boosts
    if (boosts.brands[product.brand]) {
      personalizedScore += boosts.brands[product.brand] * 0.2;
    }

    // Apply value boosts
    for (const value of product.values) {
      if (boosts.values[value]) {
        personalizedScore += boosts.values[value] * 0.2;
      }
    }

    return {
      ...product,
      score: personalizedScore,
    };
  });

  // Sort by score
  return scoredProducts.sort((a, b) => b.score - a.score);
}

/**
 * Helper function to display search results
 */
function displaySearchResults(results: any[]): void {
  results.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.name} (${result.brand}) - Score: ${result.score.toFixed(2)}`,
    );
    console.log(`   Categories: ${result.categories.join(', ')}`);
    console.log(`   Values: ${result.values.join(', ')}`);
    console.log(`   Price: $${result.price}`);
    console.log('');
  });
}

/**
 * Helper function to display user preferences
 */
function displayPreferences(prefs: any): void {
  // Display top categories
  console.log('Top Categories:');
  const categories = Object.entries(prefs.categories)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  categories.forEach(([category, weight]) => {
    console.log(`- ${category}: ${(weight as number).toFixed(2)}`);
  });

  // Display top brands
  console.log('\nTop Brands:');
  const brands = Object.entries(prefs.brands)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  brands.forEach(([brand, weight]) => {
    console.log(`- ${brand}: ${(weight as number).toFixed(2)}`);
  });

  // Display top values
  console.log('\nTop Values:');
  const values = Object.entries(prefs.values)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  values.forEach(([value, weight]) => {
    console.log(`- ${value}: ${(weight as number).toFixed(2)}`);
  });
}

// Run the demo
bootstrap().catch(error => {
  console.error('Error running preference decay demo:', error);
});
