import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from '../src/modules/products/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Continuous Scroll Integration Tests', () => {
  let app: INestApplication;
  let productRepository: Repository<Product>;

  // Sample test products
  const testProducts = [
    {
      id: '1',
      title: 'Featured Product 1',
      description: 'This is a featured product for testing',
      price: 99.99,
      compareAtPrice: 129.99,
      images: ['https://via.placeholder.com/800x800?text=Product+1'],
      categories: ['test', 'featured'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      slug: 'featured-product-1',
      featured: true,
      externalId: 'ext-1',
      externalSource: 'test',
    },
    {
      id: '2',
      title: 'Featured Product 2',
      description: 'Another featured product for testing',
      price: 79.99,
      compareAtPrice: 99.99,
      images: ['https://via.placeholder.com/800x800?text=Product+2'],
      categories: ['test', 'featured'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      slug: 'featured-product-2',
      featured: true,
      externalId: 'ext-2',
      externalSource: 'test',
    },
    {
      id: '3',
      title: 'New Arrival 1',
      description: 'A new arrival product for testing',
      price: 49.99,
      images: ['https://via.placeholder.com/800x800?text=Product+3'],
      categories: ['test', 'new-arrival'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      slug: 'new-arrival-1',
      featured: false,
      externalId: 'ext-3',
      externalSource: 'test',
    },
    {
      id: '4',
      title: 'New Arrival 2',
      description: 'Another new arrival for testing',
      price: 59.99,
      images: ['https://via.placeholder.com/800x800?text=Product+4'],
      categories: ['test', 'new-arrival'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      slug: 'new-arrival-2',
      featured: false,
      externalId: 'ext-4',
      externalSource: 'test',
    },
    {
      id: '5',
      title: 'On Sale Product 1',
      description: 'A product on sale for testing',
      price: 39.99,
      compareAtPrice: 59.99,
      images: ['https://via.placeholder.com/800x800?text=Product+5'],
      categories: ['test', 'sale'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      slug: 'on-sale-1',
      featured: false,
      externalId: 'ext-5',
      externalSource: 'test',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get('DB_USERNAME', 'postgres'),
            password: configService.get('DB_PASSWORD', 'postgres'),
            database: configService.get('DB_DATABASE_TEST', 'avnu_marketplace_test'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get the product repository
    productRepository = moduleFixture.get<Repository<Product>>(getRepositoryToken(Product));

    // Clear the database and seed with test data
    await productRepository.clear();
    await productRepository.save(testProducts);
  });

  afterAll(async () => {
    await productRepository.clear();
    await app.close();
  });

  describe('Batch Sections API', () => {
    it('should load multiple sections in a single request', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/sections/batch')
        .send({
          sections: [
            {
              id: 'featured',
              title: 'Featured Products',
              filter: { featured: true },
              limit: 2,
            },
            {
              id: 'new-arrivals',
              title: 'New Arrivals',
              filter: { categories: ['new-arrival'] },
              limit: 2,
            },
            {
              id: 'on-sale',
              title: 'On Sale',
              filter: { compareAtPrice: { $gt: 0 } },
              limit: 2,
            },
          ],
          parallel: true,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sections');
      expect(response.body.sections).toHaveLength(3);

      // Check featured section
      const featuredSection = response.body.sections.find(s => s.id === 'featured');
      expect(featuredSection).toBeDefined();
      expect(featuredSection.items).toHaveLength(2);
      expect(featuredSection.items[0].featured).toBe(true);

      // Check new arrivals section
      const newArrivalsSection = response.body.sections.find(s => s.id === 'new-arrivals');
      expect(newArrivalsSection).toBeDefined();
      expect(newArrivalsSection.items).toHaveLength(2);
      expect(newArrivalsSection.items[0].categories).toContain('new-arrival');

      // Check on sale section
      const onSaleSection = response.body.sections.find(s => s.id === 'on-sale');
      expect(onSaleSection).toBeDefined();
      expect(onSaleSection.items).toHaveLength(2);
      expect(onSaleSection.items[0].compareAtPrice).toBeGreaterThan(0);
    });
  });

  describe('Progressive Loading API', () => {
    it('should load products progressively with HIGH priority', async () => {
      const response = await request(app.getHttpServer()).get('/products/progressive').query({
        limit: 2,
        priority: 'HIGH',
        withMetadata: true,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(2);
      expect(response.body).toHaveProperty('nextCursor');
      expect(response.body).toHaveProperty('hasMore');

      // Verify product structure for consistent card heights
      const product = response.body.items[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('images');

      // Check for image metadata which is crucial for consistent card heights
      expect(product).toHaveProperty('imageMetadata');
      if (product.imageMetadata && product.imageMetadata.length > 0) {
        expect(product.imageMetadata[0]).toHaveProperty('width');
        expect(product.imageMetadata[0]).toHaveProperty('height');
        expect(product.imageMetadata[0]).toHaveProperty('aspectRatio');
      }
    });

    it('should load more products with cursor-based pagination', async () => {
      // First request to get initial products and cursor
      const firstResponse = await request(app.getHttpServer()).get('/products/progressive').query({
        limit: 2,
      });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body).toHaveProperty('nextCursor');

      // Use the cursor to get the next page
      const cursor = firstResponse.body.nextCursor;
      const secondResponse = await request(app.getHttpServer()).get('/products/progressive').query({
        cursor,
        limit: 2,
      });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toHaveProperty('items');
      expect(secondResponse.body.items).toHaveLength(2);

      // Ensure we got different products
      const firstPageIds = firstResponse.body.items.map(p => p.id);
      const secondPageIds = secondResponse.body.items.map(p => p.id);

      // No overlap between pages
      expect(firstPageIds.some(id => secondPageIds.includes(id))).toBe(false);
    });

    it('should load more products with exclusions', async () => {
      // Get IDs of products to exclude
      const excludeIds = [testProducts[0].id, testProducts[1].id];

      // Request products with exclusions
      const response = await request(app.getHttpServer())
        .post('/products/progressive/load-more')
        .send({
          limit: 3,
          exclude: excludeIds,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(3);

      // Verify excluded products are not in the response
      const responseIds = response.body.items.map(p => p.id);
      expect(responseIds.some(id => excludeIds.includes(id))).toBe(false);
    });

    it('should prefetch products for future loading', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/progressive/prefetch')
        .query({
          limit: 2,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Prefetch should return product IDs
      expect(typeof response.body[0]).toBe('string');
    });
  });

  describe('Product Card Consistency', () => {
    it('should return products with consistent image dimensions', async () => {
      const response = await request(app.getHttpServer()).get('/products/progressive').query({
        limit: 5,
        withMetadata: true,
      });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(5);

      // Check that all products have image metadata
      const productsWithMetadata = response.body.items.filter(
        p => p.imageMetadata && p.imageMetadata.length > 0,
      );

      expect(productsWithMetadata.length).toBe(5);

      // Verify consistent dimensions for all product images
      const dimensions = productsWithMetadata.map(p => ({
        width: p.imageMetadata[0].width,
        height: p.imageMetadata[0].height,
      }));

      // All images should have the same dimensions
      const firstDimension = dimensions[0];
      const allSameDimensions = dimensions.every(
        d => d.width === firstDimension.width && d.height === firstDimension.height,
      );

      expect(allSameDimensions).toBe(true);
    });

    it('should handle products with missing images by providing placeholders', async () => {
      // Create a product with no images
      await productRepository.save({
        id: 'no-image-product',
        title: 'Product Without Images',
        description: 'This product has no images',
        price: 29.99,
        categories: ['test'],
        merchantId: 'test-merchant',
        brandName: 'Test Brand',
        slug: 'no-image-product',
        images: [],
        externalId: 'ext-no-image',
        externalSource: 'test',
      });

      // Request the product
      const response = await request(app.getHttpServer())
        .get('/products')
        .query({
          ids: ['no-image-product'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);

      const product = response.body[0];
      expect(product.images).toBeDefined();
      expect(product.images.length).toBeGreaterThan(0);

      // The image URL should contain 'placeholder' indicating it's a placeholder
      expect(product.images[0].includes('placeholder')).toBe(true);
    });
  });
});
