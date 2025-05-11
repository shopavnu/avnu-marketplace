'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('../app.module');
const image_processing_service_1 = require('../modules/products/services/image-processing.service');
const data_normalization_service_1 = require('../modules/products/services/data-normalization.service');
const image_validation_service_1 = require('../modules/products/services/image-validation.service');
const common_1 = require('@nestjs/common');
const logger = new common_1.Logger('ProductCardConsistencyTest');
const testProducts = [
  {
    title: 'Product with Large Image',
    description: 'This product has a large image that needs to be resized',
    price: 99.99,
    images: ['https://via.placeholder.com/1200x1200?text=Large+Image'],
    categories: ['test'],
    merchantId: 'test-merchant',
    brandName: 'Test Brand',
    externalId: 'ext-1',
    externalSource: 'test',
  },
  {
    title: 'Product with Small Image',
    description: 'This product has a small image that needs to be enlarged',
    price: 79.99,
    images: ['https://via.placeholder.com/400x400?text=Small+Image'],
    categories: ['test'],
    merchantId: 'test-merchant',
    brandName: 'Test Brand',
    externalId: 'ext-2',
    externalSource: 'test',
  },
  {
    title: 'Product with Non-Square Image',
    description: 'This product has a non-square image that needs aspect ratio correction',
    price: 49.99,
    images: ['https://via.placeholder.com/800x600?text=Non+Square'],
    categories: ['test'],
    merchantId: 'test-merchant',
    brandName: 'Test Brand',
    externalId: 'ext-3',
    externalSource: 'test',
  },
  {
    title: 'Product with No Image',
    description: 'This product has no image and should get a placeholder',
    price: 59.99,
    images: [],
    categories: ['test'],
    merchantId: 'test-merchant',
    brandName: 'Test Brand',
    externalId: 'ext-4',
    externalSource: 'test',
  },
  {
    title: 'Product with Very Long Description',
    description:
      'This product has an extremely long description that would normally cause layout issues if not properly handled. The description goes on and on with unnecessary details just to test how the system handles long text content. We want to make sure that regardless of description length, the product card maintains a consistent height of 360px as specified in the frontend components. This is crucial for maintaining a clean grid layout with no visual jumps or layout shifts during scrolling, which is a key requirement for our continuous scroll implementation.',
    price: 39.99,
    images: ['https://via.placeholder.com/800x800?text=Normal+Image'],
    categories: ['test'],
    merchantId: 'test-merchant',
    brandName: 'Test Brand',
    externalId: 'ext-5',
    externalSource: 'test',
  },
];
async function testProductCardConsistency() {
  logger.log('Starting product card consistency test...');
  const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
  try {
    const imageProcessingService = app.get(image_processing_service_1.ImageProcessingService);
    const dataNormalizationService = app.get(data_normalization_service_1.DataNormalizationService);
    const imageValidationService = app.get(image_validation_service_1.ImageValidationService);
    logger.log('Services initialized successfully');
    logger.log('Testing image validation...');
    for (const product of testProducts) {
      if (product.images.length > 0) {
        const firstImage = product.images[0];
        const validationResult = await imageValidationService.validateImage(firstImage);
        logger.log(
          `Image validation for ${product.title}: ${validationResult.isValid ? 'Valid' : 'Invalid'}`,
        );
        if (validationResult.isValid) {
          logger.log(
            `  Dimensions: ${validationResult.width}x${validationResult.height}, Aspect Ratio: ${validationResult.aspectRatio}`,
          );
        } else {
          logger.log(`  Reason: ${validationResult.error}`);
        }
      } else {
        logger.log(`No image to validate for ${product.title}`);
      }
    }
    logger.log('\nTesting image processing...');
    for (const product of testProducts) {
      if (product.images.length > 0) {
        try {
          const processedImages = await imageProcessingService.processImages(product.images);
          logger.log(`Processed images for ${product.title}: ${processedImages.length} images`);
          logger.log(`  Original: ${product.images[0]}`);
          logger.log(`  Processed: ${processedImages[0]}`);
        } catch (error) {
          logger.error(`Error processing images for ${product.title}: ${error.message}`);
        }
      } else {
        logger.log(`No images to process for ${product.title}`);
      }
    }
    logger.log('\nTesting data normalization...');
    for (const product of testProducts) {
      try {
        const normalizedProduct = await dataNormalizationService.normalizeProductData(
          product,
          'manual',
          {
            processImages: true,
            validateImages: true,
            sanitizeText: true,
            enforceRequiredFields: true,
          },
        );
        logger.log(`Normalized product: ${normalizedProduct.title}`);
        logger.log(`  Images: ${normalizedProduct.images.length} images`);
        logger.log(`  Description length: ${normalizedProduct.description.length} characters`);
        if (product.images.length === 0 && normalizedProduct.images.length > 0) {
          logger.log(`  ✅ Placeholder images added successfully`);
        }
        if (product.description !== normalizedProduct.description) {
          logger.log(`  ✅ Description was sanitized`);
        }
      } catch (error) {
        logger.error(`Error normalizing product ${product.title}: ${error.message}`);
      }
    }
    logger.log('\nProduct card consistency test completed successfully!');
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
  } finally {
    await app.close();
  }
}
testProductCardConsistency().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
//# sourceMappingURL=test-product-card-consistency.js.map
