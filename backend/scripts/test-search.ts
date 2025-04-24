import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductsService } from '../src/modules/products/products.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('TestSearch');
  logger.log('Starting search test...');

  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    // Get the products service
    const productsService = app.get(ProductsService);

    // Test direct database search (without Elasticsearch)
    logger.log('Testing direct database search for "shirt"...');
    const searchResults = await productsService.search('shirt', { page: 1, limit: 10 });
    
    logger.log(`Found ${searchResults.total} products matching "shirt"`);
    if (searchResults.items.length > 0) {
      logger.log('Search results:');
      searchResults.items.forEach((product, index) => {
        logger.log(`${index + 1}. ${product.title} - ${product.price}`);
      });
    } else {
      logger.warn('No products found matching "shirt"');
    }

    // Test search with filters
    logger.log('\nTesting search with category filter...');
    const filteredResults = await productsService.search('', { page: 1, limit: 10 }, {
      categories: ['clothing'],
    });
    
    logger.log(`Found ${filteredResults.total} products in "clothing" category`);
    if (filteredResults.items.length > 0) {
      logger.log('Filtered results:');
      filteredResults.items.forEach((product, index) => {
        logger.log(`${index + 1}. ${product.title} - ${product.price}`);
      });
    } else {
      logger.warn('No products found in "clothing" category');
    }

    // Test search with price range
    logger.log('\nTesting search with price range...');
    const priceRangeResults = await productsService.search('', { page: 1, limit: 10 }, {
      priceMin: 50,
      priceMax: 200,
    });
    
    logger.log(`Found ${priceRangeResults.total} products with price between $50 and $200`);
    if (priceRangeResults.items.length > 0) {
      logger.log('Price range results:');
      priceRangeResults.items.forEach((product, index) => {
        logger.log(`${index + 1}. ${product.title} - ${product.price}`);
      });
    } else {
      logger.warn('No products found in the price range $50-$200');
    }

    // Close the application
    await app.close();
    logger.log('Search test completed successfully!');
  } catch (error) {
    logger.error(`Error during search test: ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
