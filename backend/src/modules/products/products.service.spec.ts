import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CursorPaginationDto } from '../../common/dto/cursor-pagination.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<MockRepository>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findWithCursor', () => {
    it('should return paginated products with cursor', async () => {
      // Mock product data
      const mockProducts = [
        {
          id: '1',
          title: 'Product 1',
          price: 99.99,
          createdAt: new Date('2025-04-01'),
        },
        {
          id: '2',
          title: 'Product 2',
          price: 149.99,
          createdAt: new Date('2025-04-02'),
        },
        {
          id: '3',
          title: 'Product 3',
          price: 199.99,
          createdAt: new Date('2025-04-03'),
        },
      ];

      // Mock repository find method
      repository.find.mockResolvedValue(mockProducts);
      repository.count.mockResolvedValue(10);

      // Call service method
      const paginationDto: CursorPaginationDto = {
        limit: 2,
        withCount: true,
      };
      const result = await service.findWithCursor(paginationDto);

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(result.hasMore).toBe(true);
      expect(result.totalCount).toBe(10);
      expect(result.nextCursor).toBeDefined();
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        take: 3, // limit + 1 to check for more items
        order: {
          createdAt: 'DESC',
          id: 'DESC',
        },
      });
    });

    it('should handle cursor-based navigation', async () => {
      // Mock product data
      const mockProducts = [
        {
          id: '4',
          title: 'Product 4',
          price: 249.99,
          createdAt: new Date('2025-04-04'),
        },
        {
          id: '5',
          title: 'Product 5',
          price: 299.99,
          createdAt: new Date('2025-04-05'),
        },
      ];

      // Mock repository find method
      repository.find.mockResolvedValue(mockProducts);

      // Create a cursor (base64 encoded JSON with id and createdAt)
      const cursorData = {
        id: '3',
        createdAt: new Date('2025-04-03').toISOString(),
      };
      const cursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');

      // Call service method with cursor
      const paginationDto: CursorPaginationDto = {
        cursor,
        limit: 2,
      };
      const result = await service.findWithCursor(paginationDto);

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(result.hasMore).toBe(false); // Only 2 items returned with limit 2
      expect(repository.find).toHaveBeenCalled();
    });

    it('should handle invalid cursor gracefully', async () => {
      // Mock product data
      const mockProducts = [
        {
          id: '1',
          title: 'Product 1',
          price: 99.99,
          createdAt: new Date('2025-04-01'),
        },
      ];

      // Mock repository find method
      repository.find.mockResolvedValue(mockProducts);

      // Call service method with invalid cursor
      const paginationDto: CursorPaginationDto = {
        cursor: 'invalid-cursor',
        limit: 1,
      };
      const result = await service.findWithCursor(paginationDto);

      // Assertions
      expect(result.items).toEqual(mockProducts);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
