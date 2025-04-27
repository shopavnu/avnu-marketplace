import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository as _Repository } from 'typeorm';
import { BatchSectionsService } from './batch-sections.service';
import { ProductsService } from '../products.service';
import { DataNormalizationService } from './data-normalization.service';
import { Product } from '../entities/product.entity';
import {
  BatchSectionsRequestDto,
  SectionRequestDto as _SectionRequestDto,
} from '../dto/batch-sections.dto';

describe('BatchSectionsService', () => {
  let service: BatchSectionsService;
  let _productsService: ProductsService;
  let _dataNormalizationService: DataNormalizationService;

  // Mock repository
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  // Mock products service
  const mockProductsService = {
    findWithCursor: jest.fn(),
  };

  // Mock data normalization service
  const mockDataNormalizationService = {
    normalizeProduct: jest.fn(product => product),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchSectionsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: DataNormalizationService,
          useValue: mockDataNormalizationService,
        },
      ],
    }).compile();

    service = module.get<BatchSectionsService>(BatchSectionsService);
    _productsService = module.get<ProductsService>(ProductsService);
    _dataNormalizationService = module.get<DataNormalizationService>(DataNormalizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadBatchSections', () => {
    it('should load multiple sections in parallel', async () => {
      // Mock section data
      const newArrivalsProducts = [
        { id: '1', title: 'New Product 1', price: 99.99 },
        { id: '2', title: 'New Product 2', price: 149.99 },
      ];

      const featuredProducts = [
        { id: '3', title: 'Featured Product 1', price: 199.99 },
        { id: '4', title: 'Featured Product 2', price: 249.99 },
      ];

      // Mock findWithCursor responses
      mockProductsService.findWithCursor
        .mockResolvedValueOnce({
          items: newArrivalsProducts,
          nextCursor: 'next-cursor-1',
          hasMore: true,
        })
        .mockResolvedValueOnce({
          items: featuredProducts,
          nextCursor: 'next-cursor-2',
          hasMore: true,
        });

      // Create batch request
      const batchRequest: BatchSectionsRequestDto = {
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
      };

      // Call service method
      const result = await service.loadBatchSections(batchRequest);

      // Assertions
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].id).toBe('new-arrivals');
      expect(result.sections[0].items).toEqual(newArrivalsProducts);
      expect(result.sections[1].id).toBe('featured');
      expect(result.sections[1].items).toEqual(featuredProducts);
      expect(result.meta.totalSections).toBe(2);
      expect(result.meta.totalProducts).toBe(4);
      expect(result.meta.loadTimeMs).toBeDefined();
      expect(mockProductsService.findWithCursor).toHaveBeenCalledTimes(2);
    });

    it('should load sections sequentially when parallel is false', async () => {
      // Mock section data
      const newArrivalsProducts = [{ id: '1', title: 'New Product 1', price: 99.99 }];

      const featuredProducts = [{ id: '3', title: 'Featured Product 1', price: 199.99 }];

      // Mock findWithCursor responses
      mockProductsService.findWithCursor
        .mockResolvedValueOnce({
          items: newArrivalsProducts,
          nextCursor: 'next-cursor-1',
          hasMore: false,
        })
        .mockResolvedValueOnce({
          items: featuredProducts,
          nextCursor: 'next-cursor-2',
          hasMore: false,
        });

      // Create batch request
      const batchRequest: BatchSectionsRequestDto = {
        sections: [
          {
            id: 'new-arrivals',
            title: 'New Arrivals',
            pagination: { limit: 1 },
          },
          {
            id: 'featured',
            title: 'Featured Products',
            pagination: { limit: 1 },
          },
        ],
        parallel: false,
      };

      // Call service method
      const result = await service.loadBatchSections(batchRequest);

      // Assertions
      expect(result.sections.length).toBe(2);
      expect(result.meta.totalProducts).toBe(2);
      // In sequential mode, the second call should only happen after the first completes
      expect(mockProductsService.findWithCursor).toHaveBeenCalledTimes(2);
    });

    it('should handle errors in section loading gracefully', async () => {
      // Mock successful section
      const newArrivalsProducts = [{ id: '1', title: 'New Product 1', price: 99.99 }];

      // Mock findWithCursor responses
      mockProductsService.findWithCursor
        .mockResolvedValueOnce({
          items: newArrivalsProducts,
          nextCursor: 'next-cursor-1',
          hasMore: false,
        })
        .mockRejectedValueOnce(new Error('Failed to load featured products'));

      // Create batch request
      const batchRequest: BatchSectionsRequestDto = {
        sections: [
          {
            id: 'new-arrivals',
            title: 'New Arrivals',
            pagination: { limit: 1 },
          },
          {
            id: 'featured',
            title: 'Featured Products',
            pagination: { limit: 1 },
          },
        ],
        parallel: true,
      };

      // Call service method
      const result = await service.loadBatchSections(batchRequest);

      // Assertions
      expect(result.sections.length).toBe(2);
      expect(result.sections[0].items).toEqual(newArrivalsProducts);
      expect(result.sections[1].items).toEqual([]); // Failed section should return empty array
      expect(mockProductsService.findWithCursor).toHaveBeenCalledTimes(2);
    });
  });
});
