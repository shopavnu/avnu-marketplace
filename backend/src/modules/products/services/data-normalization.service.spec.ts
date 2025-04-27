import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataNormalizationService, DataSource } from './data-normalization.service';
import { ImageValidationService } from './image-validation.service';
import { ImageProcessingService } from './image-processing.service';
import * as sanitizeHtml from 'sanitize-html';

// Mock dependencies
jest.mock('./image-validation.service');
jest.mock('./image-processing.service');
jest.mock('sanitize-html');

describe('DataNormalizationService', () => {
  let service: DataNormalizationService;
  let _imageValidationService: ImageValidationService;
  let _imageProcessingService: ImageProcessingService;
  let _configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataNormalizationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(key => {
              const config = {
                PLACEHOLDER_IMAGE_URL: 'https://via.placeholder.com/800x800',
              };
              return config[key];
            }),
          },
        },
        {
          provide: ImageValidationService,
          useValue: {
            validateImage: jest.fn(),
            validateImages: jest.fn(),
            areAllImagesValid: jest.fn(),
            getValidImages: jest.fn(),
          },
        },
        {
          provide: ImageProcessingService,
          useValue: {
            processImage: jest.fn(),
            processImages: jest.fn(),
            generateThumbnail: jest.fn(),
            optimizeImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DataNormalizationService>(DataNormalizationService);
    _imageValidationService = module.get<ImageValidationService>(ImageValidationService);
    _imageProcessingService = module.get<ImageProcessingService>(ImageProcessingService);
    _configService = module.get<ConfigService>(ConfigService);

    // Mock sanitizeHtml
    (sanitizeHtml as jest.Mock).mockImplementation(text => `sanitized-${text}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeProductData', () => {
    it('should normalize manual product data', async () => {
      // Mock processProductImages
      jest.spyOn(service as any, 'processProductImages').mockResolvedValue({
        validImages: ['https://example.com/processed1.webp', 'https://example.com/processed2.webp'],
        invalidImages: [],
        metadata: [
          { width: 800, height: 800, format: 'webp', aspectRatio: 1 },
          { width: 800, height: 800, format: 'webp', aspectRatio: 1 },
        ],
      });

      // Mock sanitizeText and sanitizeHtml
      jest.spyOn(service as any, 'sanitizeText').mockImplementation(text => `sanitized-${text}`);
      jest.spyOn(service as any, 'sanitizeHtml').mockImplementation(html => `sanitized-${html}`);

      // Mock generateSlug
      jest.spyOn(service as any, 'generateSlug').mockReturnValue('test-product-slug');

      const productData = {
        title: 'Test Product',
        description: '<p>Product description</p>',
        price: 99.99,
        compareAtPrice: 129.99,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        categories: ['category1', 'category2'],
        merchantId: 'merchant123',
        externalId: 'external123',
        externalSource: DataSource.MANUAL,
        attributes: {
          size: 'Medium',
          color: 'Blue',
          material: 'Cotton',
        },
      };

      const result = await service.normalizeProductData(productData, DataSource.MANUAL);

      // Verify basic normalization
      expect(result.title).toBe('sanitized-Test Product');
      expect(result.description).toBe('sanitized-<p>Product description</p>');
      expect(result.price).toBe(99.99);
      expect(result.compareAtPrice).toBe(129.99);
      expect(result.slug).toBe('test-product-slug');

      // Verify images were processed
      expect(service['processProductImages']).toHaveBeenCalledWith(productData.images);
      expect(result.images).toEqual([
        'https://example.com/processed1.webp',
        'https://example.com/processed2.webp',
      ]);

      // Verify categories were preserved
      expect(result.categories).toEqual(['category1', 'category2']);

      // Verify attributes were preserved
      expect(result.attributes).toEqual({
        size: 'Medium',
        color: 'Blue',
        material: 'Cotton',
      });
    });

    it('should normalize Shopify product data', async () => {
      // Mock processProductImages
      jest.spyOn(service as any, 'processProductImages').mockResolvedValue({
        validImages: ['https://example.com/processed1.webp'],
        invalidImages: [],
        metadata: [{ width: 800, height: 800, format: 'webp', aspectRatio: 1 }],
      });

      // Mock sanitizeText and sanitizeHtml
      jest.spyOn(service as any, 'sanitizeText').mockImplementation(text => `sanitized-${text}`);
      jest.spyOn(service as any, 'sanitizeHtml').mockImplementation(html => `sanitized-${html}`);

      // Mock generateSlug
      jest.spyOn(service as any, 'generateSlug').mockReturnValue('shopify-product-slug');

      const shopifyProductData = {
        title: 'Shopify Product',
        body_html: '<p>Shopify product description</p>',
        variants: [
          {
            price: '149.99',
            compare_at_price: '199.99',
          },
        ],
        images: [{ src: 'https://example.com/shopify-image.jpg' }],
        product_type: 'Clothing',
        tags: 'tag1,tag2',
        id: 'shopify123',
        vendor: 'ShopifyVendor',
        options: [
          { name: 'Size', values: ['S', 'M', 'L'] },
          { name: 'Color', values: ['Red', 'Blue'] },
        ],
      };

      const result = await service.normalizeProductData(shopifyProductData, DataSource.SHOPIFY);

      // Verify Shopify-specific normalization
      expect(result.title).toBe('sanitized-Shopify Product');
      expect(result.description).toBe('sanitized-<p>Shopify product description</p>');
      expect(result.price).toBe(149.99);
      expect(result.compareAtPrice).toBe(199.99);
      expect(result.slug).toBe('shopify-product-slug');
      expect(result.externalSource).toBe(DataSource.SHOPIFY);
      expect(result.externalId).toBe('shopify123');

      // Verify images were processed
      expect(service['processProductImages']).toHaveBeenCalledWith([
        'https://example.com/shopify-image.jpg',
      ]);

      // Verify attributes were extracted
      expect(result.attributes).toBeDefined();
      expect(result.attributes.size).toEqual(['S', 'M', 'L']);
      expect(result.attributes.color).toEqual(['Red', 'Blue']);
    });

    it('should handle missing required fields', async () => {
      // Mock processProductImages
      jest.spyOn(service as any, 'processProductImages').mockResolvedValue({
        validImages: [],
        invalidImages: [],
        metadata: [],
      });

      // Mock getPlaceholderImages
      jest
        .spyOn(service as any, 'getPlaceholderImages')
        .mockReturnValue(['https://via.placeholder.com/800x800?text=Product+Image']);

      const incompleteProductData = {
        // Missing title, description, and images
        price: 49.99,
        categories: ['category1'],
      };

      const result = await service.normalizeProductData(incompleteProductData, DataSource.MANUAL, {
        enforceRequiredFields: true,
      });

      // Verify default values were applied
      expect(result.title).toBe('Untitled Product');
      expect(result.description).toBe('No description available');
      expect(result.images).toEqual(['https://via.placeholder.com/800x800?text=Product+Image']);
      expect(result.price).toBe(49.99);
      expect(result.categories).toEqual(['category1']);
    });
  });

  describe('normalizeProduct', () => {
    it('should normalize an existing product', async () => {
      // Mock processProductImages
      jest.spyOn(service as any, 'processProductImages').mockResolvedValue({
        validImages: ['https://example.com/processed1.webp', 'https://example.com/processed2.webp'],
        invalidImages: [],
        metadata: [
          { width: 800, height: 800, format: 'webp', aspectRatio: 1 },
          { width: 800, height: 800, format: 'webp', aspectRatio: 1 },
        ],
      });

      // Mock generateSlug
      jest.spyOn(service as any, 'generateSlug').mockReturnValue('existing-product-slug');

      const existingProduct = {
        id: 'product123',
        title: 'Existing Product',
        description: 'Product description',
        price: 79.99,
        compareAtPrice: 99.99,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        categories: ['category1'],
        merchantId: 'merchant123',
        externalId: 'external123',
        externalSource: DataSource.MANUAL,
        attributes: {
          size: 'Large',
          color: 'Green',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.normalizeProduct(existingProduct as any);

      // Verify images were processed
      expect(service['processProductImages']).toHaveBeenCalledWith(existingProduct.images);

      // Verify virtual properties were calculated
      expect(result.isOnSale).toBe(true);
      expect(result.discountPercentage).toBe(20); // 20% discount

      // Verify original data was preserved
      expect(result.id).toBe('product123');
      expect(result.title).toBe('Existing Product');
      expect(result.price).toBe(79.99);
    });
  });

  describe('updateProductWithDto', () => {
    it('should normalize update data', async () => {
      // Mock processProductImages
      jest.spyOn(service as any, 'processProductImages').mockResolvedValue({
        validImages: ['https://example.com/processed-update.webp'],
        invalidImages: [],
        metadata: [{ width: 800, height: 800, format: 'webp', aspectRatio: 1 }],
      });

      // Mock sanitizeText and sanitizeHtml
      jest.spyOn(service as any, 'sanitizeText').mockImplementation(text => `sanitized-${text}`);
      jest.spyOn(service as any, 'sanitizeHtml').mockImplementation(html => `sanitized-${html}`);

      // Mock generateSlug
      jest.spyOn(service as any, 'generateSlug').mockReturnValue('updated-product-slug');

      const updateDto = {
        title: 'Updated Product Title',
        description: '<p>Updated description</p>',
        price: 129.99,
        images: ['https://example.com/new-image.jpg'],
        attributes: {
          size: 'X-Large',
          color: 'Black',
        },
      };

      const result = await service.updateProductWithDto('product123', updateDto);

      // Verify slug was generated from title
      expect(result.slug).toBe('updated-product-slug');

      // Verify text was sanitized
      expect(result.title).toBe('sanitized-Updated Product Title');
      expect(result.description).toBe('sanitized-<p>Updated description</p>');

      // Verify images were processed
      expect(service['processProductImages']).toHaveBeenCalledWith(updateDto.images);
      expect(result.images).toEqual(['https://example.com/processed-update.webp']);

      // Verify attributes were preserved
      expect(result.attributes).toEqual({
        size: 'X-Large',
        color: 'Black',
      });
    });
  });

  describe('generateSlug', () => {
    it('should generate a valid slug from a title', () => {
      // Use the actual implementation for this test
      jest.spyOn(service as any, 'generateSlug').mockRestore();

      const slug = service['generateSlug']('Test Product Title 123');

      expect(slug).toBe('test-product-title-123');
    });

    it('should handle special characters and spaces', () => {
      jest.spyOn(service as any, 'generateSlug').mockRestore();

      const slug = service['generateSlug']('Special & Chars! @#$%^&*()');

      expect(slug).toBe('special-chars');
    });

    it('should truncate long titles', () => {
      jest.spyOn(service as any, 'generateSlug').mockRestore();

      const longTitle =
        'This is an extremely long product title that should be truncated because it exceeds the maximum length for a slug and would be too long for SEO purposes and URL readability';
      const slug = service['generateSlug'](longTitle);

      expect(slug.length).toBeLessThanOrEqual(100);
    });
  });
});
