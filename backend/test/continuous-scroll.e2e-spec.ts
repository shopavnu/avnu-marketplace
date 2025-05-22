import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/modules/products/entities/product.entity';

describe('Continuous Scroll Features (e2e)', () => {
  let app: INestApplication;
  let productRepository;

  // Sample product data for testing
  const sampleProducts = [
    {
      id: '1',
      title: 'Test Product 1',
      description: 'Description for test product 1',
      price: 99.99,
      compareAtPrice: 129.99,
      images: ['https://via.placeholder.com/800x800?text=Product+1'],
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: true,
      externalId: 'ext-1',
      externalSource: 'test',
      slug: 'test-product-1',
      createdAt: new Date('2025-04-01'),
      updatedAt: new Date('2025-04-01'),
    },
    {
      id: '2',
      title: 'Test Product 2',
      description: 'Description for test product 2',
      price: 149.99,
      compareAtPrice: null,
      images: ['https://via.placeholder.com/800x800?text=Product+2'],
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: false,
      externalId: 'ext-2',
      externalSource: 'test',
      slug: 'test-product-2',
      createdAt: new Date('2025-04-02'),
      updatedAt: new Date('2025-04-02'),
    },
    {
      id: '3',
      title: 'Test Product 3',
      description: 'Description for test product 3',
      price: 199.99,
      compareAtPrice: 249.99,
      images: ['https://via.placeholder.com/800x800?text=Product+3'],
      categories: ['test'],
      merchantId: 'test-merchant',
      brandName: 'Test Brand',
      isActive: true,
      inStock: true,
      featured: true,
      externalId: 'ext-3',
      externalSource: 'test',
      slug: 'test-product-3',
      createdAt: new Date('2025-04-03'),
      updatedAt: new Date('2025-04-03'),
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
    await productRepository.save(sampleProducts);
  });

  afterAll(async () => {
    // Clean up test data
    await productRepository.clear();
    await app.close();
  });

  describe('Cursor-based Pagination', () => {
    it('/products/cursor (GET) should return products with cursor', () => {
      return request(app.getHttpServer())
        .get('/products/cursor')
        .query({ limit: 2 })
        .expect(200)
        .expect(res => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.nextCursor).toBeDefined();
          expect(res.body.hasMore).toBe(true);
        });
    });

    it('/products/cursor (GET) should navigate using cursor', async () => {
      // First request to get cursor
      const firstResponse = await request(app.getHttpServer())
        .get('/products/cursor')
        .query({ limit: 1 });

      const cursor = firstResponse.body.nextCursor;

      // Second request using cursor
      return request(app.getHttpServer())
        .get('/products/cursor')
        .query({ cursor, limit: 1 })
        .expect(200)
        .expect(res => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].id).not.toBe(firstResponse.body.items[0].id);
        });
    });
  });

  describe('Batch Sections API', () => {
    it('/products/sections/batch (POST) should load multiple sections', () => {
      return request(app.getHttpServer())
        .post('/products/sections/batch')
        .send({
          sections: [
            {
              id: 'new-arrivals',
              title: 'New Arrivals',
              pagination: { limit: 2 },
            },
            {
              id: 'featured',
              title: 'Featured Products',
              pagination: { limit: 2 },
            },
          ],
          parallel: true,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.sections).toHaveLength(2);
          expect(res.body.sections[0].id).toBe('new-arrivals');
          expect(res.body.sections[1].id).toBe('featured');
          expect(res.body.meta).toBeDefined();
        });
    });
  });

  describe('Progressive Loading', () => {
    it('/products/progressive (GET) should load with HIGH priority', () => {
      return request(app.getHttpServer())
        .get('/products/progressive')
        .query({
          limit: 2,
          priority: 'high',
          withMetadata: true,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.metadata).toBeDefined();
          expect(res.body.metadata.totalCount).toBeDefined();
        });
    });

    it('/products/progressive/prefetch (GET) should prefetch products', () => {
      return request(app.getHttpServer())
        .get('/products/progressive/prefetch')
        .query({ limit: 2 })
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/products/progressive/load-more (POST) should exclude specified products', () => {
      return request(app.getHttpServer())
        .post('/products/progressive/load-more')
        .send({
          limit: 2,
          exclude: ['1'], // Exclude first product
        })
        .expect(200)
        .expect(res => {
          expect(res.body.items).toBeDefined();
          expect(res.body.items.some(item => item.id === '1')).toBe(false);
        });
    });
  });
});
