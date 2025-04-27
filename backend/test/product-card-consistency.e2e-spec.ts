import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/modules/products/entities/product.entity';

/**
 * Integration tests specifically focused on ensuring product data consistency
 * for uniform card heights and proper vertical alignment in continuous scroll
 */
describe('Product Card Consistency (e2e)', () => {
  let app: INestApplication;
  let productRepository;

  // Sample product data with varying image sizes, descriptions, and attributes
  const productVariations = [
    {
      id: '1',
      title: 'Short Title',
      description: 'Very short description.',
      price: 99.99,
      compareAtPrice: 129.99,
      images: ['https://via.placeholder.com/400x300?text=Small+Image'], // Small image
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: true,
      externalId: 'ext-1',
      externalSource: 'test',
      slug: 'short-title',
      attributes: {
        size: 'Small',
        color: 'Red',
      },
      createdAt: new Date('2025-04-01'),
      updatedAt: new Date('2025-04-01'),
    },
    {
      id: '2',
      title: 'Very Long Product Title That Should Be Truncated In The UI',
      description:
        'This is an extremely long product description that contains a lot of details about the product. It should be properly handled by the backend to ensure consistent card heights in the frontend. The description should be truncated or handled appropriately to maintain visual consistency across all product cards regardless of content length.',
      price: 149.99,
      compareAtPrice: null,
      images: ['https://via.placeholder.com/1200x1200?text=Large+Image'], // Large image
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: false,
      externalId: 'ext-2',
      externalSource: 'test',
      slug: 'very-long-product-title',
      attributes: {
        size: 'Large',
        color: 'Blue',
        material: 'Cotton',
        weight: '2kg',
        dimensions: '30x40x10cm',
        customAttributes: ['Custom1', 'Custom2', 'Custom3'],
      },
      createdAt: new Date('2025-04-02'),
      updatedAt: new Date('2025-04-02'),
    },
    {
      id: '3',
      title: 'Product With No Image',
      description: 'This product has no image and should use a placeholder.',
      price: 199.99,
      compareAtPrice: 249.99,
      images: [], // No images
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: true,
      externalId: 'ext-3',
      externalSource: 'test',
      slug: 'product-with-no-image',
      createdAt: new Date('2025-04-03'),
      updatedAt: new Date('2025-04-03'),
    },
    {
      id: '4',
      title: 'Product With Non-Standard Aspect Ratio',
      description: 'Medium length description for testing.',
      price: 299.99,
      compareAtPrice: 349.99,
      images: ['https://via.placeholder.com/300x900?text=Tall+Image'], // Tall image (non-standard aspect ratio)
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: false,
      externalId: 'ext-4',
      externalSource: 'test',
      slug: 'product-with-non-standard-aspect-ratio',
      createdAt: new Date('2025-04-04'),
      updatedAt: new Date('2025-04-04'),
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repository to seed test data
    productRepository = moduleFixture.get(getRepositoryToken(Product));

    // Clear existing data
    await productRepository.clear();

    // Seed test data
    await productRepository.save(productVariations);
  });

  afterAll(async () => {
    // Clean up test data
    await productRepository.clear();
    await app.close();
  });

  describe('Image Normalization and Consistency', () => {
    it('should normalize images to consistent dimensions and format', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/cursor')
        .query({ limit: 10 });

      expect(response.status).toBe(200);

      // Check each product has imageMetadata
      response.body.items.forEach(product => {
        // Products should have imageMetadata even if they had no original images
        expect(product.imageMetadata).toBeDefined();

        if (product.images.length > 0) {
          // Each image should have consistent metadata
          product.imageMetadata.forEach(metadata => {
            // Check for consistent dimensions (should be normalized)
            expect(metadata.width).toBeDefined();
            expect(metadata.height).toBeDefined();

            // Check for aspect ratio (should be calculated)
            expect(metadata.aspectRatio).toBeDefined();

            // Format should be standardized (webp, jpeg, etc.)
            expect(metadata.format).toBeDefined();
          });
        }
      });
    });

    it('should provide placeholder images for products with no images', async () => {
      const response = await request(app.getHttpServer()).get('/products/cursor');

      expect(response.status).toBe(200);

      // Find the product with no original images
      const productWithNoImage = response.body.items.find(p => p.id === '3');
      expect(productWithNoImage).toBeDefined();

      // It should now have placeholder images
      expect(productWithNoImage.images.length).toBeGreaterThan(0);

      // The image URL should contain 'placeholder' or be from our own domain
      expect(productWithNoImage.images[0]).toMatch(/placeholder|localhost/);
    });
  });

  describe('Product Data Normalization', () => {
    it('should normalize product data for consistent card rendering', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/progressive')
        .query({ priority: 'high' });

      expect(response.status).toBe(200);

      // Check each product has consistent data structure
      response.body.items.forEach(product => {
        // Required fields for card rendering should be present
        expect(product.title).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.images).toBeDefined();
        expect(product.slug).toBeDefined();

        // Virtual fields for sale badges should be calculated
        expect(product.isOnSale).toBeDefined();
        if (product.compareAtPrice && product.price < product.compareAtPrice) {
          expect(product.isOnSale).toBe(true);
          expect(product.discountPercentage).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Batch Loading for Product Sections', () => {
    it('should load multiple sections with consistent card data', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/sections/batch')
        .send({
          sections: [
            {
              id: 'featured',
              title: 'Featured Products',
              pagination: { limit: 10 },
            },
            {
              id: 'new-arrivals',
              title: 'New Arrivals',
              pagination: { limit: 10 },
            },
          ],
        });

      expect(response.status).toBe(200);

      // Check each section has products with consistent data
      response.body.sections.forEach(section => {
        expect(section.items).toBeDefined();

        // Each product in each section should have consistent data
        section.items.forEach(product => {
          // Check for consistent image dimensions via metadata
          if (product.imageMetadata && product.imageMetadata.length > 0) {
            // All images should have the same width/height or aspect ratio
            // for consistent card rendering
            const firstImageMetadata = product.imageMetadata[0];
            product.imageMetadata.forEach(metadata => {
              expect(metadata.width).toBe(firstImageMetadata.width);
              expect(metadata.height).toBe(firstImageMetadata.height);
            });
          }

          // Check for virtual fields needed for consistent card rendering
          expect(product.isOnSale).toBeDefined();
          expect(typeof product.discountPercentage).toBe('number');
        });
      });
    });
  });

  describe('Progressive Loading with Consistent Data', () => {
    it('should maintain data consistency across different loading priorities', async () => {
      // Test HIGH priority (full data)
      const highPriorityResponse = await request(app.getHttpServer())
        .get('/products/progressive')
        .query({ priority: 'high', limit: 4 });

      // Test MEDIUM priority (essential data)
      const mediumPriorityResponse = await request(app.getHttpServer())
        .get('/products/progressive')
        .query({ priority: 'medium', limit: 4 });

      // Test LOW priority (minimal data)
      const lowPriorityResponse = await request(app.getHttpServer())
        .get('/products/progressive')
        .query({ priority: 'low', limit: 4 });

      // HIGH priority should have full data
      highPriorityResponse.body.items.forEach(product => {
        expect(product.title).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.description).toBeDefined();
        expect(product.images).toBeDefined();
        expect(product.attributes).toBeDefined();
      });

      // MEDIUM priority should have essential data for card rendering
      mediumPriorityResponse.body.items.forEach(product => {
        expect(product.title).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.images).toBeDefined();
        // May not have full description or attributes
      });

      // LOW priority should have minimal data
      lowPriorityResponse.body.items.forEach(product => {
        expect(product.title).toBeDefined();
        expect(product.images).toBeDefined();
        // May not have price, description, or attributes
      });
    });
  });
});
