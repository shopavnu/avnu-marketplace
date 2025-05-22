'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('../src/app.module');
const preference_collector_service_1 = require('../src/modules/search/services/preference-collector.service');
const user_preference_service_1 = require('../src/modules/search/services/user-preference.service');
const search_service_1 = require('../src/modules/search/search.service');
const common_1 = require('@nestjs/common');
const products_service_1 = require('../src/modules/products/products.service');
async function bootstrap() {
  const logger = new common_1.Logger('PreferenceCollectionDemo');
  logger.log('Starting preference collection demo...');
  const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
  const preferenceCollector = app.get(preference_collector_service_1.PreferenceCollectorService);
  const userPreferenceService = app.get(user_preference_service_1.UserPreferenceService);
  const searchService = app.get(search_service_1.SearchService);
  const productsService = app.get(products_service_1.ProductsService);
  const userId = 'demo-user-' + Date.now();
  logger.log(`Using demo user ID: ${userId}`);
  await simulateUserInteractions(userId, preferenceCollector, productsService, logger);
  const preferences = await userPreferenceService.getUserPreferences(userId);
  logger.log('User preferences after interactions:');
  logger.log(JSON.stringify(preferences, null, 2));
  await compareSearchResults(userId, searchService, logger);
  logger.log('Preference collection demo completed.');
  await app.close();
}
async function simulateUserInteractions(userId, preferenceCollector, productsService, logger) {
  logger.log('Simulating user interactions...');
  const searchQueries = [
    'gaming laptop',
    'mechanical keyboard',
    'gaming mouse',
    'gaming headset',
    'gaming monitor',
  ];
  for (const query of searchQueries) {
    logger.log(`User searches for: "${query}"`);
    await preferenceCollector.trackSearch(userId, query);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const productsResponse = await productsService.findAll({ limit: 10 });
  const products = productsResponse.items;
  const gamingProducts = products.filter(
    p =>
      p.title.toLowerCase().includes('gaming') ||
      (p.categories && p.categories.some(c => c.toLowerCase().includes('gaming'))),
  );
  for (const product of gamingProducts.slice(0, 3)) {
    logger.log(`User views product: "${product.title}"`);
    await preferenceCollector.trackProductView(userId, product, 'search');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (gamingProducts.length > 0) {
    const productToCart = gamingProducts[0];
    logger.log(`User adds to cart: "${productToCart.title}"`);
    await preferenceCollector.trackAddToCart(userId, productToCart, 1);
  }
  const categories = ['gaming', 'electronics', 'accessories'];
  for (const category of categories) {
    logger.log(`User clicks on category: "${category}"`);
    await preferenceCollector.trackCategoryClick(userId, category);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const brands = ['Razer', 'Logitech', 'SteelSeries'];
  for (const brand of brands) {
    logger.log(`User clicks on brand: "${brand}"`);
    await preferenceCollector.trackBrandClick(userId, brand);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  logger.log('User applies filters');
  await preferenceCollector.trackFilterApply(userId, {
    priceMin: 100,
    priceMax: 500,
    categories: ['gaming', 'electronics'],
    inStock: true,
  });
  logger.log('User interactions simulated successfully');
}
async function compareSearchResults(userId, searchService, logger) {
  logger.log('\nComparing search results with and without personalization...');
  const query = 'laptop';
  logger.log(`\nStandard search for: "${query}"`);
  const standardResults = await searchService.searchProducts(query, { page: 1, limit: 5 });
  logger.log(`Found ${standardResults.total} results`);
  if (standardResults.items.length > 0) {
    logger.log('Top 3 standard results:');
    standardResults.items.slice(0, 3).forEach((item, index) => {
      logger.log(`${index + 1}. ${item.title} - $${item.price}`);
    });
  }
  logger.log(`\nPersonalized search for: "${query}"`);
  const personalizedResults = await searchService.searchProducts(
    query,
    { page: 1, limit: 5 },
    undefined,
    undefined,
    {
      enablePersonalization: true,
      personalizationStrength: 1.5,
      user: { id: userId },
    },
  );
  logger.log(`Found ${personalizedResults.total} results`);
  if (personalizedResults.items.length > 0) {
    logger.log('Top 3 personalized results:');
    personalizedResults.items.slice(0, 3).forEach((item, index) => {
      logger.log(`${index + 1}. ${item.title} - $${item.price}`);
    });
  }
  logger.log('\nAnalyzing differences in search results:');
  const standardIds = standardResults.items.map(item => item.id);
  const personalizedIds = personalizedResults.items.map(item => item.id);
  const orderChanged = !standardIds.every((id, index) => personalizedIds[index] === id);
  logger.log(`Order of results changed: ${orderChanged}`);
  const newItems = personalizedIds.filter(id => !standardIds.includes(id));
  if (newItems.length > 0) {
    logger.log(`${newItems.length} new items appeared in personalized results`);
    newItems.forEach(id => {
      const item = personalizedResults.items.find(i => i.id === id);
      logger.log(`- ${item.title} - $${item.price}`);
    });
  }
  if (personalizedResults.metadata) {
    logger.log('\nPersonalization metadata:');
    logger.log(JSON.stringify(personalizedResults.metadata, null, 2));
  }
}
bootstrap().catch(err => {
  console.error('Error in preference collection demo:', err);
  process.exit(1);
});
//# sourceMappingURL=preference-collection-demo.js.map
