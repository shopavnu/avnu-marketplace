'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('../src/app.module');
const user_preference_service_1 = require('../src/modules/search/services/user-preference.service');
const preference_collector_service_1 = require('../src/modules/search/services/preference-collector.service');
const preference_decay_service_1 = require('../src/modules/search/services/preference-decay.service');
const search_relevance_service_1 = require('../src/modules/search/services/search-relevance.service');
const products_service_1 = require('../src/modules/products/products.service');
async function bootstrap() {
  const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
  const userPreferenceService = app.get(user_preference_service_1.UserPreferenceService);
  const preferenceCollectorService = app.get(
    preference_collector_service_1.PreferenceCollectorService,
  );
  const preferenceDecayService = app.get(preference_decay_service_1.PreferenceDecayService);
  const searchRelevanceService = app.get(search_relevance_service_1.SearchRelevanceService);
  const productsService = app.get(products_service_1.ProductsService);
  const userId = 'demo-user-123';
  console.log('=== PREFERENCE DECAY DEMONSTRATION ===');
  console.log('This demo shows how time-based preference decay affects search personalization');
  console.log('');
  console.log('Step 1: Creating initial user preferences...');
  await userPreferenceService.deleteUserPreferences(userId);
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
  const mockProducts = await getMockProducts(productsService);
  for (const product of mockProducts.slice(0, 3)) {
    await preferenceCollectorService.trackProductView(userId, product);
  }
  console.log('\nStep 2: Showing search results based on initial preferences...');
  const initialResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  console.log('Initial search results for "t-shirt" (showing top 5):');
  displaySearchResults(initialResults.slice(0, 5));
  console.log('\nStep 3: Applying time-based decay to simulate passage of time...');
  console.log('Simulating 60 days of preference decay...');
  const currentPrefs = await userPreferenceService.getUserPreferences(userId);
  const decayFactor = Math.pow(0.5, 60 / 30);
  await preferenceCollectorService.applyImmediateDecay(userId, 'categories', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'brands', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'values', decayFactor);
  await preferenceCollectorService.applyImmediateDecay(userId, 'priceRanges', decayFactor);
  const decayedPrefs = await userPreferenceService.getUserPreferences(userId);
  console.log('Preferences before decay:');
  displayPreferences(currentPrefs);
  console.log('\nPreferences after decay:');
  displayPreferences(decayedPrefs);
  console.log('\nStep 4: Showing search results after decay...');
  const decayedResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  console.log('Search results for "t-shirt" after decay (showing top 5):');
  displaySearchResults(decayedResults.slice(0, 5));
  console.log('\nStep 5: Adding new preferences for athletic wear...');
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');
  await preferenceCollectorService.trackCategoryClick(userId, 'athletic wear');
  for (const product of mockProducts.slice(5, 8)) {
    await preferenceCollectorService.trackProductView(userId, product);
  }
  await preferenceCollectorService.trackSearch(userId, 'running shoes');
  await preferenceCollectorService.trackSearch(userId, 'workout clothes');
  await preferenceCollectorService.trackSearch(userId, 'athletic t-shirts');
  const updatedPrefs = await userPreferenceService.getUserPreferences(userId);
  console.log('Preferences after adding new athletic wear interests:');
  displayPreferences(updatedPrefs);
  console.log('\nSearch results for "t-shirt" with new preferences (showing top 5):');
  const newResults = await simulateSearch('t-shirt', userId, searchRelevanceService);
  displaySearchResults(newResults.slice(0, 5));
  console.log('\nStep 6: Preference decay configuration');
  console.log('Half-life days for different preference types:');
  console.log(`- Categories: ${preferenceDecayService.getHalfLifeDays('categories')} days`);
  console.log(`- Brands: ${preferenceDecayService.getHalfLifeDays('brands')} days`);
  console.log(`- Values: ${preferenceDecayService.getHalfLifeDays('values')} days`);
  console.log(`- Price Ranges: ${preferenceDecayService.getHalfLifeDays('priceRanges')} days`);
  await app.close();
}
async function simulateSearch(query, userId, searchRelevanceService) {
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
  const personalizedQuery = await searchRelevanceService.applyScoringProfile(
    mockQuery,
    'user_preference',
    { id: userId },
  );
  return getMockSearchResults(query, personalizedQuery);
}
async function getMockProducts(productsService) {
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
function getMockSearchResults(query, personalizedQuery) {
  const functions = personalizedQuery.function_score?.functions || [];
  const boosts = {
    categories: {},
    brands: {},
    values: {},
  };
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
      baseScore: 0.6,
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
  const matchingProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()),
  );
  const scoredProducts = matchingProducts.map(product => {
    let personalizedScore = product.baseScore;
    for (const category of product.categories) {
      if (boosts.categories[category]) {
        personalizedScore += boosts.categories[category] * 0.2;
      }
    }
    if (boosts.brands[product.brand]) {
      personalizedScore += boosts.brands[product.brand] * 0.2;
    }
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
  return scoredProducts.sort((a, b) => b.score - a.score);
}
function displaySearchResults(results) {
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
function displayPreferences(prefs) {
  console.log('Top Categories:');
  const categories = Object.entries(prefs.categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  categories.forEach(([category, weight]) => {
    console.log(`- ${category}: ${weight.toFixed(2)}`);
  });
  console.log('\nTop Brands:');
  const brands = Object.entries(prefs.brands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  brands.forEach(([brand, weight]) => {
    console.log(`- ${brand}: ${weight.toFixed(2)}`);
  });
  console.log('\nTop Values:');
  const values = Object.entries(prefs.values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  values.forEach(([value, weight]) => {
    console.log(`- ${value}: ${weight.toFixed(2)}`);
  });
}
bootstrap().catch(error => {
  console.error('Error running preference decay demo:', error);
});
//# sourceMappingURL=preference-decay-demo.js.map
