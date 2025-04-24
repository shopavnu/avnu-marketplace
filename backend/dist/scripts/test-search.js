"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const products_service_1 = require("../src/modules/products/products.service");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('TestSearch');
    logger.log('Starting search test...');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug'],
        });
        const productsService = app.get(products_service_1.ProductsService);
        logger.log('Testing direct database search for "shirt"...');
        const searchResults = await productsService.search('shirt', { page: 1, limit: 10 });
        logger.log(`Found ${searchResults.total} products matching "shirt"`);
        if (searchResults.items.length > 0) {
            logger.log('Search results:');
            searchResults.items.forEach((product, index) => {
                logger.log(`${index + 1}. ${product.title} - ${product.price}`);
            });
        }
        else {
            logger.warn('No products found matching "shirt"');
        }
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
        }
        else {
            logger.warn('No products found in "clothing" category');
        }
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
        }
        else {
            logger.warn('No products found in the price range $50-$200');
        }
        await app.close();
        logger.log('Search test completed successfully!');
    }
    catch (error) {
        logger.error(`Error during search test: ${error.message}`);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=test-search.js.map