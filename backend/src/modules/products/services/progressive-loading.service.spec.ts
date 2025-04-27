import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressiveLoadingService } from './progressive-loading.service';
import { DataNormalizationService } from './data-normalization.service';
import { Product } from '../entities/product.entity';
import { LoadingPriority } from '../dto/progressive-loading.dto';

describe('ProgressiveLoadingService', () => {
  let service: ProgressiveLoadingService;
  let dataNormalizationService: DataNormalizationService;

  // Mock repository with query builder
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    find: jest.fn(),
    count: jest.fn(),
  };

  // Mock data normalization service
  const mockDataNormalizationService = {
    normalizeProduct: jest.fn(product => product),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressiveLoadingService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: DataNormalizationService,
          useValue: mockDataNormalizationService,
        },
      ],
    }).compile();

    service = module.get<ProgressiveLoadingService>(ProgressiveLoadingService);
    dataNormalizationService = module.get<DataNormalizationService>(DataNormalizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadProgressively', () => {
    it('should load products with HIGH priority', async () => {
      // Mock products
      const mockProducts = [
        {
          id: '1',
          title: 'Product 1',
          price: 99.99,
          images: ['https://example.com/image1.jpg'],
          createdAt: new Date('2025-04-01'),
        },
        {
          id: '2',
          title: 'Product 2',
          price: 149.99,
          images: ['https://example.com/image2.jpg'],
          createdAt: new Date('2025-04-02'),
        },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);
      mockRepository.count.mockResolvedValue(10);

      // Call service method with HIGH priority
      const result = await service.loadProgressively({
        limit: 2,
        priority: LoadingPriority.HIGH,
        withMetadata: true,
      });

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(result.hasMore).toBe(false); // Only 2 items returned with limit 2
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalCount).toBe(10);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(3); // limit + 1
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');

      // For HIGH priority, we should load full details
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();

      // Normalization should be applied for HIGH priority
      expect(dataNormalizationService.normalizeProduct).toHaveBeenCalledTimes(2);
    });

    it('should load products with MEDIUM priority (optimized fields)', async () => {
      // Mock products
      const mockProducts = [
        {
          id: '1',
          title: 'Product 1',
          price: 99.99,
          images: ['https://example.com/image1.jpg'],
          createdAt: new Date('2025-04-01'),
        },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);

      // Call service method with MEDIUM priority
      const result = await service.loadProgressively({
        limit: 1,
        priority: LoadingPriority.MEDIUM,
      });

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(mockQueryBuilder.select).toHaveBeenCalled();

      // For MEDIUM priority, we should select specific fields
      const selectArgs = mockQueryBuilder.select.mock.calls[0][0];
      expect(selectArgs).toContain('product.id');
      expect(selectArgs).toContain('product.title');
      expect(selectArgs).toContain('product.price');

      // Normalization should still be applied for MEDIUM priority
      expect(dataNormalizationService.normalizeProduct).toHaveBeenCalledTimes(1);
    });

    it('should load products with LOW priority (minimal data)', async () => {
      // Mock products
      const mockProducts = [
        {
          id: '1',
          title: 'Product 1',
          images: ['https://example.com/image1.jpg'],
          createdAt: new Date('2025-04-01'),
        },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);

      // Call service method with LOW priority
      const result = await service.loadProgressively({
        limit: 1,
        priority: LoadingPriority.LOW,
      });

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(mockQueryBuilder.select).toHaveBeenCalled();

      // For LOW priority, we should select minimal fields
      const selectArgs = mockQueryBuilder.select.mock.calls[0][0];
      expect(selectArgs).toContain('product.id');
      expect(selectArgs).toContain('product.title');
      expect(selectArgs).toContain('product.images');

      // Normalization should be skipped for LOW priority to improve performance
      expect(dataNormalizationService.normalizeProduct).not.toHaveBeenCalled();
    });

    it('should handle cursor-based navigation', async () => {
      // Mock products
      const mockProducts = [
        {
          id: '3',
          title: 'Product 3',
          price: 199.99,
          images: ['https://example.com/image3.jpg'],
          createdAt: new Date('2025-04-03'),
        },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);

      // Create a cursor (base64 encoded JSON with id and createdAt)
      const cursorData = {
        id: '2',
        createdAt: new Date('2025-04-02').toISOString(),
      };
      const cursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');

      // Call service method with cursor
      const result = await service.loadProgressively({
        cursor,
        limit: 1,
      });

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should exclude specified product IDs', async () => {
      // Mock products
      const mockProducts = [
        {
          id: '3',
          title: 'Product 3',
          price: 199.99,
          images: ['https://example.com/image3.jpg'],
          createdAt: new Date('2025-04-03'),
        },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);

      // Call service method with exclusions
      const result = await service.loadProgressively({
        limit: 1,
        exclude: ['1', '2'],
      });

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('prefetchProducts', () => {
    it('should prefetch products with minimal data', async () => {
      // Mock products
      const mockProducts = [
        { id: '1', title: 'Product 1' },
        { id: '2', title: 'Product 2' },
      ];

      // Mock query builder response
      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);

      // Call prefetch method
      const result = await service.prefetchProducts();

      // Assertions
      expect(result).toEqual(['1', '2']);
      expect(mockQueryBuilder.select).toHaveBeenCalled();

      // Should use PREFETCH priority
      const selectArgs = mockQueryBuilder.select.mock.calls[0][0];
      expect(selectArgs).toContain('product.id');

      // Normalization should be skipped for prefetching
      expect(dataNormalizationService.normalizeProduct).not.toHaveBeenCalled();
    });
  });
});
