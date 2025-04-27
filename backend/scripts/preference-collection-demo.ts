import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PreferenceCollectorService } from '../src/modules/search/services/preference-collector.service';
import { UserPreferenceService } from '../src/modules/search/services/user-preference.service';
import { SearchService } from '../src/modules/search/search.service';
import { Logger } from '@nestjs/common';
import { ProductsService } from '../src/modules/products/products.service';

/**
 * Demo script to demonstrate user preference collection and personalized search
 */
async function bootstrap() {
  const logger = new Logger('PreferenceCollectionDemo');
  logger.log('Starting preference collection demo...');

  // Create a NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get the services we need
  const preferenceCollector = app.get(PreferenceCollectorService);
  const userPreferenceService = app.get(UserPreferenceService);
  const searchService = app.get(SearchService);
  const productsService = app.get(ProductsService);

  // Create a mock user ID for the demo
  const userId = 'demo-user-' + Date.now();
  logger.log(`Using demo user ID: ${userId}`);

  // Simulate user interactions
  await simulateUserInteractions(userId, preferenceCollector, productsService, logger);

  // Get the user's preferences
  const preferences = await userPreferenceService.getUserPreferences(userId);
  logger.log('User preferences after interactions:');
  logger.log(JSON.stringify(preferences, null, 2));

  // Perform a search with and without personalization
  await compareSearchResults(userId, searchService, logger);

  logger.log('Preference collection demo completed.');
  await app.close();
}

/**
 * Simulate a series of user interactions to build preferences
 */
async function simulateUserInteractions(
  userId: string,
  preferenceCollector: PreferenceCollectorService,
  productsService: ProductsService,
  logger: Logger,
) {
  logger.log('Simulating user interactions...');

  // 1. Simulate search queries
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
    // Add a small delay to simulate real user behavior
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 2. Simulate product views
  // Get some products from the database
  const productsResponse = await productsService.findAll({ limit: 10 });
  const products = productsResponse.items;

  // View gaming-related products
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

  // 3. Simulate add to cart
  if (gamingProducts.length > 0) {
    const productToCart = gamingProducts[0];
    logger.log(`User adds to cart: "${productToCart.title}"`);
    await preferenceCollector.trackAddToCart(userId, productToCart, 1);
  }

  // 4. Simulate category clicks
  const categories = ['gaming', 'electronics', 'accessories'];
  for (const category of categories) {
    logger.log(`User clicks on category: "${category}"`);
    await preferenceCollector.trackCategoryClick(userId, category);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 5. Simulate brand clicks
  const brands = ['Razer', 'Logitech', 'SteelSeries'];
  for (const brand of brands) {
    logger.log(`User clicks on brand: "${brand}"`);
    await preferenceCollector.trackBrandClick(userId, brand);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 6. Simulate filter application
  logger.log('User applies filters');
  await preferenceCollector.trackFilterApply(userId, {
    priceMin: 100,
    priceMax: 500,
    categories: ['gaming', 'electronics'],
    inStock: true,
  });

  logger.log('User interactions simulated successfully');
}

/**
 * Compare search results with and without personalization
 */
async function compareSearchResults(userId: string, searchService: SearchService, logger: Logger) {
  logger.log('\nComparing search results with and without personalization...');

  // Test query
  const query = 'laptop';

  // Standard search without personalization
  logger.log(`\nStandard search for: "${query}"`);
  const standardResults = await searchService.searchProducts(query, { page: 1, limit: 5 });

  logger.log(`Found ${standardResults.total} results`);
  if (standardResults.items.length > 0) {
    logger.log('Top 3 standard results:');
    standardResults.items.slice(0, 3).forEach((item, index) => {
      logger.log(`${index + 1}. ${item.title} - $${item.price}`);
    });
  }

  // Personalized search
  logger.log(`\nPersonalized search for: "${query}"`);
  const personalizedResults = await searchService.searchProducts(
    query,
    { page: 1, limit: 5 },
    undefined,
    undefined,
    {
      enablePersonalization: true,
      personalizationStrength: 1.5,
      user: { id: userId } as any,
    },
  );

  logger.log(`Found ${personalizedResults.total} results`);
  if (personalizedResults.items.length > 0) {
    logger.log('Top 3 personalized results:');
    personalizedResults.items.slice(0, 3).forEach((item, index) => {
      logger.log(`${index + 1}. ${item.title} - $${item.price}`);
    });
  }

  // Compare results
  logger.log('\nAnalyzing differences in search results:');

  // Check if the order of results has changed
  const standardIds = standardResults.items.map(item => item.id);
  const personalizedIds = personalizedResults.items.map(item => item.id);

  const orderChanged = !standardIds.every((id, index) => personalizedIds[index] === id);
  logger.log(`Order of results changed: ${orderChanged}`);

  // Check for new items in personalized results
  const newItems = personalizedIds.filter(id => !standardIds.includes(id));
  if (newItems.length > 0) {
    logger.log(`${newItems.length} new items appeared in personalized results`);
    newItems.forEach(id => {
      const item = personalizedResults.items.find(i => i.id === id);
      logger.log(`- ${item.title} - $${item.price}`);
    });
  }

  // Log metadata if available
  if (personalizedResults.metadata) {
    logger.log('\nPersonalization metadata:');
    logger.log(JSON.stringify(personalizedResults.metadata, null, 2));
  }
}

// Run the demo
bootstrap().catch(err => {
  console.error('Error in preference collection demo:', err);
  process.exit(1);
});
