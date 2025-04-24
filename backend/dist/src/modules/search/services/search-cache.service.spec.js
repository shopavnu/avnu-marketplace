"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const search_cache_service_1 = require("./search-cache.service");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
describe('SearchCacheService', () => {
    let service;
    let cacheManagerMock;
    let loggerMock;
    let configService;
    beforeEach(async () => {
        cacheManagerMock = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
            store: { keys: jest.fn() },
        };
        loggerMock = new common_1.Logger(search_cache_service_1.SearchCacheService.name);
        configService = {
            get: jest.fn(),
        };
        configService.get.mockImplementation((key, defaultValue) => {
            const config = {
                SEARCH_CACHE_ENABLED: true,
                SEARCH_CACHE_TTL: 300,
            };
            return config[key] !== undefined ? config[key] : defaultValue;
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                search_cache_service_1.SearchCacheService,
                {
                    provide: cache_manager_1.CACHE_MANAGER,
                    useValue: cacheManagerMock,
                },
                {
                    provide: common_1.Logger,
                    useValue: loggerMock,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();
        service = module.get(search_cache_service_1.SearchCacheService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getCachedResults', () => {
        it('should return cached results when available', async () => {
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const cachedResults = {
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
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    search_cache_service_1.SearchCacheService,
                    {
                        provide: cache_manager_1.CACHE_MANAGER,
                        useValue: cacheManagerMock,
                    },
                    {
                        provide: common_1.Logger,
                        useValue: new common_1.Logger(search_cache_service_1.SearchCacheService.name),
                    },
                    {
                        provide: config_1.ConfigService,
                        useValue: {
                            get: jest.fn((key, defaultValue) => {
                                if (key === 'SEARCH_CACHE_ENABLED')
                                    return false;
                                if (key === 'SEARCH_CACHE_TTL_SECONDS')
                                    return 300;
                                return defaultValue;
                            }),
                        },
                    },
                ],
            }).compile();
            const localService = module.get(search_cache_service_1.SearchCacheService);
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const result = await localService.getCachedResults(options);
            expect(result).toBeNull();
            expect(cacheManagerMock.get).not.toHaveBeenCalled();
        });
        it('should return null when cache misses', async () => {
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            cacheManagerMock.get.mockResolvedValue(null);
            const result = await service.getCachedResults(options);
            expect(result).toBeNull();
            expect(cacheManagerMock.get).toHaveBeenCalledWith(expect.any(String));
        });
        it('should not cache personalized searches', async () => {
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
                personalized: true,
            };
            const result = await service.getCachedResults(options);
            expect(result).toBeNull();
            expect(cacheManagerMock.get).not.toHaveBeenCalled();
        });
    });
    describe('cacheResults', () => {
        it('should cache search results when caching is enabled', async () => {
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const searchResults = {
                query: 'test query',
                products: [],
                pagination: {
                    total: 10,
                    page: 0,
                    limit: 10,
                    totalPages: 1,
                    pages: 1,
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
            expect(cacheManagerMock.set).toHaveBeenCalledWith(expect.any(String), searchResults, 300);
        });
        it('should not cache results when caching is disabled', async () => {
            configService.get.mockReturnValueOnce(false);
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const searchResults = {
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
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
                personalized: true,
            };
            const searchResults = {
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
            const options = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const searchResults = {
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
            const options1 = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
                filters: [{ field: 'category', values: ['clothing'], exact: false }],
            };
            const options2 = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
                filters: [{ field: 'category', values: ['clothing'], exact: false }],
            };
            const key1 = service['generateCacheKey'](options1);
            const key2 = service['generateCacheKey'](options2);
            expect(key1).toEqual(key2);
        });
        it('should generate different cache keys for different search options', () => {
            const options1 = {
                query: 'test query',
                page: 0,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
            };
            const options2 = {
                query: 'test query',
                page: 1,
                limit: 10,
                entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
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
//# sourceMappingURL=search-cache.service.spec.js.map