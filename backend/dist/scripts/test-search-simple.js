'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('../src/app.module');
const search_service_1 = require('../src/modules/search/search.service');
const common_1 = require('@nestjs/common');
async function bootstrap() {
  const logger = new common_1.Logger('SearchRelevanceTest');
  logger.log('Starting search relevance test...');
  const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
  const searchService = app.get(search_service_1.SearchService);
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
  for (const test of testQueries) {
    logger.log(`\n---------- Running Test: ${test.name} ----------`);
    logger.log(`Query: "${test.query}"`);
    try {
      const standardResult = await searchService.searchProducts(test.query, { page: 1, limit: 5 });
      logger.log(`Standard search results: ${standardResult.total}`);
      const nlpResult = await searchService.naturalLanguageSearch(test.query, {
        page: 1,
        limit: 5,
      });
      logger.log(`NLP search results: ${nlpResult.total}`);
      if (nlpResult.metadata) {
        logger.log(`NLP Metadata: ${JSON.stringify(nlpResult.metadata, null, 2)}`);
      }
      logger.log(`Difference in result count: ${nlpResult.total - standardResult.total}`);
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
//# sourceMappingURL=test-search-simple.js.map
