import { Test, TestingModule } from '@nestjs/testing';
import { BatchSectionsController } from './batch-sections.controller';
import { BatchSectionsService } from '../services/batch-sections.service';
import { Logger as _Logger } from '@nestjs/common';

// Mock the NestJS Logger to avoid console output during tests
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    Logger: jest.fn().mockImplementation(() => ({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    })),
  };
});

describe('BatchSectionsController', () => {
  let controller: BatchSectionsController;
  let _mockBatchSectionsService: jest.Mocked<BatchSectionsService>;

  beforeEach(async () => {
    // Create a mock for the BatchSectionsService
    _mockBatchSectionsService = {
      loadBatchSections: jest.fn(),
    } as any;

    // Create a test module with our mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchSectionsController],
      providers: [
        {
          provide: BatchSectionsService,
          useValue: _mockBatchSectionsService,
        },
      ],
    }).compile();

    // Get the controller instance from the test module
    controller = module.get<BatchSectionsController>(BatchSectionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loadBatchSections', () => {
    it('should call service with correct parameters', async () => {
      // Setup mock response with consistent product card data
      const mockResponse = {
        sections: [
          {
            id: 'new-arrivals',
            title: 'New Arrivals',
            items: [
              {
                id: '1',
                title: 'Product 1',
                price: 99.99,
                images: ['https://example.com/processed1.webp'],
                imageMetadata: [{ width: 800, height: 800, format: 'webp', aspectRatio: 1 }],
                slug: 'product-1',
                isOnSale: false,
                discountPercentage: 0,
              },
            ],
            nextCursor: 'next-cursor-1',
            hasMore: true,
          },
          {
            id: 'featured',
            title: 'Featured Products',
            items: [
              {
                id: '2',
                title: 'Product 2',
                price: 149.99,
                compareAtPrice: 199.99,
                images: ['https://example.com/processed2.webp'],
                imageMetadata: [{ width: 800, height: 800, format: 'webp', aspectRatio: 1 }],
                slug: 'product-2',
                isOnSale: true,
                discountPercentage: 25,
              },
            ],
            nextCursor: 'next-cursor-2',
            hasMore: true,
          },
        ],
        meta: {
          totalSections: 2,
          totalProducts: 2,
          loadTimeMs: 150,
        },
      };

      _mockBatchSectionsService.loadBatchSections.mockResolvedValue(mockResponse);

      // Create batch request
      const batchRequest = {
        sections: [
          {
            id: 'new-arrivals',
            title: 'New Arrivals',
            pagination: { limit: 10 },
          },
          {
            id: 'featured',
            title: 'Featured Products',
            pagination: { limit: 10 },
          },
        ],
        parallel: true,
      };

      // Call controller method
      const result = await controller.loadBatchSections(batchRequest);

      // Verify service was called with correct parameters
      expect(_mockBatchSectionsService.loadBatchSections).toHaveBeenCalledWith(batchRequest);

      // Verify response
      expect(result).toEqual(mockResponse);

      // Verify consistent product card data
      result.sections.forEach(section => {
        section.items.forEach(product => {
          // Verify each product has the required fields for consistent card rendering
          expect(product.title).toBeDefined();
          expect(product.price).toBeDefined();
          expect(product.images).toBeDefined();
          expect(product.imageMetadata).toBeDefined();
          expect(product.slug).toBeDefined();
          expect(product.isOnSale).toBeDefined();
          expect(product.discountPercentage).toBeDefined();

          // Verify image metadata for consistent card heights
          if (product.imageMetadata && product.imageMetadata.length > 0) {
            const metadata = product.imageMetadata[0];
            expect(metadata.width).toBe(800);
            expect(metadata.height).toBe(800);
            expect(metadata.aspectRatio).toBe(1);
          }
        });
      });
    });

    it('should handle empty sections', async () => {
      // Setup mock response with empty sections
      const mockResponse = {
        sections: [
          {
            id: 'empty-section',
            title: 'Empty Section',
            items: [],
            hasMore: false,
          },
        ],
        meta: {
          totalSections: 1,
          totalProducts: 0,
          loadTimeMs: 50,
        },
      };

      _mockBatchSectionsService.loadBatchSections.mockResolvedValue(mockResponse);

      // Create batch request
      const batchRequest = {
        sections: [
          {
            id: 'empty-section',
            title: 'Empty Section',
            pagination: { limit: 10 },
          },
        ],
        parallel: true,
      };

      // Call controller method
      const result = await controller.loadBatchSections(batchRequest);

      // Verify service was called with correct parameters
      expect(_mockBatchSectionsService.loadBatchSections).toHaveBeenCalledWith(batchRequest);

      // Verify response
      expect(result).toEqual(mockResponse);
      expect(result.sections[0].items).toEqual([]);
    });
  });
});
