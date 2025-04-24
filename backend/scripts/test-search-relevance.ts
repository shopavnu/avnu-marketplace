import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SearchService } from '../src/modules/search/search.service';
import { User } from '../src/modules/users/entities/user.entity';
import { EnhancedNlpService } from '../src/modules/nlp/services/enhanced-nlp.service';
import { ABTestingService } from '../src/modules/search/services/ab-testing.service';
import { UserPreferenceService } from '../src/modules/search/services/user-preference.service';
import { GoogleAnalyticsService } from '../src/modules/analytics/services/google-analytics.service';
import { Logger } from '@nestjs/common';

/**
 * Test script to demonstrate the enhanced search capabilities with different options
 */
async function bootstrap() {
  // Create a logger for the test script
  const logger = new Logger('SearchRelevanceTest');
  logger.log('Starting search relevance test...');

  // Create a NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get the services we need
  const searchService = app.get(SearchService);
  const nlpService = app.get(EnhancedNlpService);
  const abTestingService = app.get(ABTestingService);
  const userPrefService = app.get(UserPreferenceService);
  const gaService = app.get(GoogleAnalyticsService);

  // Create a mock user for testing
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    password: 'hashed-password',
    isActive: true,
    isEmailVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  // Generate a client ID for analytics
  const clientId = gaService.generateClientId();

  // Test cases to run
  const testCases = [
    {
      name: 'Basic Search',
      query: 'laptop',
      options: {
        enableNlp: false,
        enablePersonalization: false,
        enableABTesting: false,
        enableAnalytics: false,
      },
    },
    {
      name: 'NLP-Enhanced Search',
      query: 'show me gaming laptops under $1000',
      options: {
        enableNlp: true,
        enablePersonalization: false,
        enableABTesting: false,
        enableAnalytics: false,
      },
    },
    {
      name: 'Personalized Search',
      query: 'laptop',
      options: {
        enableNlp: false,
        enablePersonalization: true,
        enableABTesting: false,
        enableAnalytics: false,
        personalizationStrength: 1.5,
      },
    },
    {
      name: 'A/B Test Search',
      query: 'laptop',
      options: {
        enableNlp: false,
        enablePersonalization: false,
        enableABTesting: true,
        enableAnalytics: false,
      },
    },
    {
      name: 'Full Enhancement Search',
      query: 'I need a powerful laptop for video editing',
      options: {
        enableNlp: true,
        enablePersonalization: true,
        enableABTesting: true,
        enableAnalytics: true,
        personalizationStrength: 1.0,
      },
    },
    {
      name: 'Natural Language Search - Price Range',
      query: 'show me laptops between $800 and $1200',
      options: {
        enableNlp: true,
        enablePersonalization: false,
        enableABTesting: false,
        enableAnalytics: false,
      },
    },
    {
      name: 'Natural Language Search - Brand Specific',
      query: 'Apple MacBook Pro with good battery life',
      options: {
        enableNlp: true,
        enablePersonalization: false,
        enableABTesting: false,
        enableAnalytics: false,
      },
    },
    {
      name: 'Natural Language Search - Sort Order',
      query: 'laptops sorted by price from low to high',
      options: {
        enableNlp: true,
        enablePersonalization: false,
        enableABTesting: false,
        enableAnalytics: false,
      },
    },
  ];

  // Run each test case
  for (const test of testCases) {
    logger.log(`\n---------- Running Test: ${test.name} ----------`);
    logger.log(`Query: "${test.query}"`);
    logger.log(`Options: ${JSON.stringify(test.options, null, 2)}`);

    try {
      // Process NLP first if enabled (for logging purposes)
      if (test.options.enableNlp) {
        const nlpResult = await nlpService.processQuery(test.query);
        logger.log(`NLP Result: 
  - Intent: ${typeof nlpResult.intent === 'string' ? nlpResult.intent : JSON.stringify(nlpResult.intent)}
  - Entities: ${JSON.stringify(nlpResult.entities)}
  - Expanded Query: ${nlpResult.expandedQuery}`);
      }

      // Set up user preferences if personalization is enabled
      if (test.options.enablePersonalization) {
        // Ensure user preferences exist for the test user
        const hasPreferences = await userPrefService.getUserPreferences(mockUser.id);
        if (!hasPreferences) {
          await userPrefService.saveUserPreferences({
            userId: mockUser.id,
            categories: { 'laptops': 0.8, 'electronics': 0.6 },
            brands: { 'Apple': 0.7, 'Dell': 0.5 },
            priceRanges: [{ min: 800, max: 2000, weight: 0.9 }],
            values: {},
            recentSearches: [],
            recentlyViewedProducts: [],
            purchaseHistory: [],
            lastUpdated: Date.now(),
          });
          logger.log('Created test user preferences');
        }
      }

      // Run the search
      const startTime = Date.now();
      const searchResult = await searchService.searchProducts(
        test.query,
        { page: 1, limit: 5 },
        undefined,
        undefined,
        {
          ...test.options,
          user: mockUser,
          clientId,
        }
      );
      const duration = Date.now() - startTime;

      // Log the results
      logger.log(`Search completed in ${duration}ms`);
      logger.log(`Total results: ${searchResult.total}`);
      logger.log(`Metadata: ${JSON.stringify(searchResult.metadata, null, 2)}`);
      
      // Log the top 3 results (or fewer if less than 3)
      const topResults = searchResult.items.slice(0, 3);
      logger.log(`Top ${topResults.length} results:`);
      topResults.forEach((item, index) => {
        // Access _score safely using type assertion if it exists
        const score = (item as any)._score !== undefined ? (item as any)._score : 'N/A';
        logger.log(`  ${index + 1}. ${item.title} - $${item.price} (Score: ${score})`);
      });
    } catch (error) {
      logger.error(`Error in test "${test.name}": ${error.message}`);
    }
  }

  // Test natural language search specifically
  logger.log('\n---------- Testing Natural Language Search ----------');
  const nlpQueries = [
    'show me the best gaming laptops',
    'I need a laptop with good battery life under $1000',
    'what are the top-rated Dell laptops?',
    'laptops with at least 16GB RAM and 512GB SSD',
    'show me Apple products sorted by price high to low',
  ];

  for (const query of nlpQueries) {
    logger.log(`\nNatural Language Query: "${query}"`);
    
    try {
      const result = await searchService.naturalLanguageSearch(
        query,
        { page: 1, limit: 5 },
        mockUser,
        clientId
      );
      
      logger.log(`Total results: ${result.total}`);
      logger.log(`Metadata: ${JSON.stringify(result.metadata, null, 2)}`);
      
      // Log the top 3 results (or fewer if less than 3)
      const topResults = result.items.slice(0, 3);
      logger.log(`Top ${topResults.length} results:`);
      topResults.forEach((item, index) => {
        // Access _score safely using type assertion if it exists
        const score = (item as any)._score !== undefined ? (item as any)._score : 'N/A';
        logger.log(`  ${index + 1}. ${item.title} - $${item.price} (Score: ${score})`);
      });
    } catch (error) {
      logger.error(`Error in NLP query "${query}": ${error.message}`);
    }
  }

  // Test A/B testing variant assignment
  logger.log('\n---------- Testing A/B Testing Variant Assignment ----------');
  const testUsers = [
    { id: 'user-1', clientId: 'client-1' },
    { id: 'user-2', clientId: 'client-2' },
    { id: 'user-3', clientId: 'client-3' },
    { id: 'user-4', clientId: 'client-4' },
    { id: 'user-5', clientId: 'client-5' },
  ];

  for (const user of testUsers) {
    const variant = await abTestingService.assignUserToVariant(
      'search-relevance-test-001',
      user.id,
      user.clientId
    );
    
    logger.log(`User ${user.id} assigned to variant: ${JSON.stringify(variant)}`);
  }

  logger.log('\nSearch relevance test completed.');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error in test script:', err);
  process.exit(1);
});
