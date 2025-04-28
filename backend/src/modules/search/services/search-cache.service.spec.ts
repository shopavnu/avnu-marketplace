import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchCacheService } from './search-cache.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { SearchResponseDto } from '../dto/search-response.dto';

describe('SearchCacheService', () => {
  let service: SearchCacheService;
  let cacheManagerMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    // Create mocks for dependencies
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn(),
    };

    // Configure the config service mock to return expected values
    configServiceMock.get.mockImplementation((key: string, defaultValue: any) => {
      const config = {
        SEARCH_CACHE_ENABLED: true,
        SEARCH_CACHE_TTL_SECONDS: 300,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    // Create the service directly with mocked dependencies
    // Use type assertion to bypass TypeScript's type checking for the mocks
    service = new SearchCacheService(
      cacheManagerMock, 
      configServiceMock as unknown as ConfigService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCachedResults', () => {
    it('should return cached results when available', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };
      const cachedResults: SearchResponseDto = {
        query: 'test query',
        products: [],
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0,
          pages: 0,
          hasNext: false,
          hasPrevious: false,
        },
        facets: {
          categories: [],
          values: [],
          price: null,
        },
        usedNlp: false,
      };
      cacheManagerMock.get.mockResolvedValue(cachedResults);

      const result = await service.getCachedResults(options);

      expect(result).toEqual(cachedResults);
      expect(cacheManagerMock.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return null when cache is disabled', async () => {
      // Create a service instance with cache disabled
      const disabledConfigService = {
        get: jest.fn((key: string, defaultValue: any) => {
          if (key === 'SEARCH_CACHE_ENABLED') return false;
          if (key === 'SEARCH_CACHE_TTL_SECONDS') return 300;
          return defaultValue;
        }),
      };
      
      const localService = new SearchCacheService(
        cacheManagerMock, 
        disabledConfigService as unknown as ConfigService
      );

      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };

      const result = await localService.getCachedResults(options);

      expect(result).toBeNull();
      expect(cacheManagerMock.get).not.toHaveBeenCalled();
    });

    it('should return null when cache misses', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await service.getCachedResults(options);

      expect(result).toBeNull();
      expect(cacheManagerMock.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('should not cache personalized searches', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
        personalized: true,
      };

      const result = await service.getCachedResults(options);

      expect(result).toBeNull();
      expect(cacheManagerMock.get).not.toHaveBeenCalled();
    });
  });

  describe('cacheResults', () => {
    it('should cache search results when caching is enabled', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };
      const searchResults: SearchResponseDto = {
        query: 'test query',
        products: [],
        pagination: {
          total: 10,
          page: 0,
          limit: 10,
          totalPages: 1,
          pages: 1, // Add missing required property
          hasNext: false,
          hasPrevious: false,
        },
        facets: {
          categories: [],
          values: [],
          price: null,
        },
        usedNlp: false,
      };

      await service.cacheResults(options, searchResults);

      // Correct assertion: TTL is the third argument directly
      expect(cacheManagerMock.set).toHaveBeenCalledWith(expect.any(String), searchResults, 300);
    });

    it('should not cache results when caching is disabled', async () => {
      configServiceMock.get.mockReturnValueOnce(false);
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };
      const searchResults: SearchResponseDto = {
        query: 'test query',
        products: [],
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0,
          pages: 0,
          hasNext: false,
          hasPrevious: false,
        },
        facets: {
          categories: [],
          values: [],
          price: null,
        },
        usedNlp: false,
      };

      await service.cacheResults(options, searchResults);

      expect(cacheManagerMock.set).not.toHaveBeenCalled();
    });

    it('should not cache personalized search results', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
        personalized: true,
      };
      const searchResults: SearchResponseDto = {
        query: 'test query',
        products: [],
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0,
          pages: 0,
          hasNext: false,
          hasPrevious: false,
        },
        facets: {
          categories: [],
          values: [],
          price: null,
        },
        usedNlp: false,
      };

      await service.cacheResults(options, searchResults);

      expect(cacheManagerMock.set).not.toHaveBeenCalled();
    });

    it('should not cache zero result searches', async () => {
      const options: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };
      const searchResults: SearchResponseDto = {
        query: 'test query',
        products: [],
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0,
          pages: 0,
          hasNext: false,
          hasPrevious: false,
        },
        facets: {
          categories: [],
          values: [],
          price: null,
        },
        usedNlp: false,
      };

      await service.cacheResults(options, searchResults);

      expect(cacheManagerMock.set).not.toHaveBeenCalled();
    });
  });

  describe('generateCacheKey', () => {
    it('should generate a consistent cache key for the same search options', () => {
      const options1: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
        filters: [{ field: 'category', values: ['clothing'], exact: false }],
      };

      const options2: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
        filters: [{ field: 'category', values: ['clothing'], exact: false }],
      };

      const key1 = service['generateCacheKey'](options1);
      const key2 = service['generateCacheKey'](options2);

      expect(key1).toEqual(key2);
    });

    it('should generate different cache keys for different search options', () => {
      const options1: SearchOptionsInput = {
        query: 'test query',
        page: 0,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };

      const options2: SearchOptionsInput = {
        query: 'test query',
        page: 1,
        limit: 10,
        entityType: SearchEntityType.PRODUCT,
      };

      const key1 = service['generateCacheKey'](options1);
      const key2 = service['generateCacheKey'](options2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache entries by pattern', async () => {
      const pattern = 'search:product:*';

      await service.invalidateCache(pattern);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(pattern);
    });
  });
});
