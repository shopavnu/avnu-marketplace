import { Test, TestingModule } from '@nestjs/testing';
import { ProgressiveLoadingController } from './progressive-loading.controller';
import { ProgressiveLoadingService } from '../services/progressive-loading.service';
import { DataNormalizationService } from '../services/data-normalization.service';
import { Logger as _Logger } from '@nestjs/common';
import { LoadingPriority } from '../dto/progressive-loading.dto';

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

describe('ProgressiveLoadingController', () => {
  let controller: ProgressiveLoadingController;
  let mockProgressiveLoadingService: jest.Mocked<ProgressiveLoadingService>;
  let mockDataNormalizationService: jest.Mocked<DataNormalizationService>;

  beforeEach(async () => {
    // Create mocks for the services
    mockProgressiveLoadingService = {
      loadProgressively: jest.fn(),
      prefetchProducts: jest.fn(),
    } as any;

    mockDataNormalizationService = {
      normalizeProduct: jest.fn(),
    } as any;

    // Create a test module with our mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressiveLoadingController],
      providers: [
        {
          provide: ProgressiveLoadingService,
          useValue: mockProgressiveLoadingService,
        },
        {
          provide: DataNormalizationService,
          useValue: mockDataNormalizationService,
        },
      ],
    }).compile();

    // Get the controller instance from the test module
    controller = module.get<ProgressiveLoadingController>(ProgressiveLoadingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loadProgressively', () => {
    it('should call loadProgressively with correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        items: [
          {
            id: '1',
            title: 'Test Product',
            description: 'Test description',
            price: 99.99,
            images: ['https://example.com/image.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
            brandName: 'Test Brand',
            slug: 'test-product',
            imageMetadata: [
              {
                width: 800,
                height: 800,
                aspectRatio: 1,
              },
            ],
          } as any,
        ],
        nextCursor: 'next-cursor',
        hasMore: true,
      };
      mockProgressiveLoadingService.loadProgressively.mockResolvedValue(mockResponse);

      // Call controller method
      const result = await controller.loadProgressively({
        limit: 10,
        cursor: 'test-cursor',
        priority: LoadingPriority.HIGH,
        withMetadata: true,
      });

      // Verify service was called with correct parameters
      expect(mockProgressiveLoadingService.loadProgressively).toHaveBeenCalledWith({
        limit: 10,
        cursor: 'test-cursor',
        priority: LoadingPriority.HIGH,
        withMetadata: true,
      });

      // Verify response
      expect(result).toEqual(mockResponse);
    });

    it('should use default values when parameters are not provided', async () => {
      // Setup mock response
      mockProgressiveLoadingService.loadProgressively.mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Test Product',
            description: 'Test description',
            price: 99.99,
            images: ['https://example.com/image.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
            brandName: 'Test Brand',
            slug: 'test-product',
          } as any,
        ],
        nextCursor: 'next-cursor',
        hasMore: true,
      });

      // Call controller method with no parameters
      await controller.loadProgressively({});

      // Verify service was called with default parameters
      expect(mockProgressiveLoadingService.loadProgressively).toHaveBeenCalledWith({
        limit: 20, // Default value
        priority: LoadingPriority.HIGH, // Default value
        withMetadata: false, // Default value
      });
    });
  });

  describe('loadMoreWithExclusions', () => {
    it('should call loadProgressively with exclude parameter', async () => {
      // Setup mock response
      const mockResponse = {
        items: [
          {
            id: '3',
            title: 'Product 3',
            description: 'Test description',
            price: 99.99,
            images: ['https://example.com/image.jpg'],
            categories: ['test'],
            merchantId: 'test-merchant',
            brandName: 'Test Brand',
            slug: 'test-product',
          } as any,
        ],
        nextCursor: 'next-cursor',
        hasMore: true,
      };
      mockProgressiveLoadingService.loadProgressively.mockResolvedValue(mockResponse);

      // Call controller method
      const result = await controller.loadMoreWithExclusions({
        limit: 10,
        cursor: 'test-cursor',
        exclude: ['1', '2'], // Exclude already loaded products
      });

      // Verify service was called with correct parameters including exclude
      expect(mockProgressiveLoadingService.loadProgressively).toHaveBeenCalledWith({
        limit: 10,
        cursor: 'test-cursor',
        exclude: ['1', '2'],
        priority: LoadingPriority.HIGH, // Default for loadMore
      });

      // Verify response
      expect(result).toEqual(mockResponse);
    });
  });

  describe('prefetchProducts', () => {
    it('should call prefetchProducts with correct parameters', async () => {
      // Setup mock response
      mockProgressiveLoadingService.prefetchProducts.mockResolvedValue(['1', '2', '3']);

      // Call controller method
      const result = await controller.prefetchProducts('test-cursor', 5);

      // Verify service was called with correct parameters
      expect(mockProgressiveLoadingService.prefetchProducts).toHaveBeenCalledWith('test-cursor', 5);

      // Verify response
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should use default limit when not provided', async () => {
      // Setup mock response
      mockProgressiveLoadingService.prefetchProducts.mockResolvedValue(['1', '2', '3']);

      // Call controller method with no limit
      await controller.prefetchProducts('test-cursor');

      // Verify service was called with default limit
      expect(mockProgressiveLoadingService.prefetchProducts).toHaveBeenCalledWith(
        'test-cursor',
        20,
      ); // Default value
    });
  });
});
