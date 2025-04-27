import { Test, TestingModule } from '@nestjs/testing';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from '../services/bulk-import.service';

describe('BulkImportController', () => {
  let controller: BulkImportController;
  let service: BulkImportService;

  // Mock service implementation
  const mockBulkImportService = {
    importProducts: jest.fn(),
    importFromShopify: jest.fn(),
    importFromWooCommerce: jest.fn(),
    importFromEtsy: jest.fn(),
    processExistingProducts: jest.fn(),
    validateProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkImportController],
      providers: [
        {
          provide: BulkImportService,
          useValue: mockBulkImportService,
        },
      ],
    }).compile();

    controller = module.get<BulkImportController>(BulkImportController);
    service = module.get<BulkImportService>(BulkImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importFromShopify', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        imported: 5,
        failed: 0,
        message: 'Successfully imported 5 products from Shopify',
      };
      mockBulkImportService.importFromShopify.mockResolvedValue(mockResponse);

      // Create import request
      const importRequest = {
        data: {
          shopifyUrl: 'https://example.myshopify.com',
          accessToken: 'test-token',
          limit: 10,
        },
        options: {
          validateOnly: false,
        },
      };

      // Call controller method
      const result = await controller.importFromShopify(importRequest);

      // Verify service was called with correct parameters
      expect(service.importFromShopify).toHaveBeenCalledWith(importRequest.data, {
        ...importRequest.options,
        source: 'shopify',
      });

      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importFromWooCommerce', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        imported: 3,
        failed: 1,
        message: 'Successfully imported 3 products from WooCommerce, 1 failed',
      };
      mockBulkImportService.importFromWooCommerce.mockResolvedValue(mockResponse);

      // Create import request
      const importRequest = {
        data: {
          siteUrl: 'https://example.com',
          consumerKey: 'ck_test',
          consumerSecret: 'cs_test',
          limit: 10,
        },
        options: {
          validateOnly: false,
        },
      };

      // Call controller method
      const result = await controller.importFromWooCommerce(importRequest);

      // Verify service was called with correct parameters
      expect(service.importFromWooCommerce).toHaveBeenCalledWith(importRequest.data, {
        ...importRequest.options,
        source: 'woocommerce',
      });

      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importProducts', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        imported: 2,
        failed: 0,
        message: 'Successfully imported 2 products',
      };
      mockBulkImportService.importProducts.mockResolvedValue(mockResponse);

      // Create import request with products that have consistent image dimensions
      const importRequest = {
        products: [
          {
            title: 'Test Product 1',
            description: 'Description for test product 1',
            price: 99.99,
            images: ['https://example.com/image1.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
          },
          {
            title: 'Test Product 2',
            description: 'Description for test product 2',
            price: 149.99,
            compareAtPrice: 199.99,
            images: ['https://example.com/image2.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
          },
        ],
        options: {
          validateOnly: false,
        },
      };

      // Call controller method
      const result = await controller.importProducts(importRequest);

      // Verify service was called with correct parameters
      expect(service.importProducts).toHaveBeenCalledWith(
        importRequest.products,
        importRequest.options,
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });

  describe('processExistingProducts', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        processed: 10,
        failed: 0,
        message: 'Successfully processed 10 existing products',
      };
      mockBulkImportService.processExistingProducts.mockResolvedValue(mockResponse);

      // Create process request
      const processRequest = {
        productIds: ['1', '2', '3'],
        options: {
          processImages: true,
          updateSlug: true,
          batchSize: 10,
        },
      };

      // Call controller method
      const result = await controller.processExistingProducts(processRequest);

      // Verify service was called with correct parameters
      expect(service.processExistingProducts).toHaveBeenCalledWith(
        processRequest.productIds,
        processRequest.options,
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateProducts', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        valid: true,
        errors: [],
        message: 'Product data is valid',
      };
      mockBulkImportService.validateProducts.mockResolvedValue(mockResponse);

      // Create validation request with consistent image dimensions
      const validationRequest = {
        products: [
          {
            title: 'Test Product',
            description: 'Description for test product',
            price: 99.99,
            images: ['https://example.com/image.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
          },
        ],
      };

      // Call controller method
      const result = await controller.validateProducts(validationRequest);

      // Verify service was called with correct parameters
      expect(service.validateProducts).toHaveBeenCalledWith(
        validationRequest.products,
        'manual', // Default source
      );

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should validate product data with consistent image dimensions', async () => {
      // Setup mock response for invalid image dimensions
      const mockResponse = {
        valid: false,
        invalid: [
          {
            index: 0,
            errors: ['Image dimensions do not meet requirements for consistent product cards'],
          },
        ],
        message: 'Product data is invalid',
      };
      mockBulkImportService.validateProducts.mockResolvedValue(mockResponse);

      // Create validation request with inconsistent image dimensions
      const validationRequest = {
        products: [
          {
            title: 'Test Product',
            description: 'Description for test product',
            price: 99.99,
            images: ['https://example.com/small-image.jpg'], // Small image that won't meet requirements
            categories: ['test'],
            merchantId: 'test-merchant',
          },
        ],
      };

      // Call controller method
      const result = await controller.validateProducts(validationRequest);

      // Verify response contains validation errors for images
      expect(result.valid).toBe(false);
      expect(result.invalid[0].errors.some(error => error.includes('Image dimensions'))).toBe(true);
    });
  });
});
