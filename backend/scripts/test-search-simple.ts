import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SearchService } from '../src/modules/search/search.service';
import { Logger } from '@nestjs/common';

/**
 * Simplified test script to demonstrate the enhanced search capabilities
 */
async function bootstrap() {
  // Create a logger for the test script
  const logger = new Logger('SearchRelevanceTest');
  logger.log('Starting search relevance test...');

  // Create a NestJS application
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get the search service
  const searchService = app.get(SearchService);

  // Test queries to run
  const testQueries = [
    {
      name: 'Basic Search',
      query: 'laptop',
    },
    {
      name: 'NLP-Enhanced Search',
      query: 'show me gaming laptops under $1000',
    },
    {
      name: 'Natural Language Search - Price Range',
      query: 'laptops between $800 and $1200',
    },
    {
      name: 'Natural Language Search - Brand Specific',
      query: 'Apple MacBook Pro with good battery life',
    },
    {
      name: 'Natural Language Search - Sort Order',
      query: 'laptops sorted by price from low to high',
    },
  ];

  // Run each test query
  for (const test of testQueries) {
    logger.log(`\n---------- Running Test: ${test.name} ----------`);
    logger.log(`Query: "${test.query}"`);

    try {
      // Run the search with standard options
      const standardResult = await searchService.searchProducts(
        test.query,
        { page: 1, limit: 5 }
      );
      
      logger.log(`Standard search results: ${standardResult.total}`);
      
      // Run the search with NLP
      const nlpResult = await searchService.naturalLanguageSearch(
        test.query,
        { page: 1, limit: 5 }
      );
      
      logger.log(`NLP search results: ${nlpResult.total}`);
      
      if (nlpResult.metadata) {
        logger.log(`NLP Metadata: ${JSON.stringify(nlpResult.metadata, null, 2)}`);
      }
      
      // Compare results
      logger.log(`Difference in result count: ${nlpResult.total - standardResult.total}`);
      
      // Log the top 3 results from NLP search
      const topResults = nlpResult.items.slice(0, 3);
      if (topResults.length > 0) {
        logger.log(`Top ${topResults.length} NLP results:`);
        topResults.forEach((item, index) => {
          logger.log(`  ${index + 1}. ${item.title} - $${item.price}`);
        });
      } else {
        logger.log('No results found');
      }
    } catch (error) {
      logger.error(`Error in test "${test.name}": ${error.message}`);
    }
  }

  logger.log('\nSearch relevance test completed.');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error in test script:', err);
  process.exit(1);
});
