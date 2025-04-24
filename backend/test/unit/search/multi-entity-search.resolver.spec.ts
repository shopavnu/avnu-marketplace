import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MultiEntitySearchResolver } from '@modules/search/resolvers/multi-entity-search.resolver';
import { NlpSearchService } from '@modules/search/services/nlp-search.service';
import { AnalyticsService } from '@modules/analytics/services/analytics.service';
import { PersonalizationService } from '@modules/personalization/services/personalization.service';
import { EnhancedSearchInput } from '@modules/search/graphql/entity-specific-filters.input';
import {
  SearchResponseType as _SearchResponseType,
  SearchResultUnion as _SearchResultUnion,
  ProductResultType as _ProductResultType,
  MerchantResultType as _MerchantResultType,
  BrandResultType as _BrandResultType,
  FacetType as _FacetType,
  FacetValueType as _FacetValueType,
} from '@modules/search/graphql/search-response.type';
import { SearchOptionsInput } from '@modules/search/dto/search-options.dto';
import { SortOrder } from '@modules/search/dto/search-options.dto';
import { SearchEntityType } from '@modules/search/enums/search-entity-type.enum';
import { BehaviorType } from '@modules/personalization/entities/user-behavior.entity';
import {
  ProductSearchResult,
  MerchantSearchResult,
  BrandSearchResult,
  SearchFacets as _SearchFacets,
  PaginationInfo as _PaginationInfo,
} from '@modules/search/dto/search-response.dto';

// Mock User type for testing
type MockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  profileImage?: string;
  interests: string[];
  isEmailVerified: boolean;
  isMerchant: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
};

// Create a simple mock Logger that matches the interface needed by the resolver
const _mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn(),
};

describe('MultiEntitySearchResolver', () => {
  let resolver: MultiEntitySearchResolver;
  let mockNlpSearchService: jest.Mocked<any>;
  let mockAnalyticsService: jest.Mocked<any>;
  let mockPersonalizationService: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;

  // Create a mock user for testing
  const mockUser: MockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    role: 'USER',
    profileImage: null,
    interests: [],
    isEmailVerified: true,
    isMerchant: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiEntitySearchResolver,
        {
          provide: NlpSearchService,
          useValue: {
            searchAsync: jest.fn(),
          },
        },
        {
          provide: AnalyticsService,
          useValue: {
            trackSearch: jest.fn().mockResolvedValue(undefined), // Mock trackSearch to resolve
          },
        },
        {
          provide: PersonalizationService,
          useValue: {
            generatePersonalizedFilters: jest.fn(),
            generatePersonalizedBoosts: jest.fn(),
            trackInteractionAndUpdatePreferences: jest.fn().mockResolvedValue(undefined),
          },
        },
        // Provide Logger as a class instead of a value
        Logger,
      ],
    })
      // Override the Logger provider to use our mock
      .overrideProvider(Logger)
      .useValue(mockLogger)
      .compile();

    resolver = module.get<MultiEntitySearchResolver>(MultiEntitySearchResolver);
    mockNlpSearchService = module.get(NlpSearchService);
    mockAnalyticsService = module.get(AnalyticsService);
    mockPersonalizationService = module.get(PersonalizationService);
    mockLogger = module.get(Logger);

    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide a default mock implementation for searchAsync to avoid null pointer if not overridden
    mockNlpSearchService.searchAsync.mockResolvedValue({
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      products: [] as ProductSearchResult[],
      merchants: [] as MerchantSearchResult[],
      brands: [] as BrandSearchResult[],
      facets: {
        categories: [],
        values: [],
        price: undefined,
      },
      queryExplanation: { query: '', explanation: {} },
    });
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // --- Tests for multiEntitySearch method ---

  describe('multiEntitySearch', () => {
    it('should support search highlighting when enabled', async () => {
      // Arrange
      const input: EnhancedSearchInput = {
        query: 'test query',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: true,
        enableHighlighting: true,
        highlightFields: ['title', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        highlightFragmentSize: 200,
      };

      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [
          {
            id: 'prod-1',
            title: 'Test Product',
            description: 'This is a test product description',
            price: 100,
            score: 0.9,
            highlights: {
              fields: [
                {
                  field: 'title',
                  snippets: ['<mark>Test</mark> Product'],
                },
                {
                  field: 'description',
                  snippets: ['This is a <mark>test</mark> product description'],
                },
              ],
              matchedTerms: ['test'],
            },
          },
        ],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        highlightsEnabled: true,
      };

      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      // Act
      const result = await resolver.multiEntitySearch(input, mockUser as any);

      // Assert
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          enableHighlighting: true,
          highlightFields: ['title', 'description'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
          highlightFragmentSize: 200,
        }),
        expect.anything(),
      );

      expect(result.highlightsEnabled).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].highlights).toBeDefined();
      expect(result.results[0].highlights.fields).toHaveLength(2);
      expect(result.results[0].highlights.fields[0].field).toBe('title');
      expect(result.results[0].highlights.fields[0].snippets).toContain(
        '<mark>Test</mark> Product',
      );
    });

    it('should not include highlights when highlighting is disabled', async () => {
      // Arrange
      const input: EnhancedSearchInput = {
        query: 'test query',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: true,
        enableHighlighting: false,
      };

      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [
          {
            id: 'prod-1',
            title: 'Test Product',
            description: 'This is a test product description',
            price: 100,
            score: 0.9,
          },
        ],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        highlightsEnabled: false,
      };

      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      // Act
      const result = await resolver.multiEntitySearch(input, mockUser as any);

      // Assert
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          enableHighlighting: false,
        }),
        expect.anything(),
      );

      expect(result.highlightsEnabled).toBe(false);
      expect(result.results[0].highlights).toBeUndefined();
    });

    it('should call NlpSearchService.searchAsync with correct options', async () => {
      const input: EnhancedSearchInput = {
        query: 'test query',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: true,
        enableHighlighting: false,
      };

      await resolver.multiEntitySearch(input, mockUser as any);

      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledTimes(1);
      const expectedOptions: Partial<SearchOptionsInput> = {
        query: 'test query',
        page: 1,
        limit: 10,
        entityType: SearchEntityType.ALL,
        enableNlp: true,
        personalized: false,
        // Add other fields from SearchOptionsInput if needed for comparison
      };
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledWith(
        expect.objectContaining(expectedOptions),
        mockUser,
      );
    });

    it('should transform and combine results correctly', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: true,
        enableHighlighting: false,
      };
      // Define mock response using imported DTO types
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [
          {
            id: 'prod-1',
            title: 'Running Shoe',
            score: 0.9,
          },
        ],
        merchants: [
          {
            id: 'merch-1',
            name: 'Shoe Store',
            score: 0.8,
          },
        ],
        brands: [
          {
            id: 'brand-1',
            name: 'Shoe Brand',
            score: 0.7,
          },
        ],
        facets: {
          categories: [{ name: 'Footwear', count: 3 }],
          values: [
            { name: 'Size:10', count: 2 },
            { name: 'Size:11', count: 1 },
          ],
          price: undefined,
        },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      const result = await resolver.multiEntitySearch(input, null as any);

      expect(result.results).toHaveLength(3);
      // Check sorting (highest score first)
      expect((result.results[0] as any).__typename).toBe('ProductResultType');
      expect(result.results[0].id).toBe('prod-1');
      expect(result.results[0].relevanceScore).toBe(0.9);
      expect((result.results[1] as any).__typename).toBe('MerchantResultType');
      expect(result.results[1].relevanceScore).toBe(0.8);
      expect((result.results[2] as any).__typename).toBe('BrandResultType');
      expect(result.results[2].relevanceScore).toBe(0.7);

      // Check facets transformation
      expect(result.facets).toHaveLength(2); // Expecting category and grouped size facets
      expect(result.facets[0].name).toBe('category');
      expect(result.facets[0].values[0].value).toBe('Footwear');
      expect(result.facets[1].name).toBe('size'); // Grouped name
      expect(result.facets[1].displayName).toBe('Size'); // Grouped display name
      expect(result.facets[1].values).toHaveLength(2); // Two values within the size facet
      expect(result.facets[1].values[0].value).toBe('10'); // Parsed value
      expect(result.facets[1].values[0].count).toBe(2);
      expect(result.facets[1].values[1].value).toBe('11'); // Parsed value
      expect(result.facets[1].values[1].count).toBe(1);

      // Check other response fields
      expect(result.pagination.total).toBe(3); // Use total from PaginationType
      expect(result.query).toBe('shoes');
      expect(result.isNlpEnabled).toBe(true);
    });

    it('should correctly transform price facets', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: undefined,
        includeSponsoredContent: false,
        enableHighlighting: false,
      };

      // Define mock response with price facet
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Running Shoe', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: {
          categories: [{ name: 'Footwear', count: 5 }],
          values: [{ name: 'Size:10', count: 3 }],
          price: {
            min: 19.99,
            max: 199.99,
            ranges: [
              { min: 0, max: 50, count: 20 },
              { min: 50, max: 100, count: 15 },
              { min: 100, max: 200, count: 7 },
            ],
          },
        },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      const result = await resolver.multiEntitySearch(input, null as any);

      // Check that we have 3 facets: category, size, and price
      expect(result.facets).toHaveLength(3);

      // Verify price facet structure
      const priceFacet = result.facets?.find(f => f.name === 'price');
      expect(priceFacet).toBeDefined();
      expect(priceFacet?.displayName).toBe('Price');
      expect(priceFacet?.values).toHaveLength(3);

      // Check price range formatting
      expect(priceFacet?.values[0].value).toBe('$0-$50');
      expect(priceFacet?.values[0].count).toBe(20);
      expect(priceFacet?.values[1].value).toBe('$50-$100');
      expect(priceFacet?.values[1].count).toBe(15);
      expect(priceFacet?.values[2].value).toBe('$100-$200');
      expect(priceFacet?.values[2].count).toBe(7);
    });

    it('should correctly apply product filters to search options', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: undefined,
        includeSponsoredContent: false,
        enableHighlighting: false,
        productFilters: {
          categories: ['Footwear', 'Athletic'],
          tags: ['running', 'sports'],
          brandIds: ['brand-1', 'brand-2'],
          merchantIds: ['merch-1'],
          minPrice: 50,
          maxPrice: 200,
          minRating: 4,
          inStock: true,
          colors: ['red', 'blue'],
          sizes: ['10', '11'],
        },
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Running Shoe', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      await resolver.multiEntitySearch(input, null as any);

      // Verify that searchAsync was called with the correct filters
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledTimes(1);
      const searchOptions = mockNlpSearchService.searchAsync.mock.calls[0][0];

      // Check that filters array contains expected filters
      expect(searchOptions.filters).toBeDefined();
      expect(searchOptions.filters.length).toBeGreaterThan(0);

      // Check category filter
      const categoryFilter = searchOptions.filters.find(f => f.field === 'category');
      expect(categoryFilter).toBeDefined();
      expect(categoryFilter.values).toEqual(['Footwear', 'Athletic']);
      expect(categoryFilter.exact).toBe(true);

      // Check tag filter
      const tagFilter = searchOptions.filters.find(f => f.field === 'tags');
      expect(tagFilter).toBeDefined();
      expect(tagFilter.values).toEqual(['running', 'sports']);
      expect(tagFilter.exact).toBe(false);

      // Check brand filter
      const brandFilter = searchOptions.filters.find(f => f.field === 'brandId');
      expect(brandFilter).toBeDefined();
      expect(brandFilter.values).toEqual(['brand-1', 'brand-2']);

      // Check merchant filter
      const merchantFilter = searchOptions.filters.find(f => f.field === 'merchantId');
      expect(merchantFilter).toBeDefined();
      expect(merchantFilter.values).toEqual(['merch-1']);

      // Check inStock filter
      const inStockFilter = searchOptions.filters.find(f => f.field === 'inStock');
      expect(inStockFilter).toBeDefined();
      expect(inStockFilter.values).toEqual(['true']);

      // Check color filter
      const colorFilter = searchOptions.filters.find(f => f.field === 'color');
      expect(colorFilter).toBeDefined();
      expect(colorFilter.values).toEqual(['red', 'blue']);
      expect(colorFilter.exact).toBe(false);

      // Check size filter
      const sizeFilter = searchOptions.filters.find(f => f.field === 'size');
      expect(sizeFilter).toBeDefined();
      expect(sizeFilter.values).toEqual(['10', '11']);

      // Check range filters
      expect(searchOptions.rangeFilters).toBeDefined();
      expect(searchOptions.rangeFilters.length).toBe(2);

      // Check price range filter
      const priceFilter = searchOptions.rangeFilters.find(f => f.field === 'price');
      expect(priceFilter).toBeDefined();
      expect(priceFilter.min).toBe(50);
      expect(priceFilter.max).toBe(200);

      // Check rating range filter
      const ratingFilter = searchOptions.rangeFilters.find(f => f.field === 'rating');
      expect(ratingFilter).toBeDefined();
      expect(ratingFilter.min).toBe(4);
      expect(ratingFilter.max).toBeUndefined();
    });

    it('should correctly apply merchant and brand filters', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: undefined,
        includeSponsoredContent: false,
        enableHighlighting: false,
        merchantFilters: {
          categories: ['Retail'],
          locations: ['New York', 'Los Angeles'],
          minRating: 4.5,
          verifiedOnly: true,
          activeOnly: true,
          minProductCount: 100,
        },
        brandFilters: {
          categories: ['Sportswear'],
          minFoundedYear: 1990,
          maxFoundedYear: 2020,
          verifiedOnly: true,
          minProductCount: 50,
        },
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [],
        merchants: [{ id: 'merch-1', name: 'Shoe Store', score: 0.9 }],
        brands: [{ id: 'brand-1', name: 'Shoe Brand', score: 0.8 }],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      await resolver.multiEntitySearch(input, null as any);

      // Verify that searchAsync was called with the correct filters
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledTimes(1);
      const searchOptions = mockNlpSearchService.searchAsync.mock.calls[0][0];

      // Check that filters array contains expected filters
      expect(searchOptions.filters).toBeDefined();
      expect(searchOptions.filters.length).toBeGreaterThan(0);

      // Check merchant filters
      const merchantCategoryFilter = searchOptions.filters.find(
        f => f.field === 'merchantCategory',
      );
      expect(merchantCategoryFilter).toBeDefined();
      expect(merchantCategoryFilter.values).toEqual(['Retail']);

      const merchantLocationFilter = searchOptions.filters.find(
        f => f.field === 'merchantLocation',
      );
      expect(merchantLocationFilter).toBeDefined();
      expect(merchantLocationFilter.values).toEqual(['New York', 'Los Angeles']);
      expect(merchantLocationFilter.exact).toBe(false);

      const merchantVerifiedFilter = searchOptions.filters.find(
        f => f.field === 'merchantVerified',
      );
      expect(merchantVerifiedFilter).toBeDefined();
      expect(merchantVerifiedFilter.values).toEqual(['true']);

      const merchantActiveFilter = searchOptions.filters.find(f => f.field === 'merchantActive');
      expect(merchantActiveFilter).toBeDefined();
      expect(merchantActiveFilter.values).toEqual(['true']);

      // Check brand filters
      const brandCategoryFilter = searchOptions.filters.find(f => f.field === 'brandCategory');
      expect(brandCategoryFilter).toBeDefined();
      expect(brandCategoryFilter.values).toEqual(['Sportswear']);

      const brandVerifiedFilter = searchOptions.filters.find(f => f.field === 'brandVerified');
      expect(brandVerifiedFilter).toBeDefined();
      expect(brandVerifiedFilter.values).toEqual(['true']);

      // Check range filters
      expect(searchOptions.rangeFilters).toBeDefined();
      expect(searchOptions.rangeFilters.length).toBeGreaterThan(0);

      // Check merchant range filters
      const merchantRatingFilter = searchOptions.rangeFilters.find(
        f => f.field === 'merchantRating',
      );
      expect(merchantRatingFilter).toBeDefined();
      expect(merchantRatingFilter.min).toBe(4.5);

      const merchantProductCountFilter = searchOptions.rangeFilters.find(
        f => f.field === 'merchantProductCount',
      );
      expect(merchantProductCountFilter).toBeDefined();
      expect(merchantProductCountFilter.min).toBe(100);

      // Check brand range filters
      const brandFoundedYearFilter = searchOptions.rangeFilters.find(
        f => f.field === 'brandFoundedYear',
      );
      expect(brandFoundedYearFilter).toBeDefined();
      expect(brandFoundedYearFilter.min).toBe(1990);
      expect(brandFoundedYearFilter.max).toBe(2020);

      const brandProductCountFilter = searchOptions.rangeFilters.find(
        f => f.field === 'brandProductCount',
      );
      expect(brandProductCountFilter).toBeDefined();
      expect(brandProductCountFilter.min).toBe(50);
    });

    it('should correctly apply single sort option', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: undefined,
        includeSponsoredContent: false,
        enableHighlighting: false,
        sortOptions: [{ field: 'price', order: SortOrder.ASC }],
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Running Shoe', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      await resolver.multiEntitySearch(input, null as any);

      // Verify that searchAsync was called with the correct sort options
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledTimes(1);
      const searchOptions = mockNlpSearchService.searchAsync.mock.calls[0][0];

      // Check that sort array contains expected options
      expect(searchOptions.sort).toBeDefined();
      expect(searchOptions.sort.length).toBe(1);
      expect(searchOptions.sort[0].field).toBe('price');
      expect(searchOptions.sort[0].order).toBe(SortOrder.ASC);
    });

    it('should correctly apply multiple sort options', async () => {
      const input: EnhancedSearchInput = {
        query: 'shoes',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: undefined,
        includeSponsoredContent: false,
        enableHighlighting: false,
        sortOptions: [
          { field: 'relevance', order: SortOrder.DESC },
          { field: 'price', order: SortOrder.ASC },
        ],
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Running Shoe', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'shoes', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      await resolver.multiEntitySearch(input, null as any);

      // Verify that searchAsync was called with the correct sort options
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalledTimes(1);
      const searchOptions = mockNlpSearchService.searchAsync.mock.calls[0][0];

      // Check that sort array contains expected options
      expect(searchOptions.sort).toBeDefined();
      expect(searchOptions.sort.length).toBe(2);

      // Check first sort option
      expect(searchOptions.sort[0].field).toBe('relevance');
      expect(searchOptions.sort[0].order).toBe(SortOrder.DESC);

      // Check second sort option
      expect(searchOptions.sort[1].field).toBe('price');
      expect(searchOptions.sort[1].order).toBe(SortOrder.ASC);
    });

    it('should call AnalyticsService.trackSearch with correct basic payload', async () => {
      const input: EnhancedSearchInput = {
        query: 'analytics test',
        page: 1,
        limit: 5,
        enableNlp: true,
        personalized: true,
        boostByValues: false,
        includeSponsoredContent: true,
        experimentId: 'exp-abc',
        enableHighlighting: false,
      };

      // Set up a specific mock response for this test
      mockNlpSearchService.searchAsync.mockResolvedValueOnce({
        pagination: {
          page: 1,
          limit: 5,
          total: 3, // Ensure this matches what we expect in the test
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Product 1', score: 0.9 }],
        merchants: [{ id: 'merch-1', name: 'Merchant 1', score: 0.8 }],
        brands: [{ id: 'brand-1', name: 'Brand 1', score: 0.7 }],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'analytics test', explanation: {} },
      });

      await resolver.multiEntitySearch(input, mockUser as any);

      expect(mockAnalyticsService.trackSearch).toHaveBeenCalledTimes(1);
      const trackSearchCall = mockAnalyticsService.trackSearch.mock.calls[0][0];

      expect(trackSearchCall.query).toBe('analytics test');
      expect(trackSearchCall.userId).toBe(mockUser.id);
      expect(trackSearchCall.resultCount).toBe(3); // This should match the total from the mock response
      expect(trackSearchCall.isNlpEnhanced).toBe(true);
      expect(trackSearchCall.isPersonalized).toBe(true);
      expect(trackSearchCall.experimentId).toBe('exp-abc');
      expect(trackSearchCall.hasFilters).toBe(false);

      // Check enhanced metadata fields
      expect(trackSearchCall.metadata).toBeDefined();
      expect(trackSearchCall.metadata.responseTimeMs).toBeDefined();
      expect(trackSearchCall.metadata.entityDistribution).toBeDefined();
      expect(trackSearchCall.metadata.entityDistribution.products).toBe(1);
      expect(trackSearchCall.metadata.entityDistribution.merchants).toBe(1);
      expect(trackSearchCall.metadata.entityDistribution.brands).toBe(1);

      expect(trackSearchCall.metadata.queryLength).toBe(14); // 'analytics test' length
      expect(trackSearchCall.metadata.page).toBe(1);
      expect(trackSearchCall.metadata.limit).toBe(5);
      expect(trackSearchCall.metadata.totalPages).toBe(1);
      expect(trackSearchCall.metadata.hasNext).toBe(false);
      expect(trackSearchCall.metadata.hasPrevious).toBe(false);
    });

    it('should track filter usage in analytics', async () => {
      const input: EnhancedSearchInput = {
        query: 'filter analytics',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: false,
        enableHighlighting: false,
        productFilters: {
          categories: ['Electronics'],
          minPrice: 100,
          maxPrice: 500,
        },
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Test Product', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: {
          categories: [{ name: 'Electronics', count: 3 }],
          values: [],
          price: { min: 100, max: 500, ranges: [{ min: 100, max: 500, count: 3 }] },
        },
        queryExplanation: { query: 'filter analytics', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValueOnce(mockNlpResponse);

      await resolver.multiEntitySearch(input, mockUser as any);

      // Verify that analytics service was called with correct payload
      expect(mockAnalyticsService.trackSearch).toHaveBeenCalledTimes(1);
      const analyticsPayload = mockAnalyticsService.trackSearch.mock.calls[0][0];

      // Check filter tracking
      expect(analyticsPayload.hasFilters).toBe(true);
      expect(analyticsPayload.filterCount).toBe(2); // category filter and price range filter

      // Verify filter usage is properly tracked
      const filterData = JSON.parse(analyticsPayload.filters);
      expect(filterData).toBeDefined();

      // Check category filter
      expect(filterData.category).toBeDefined();
      expect(filterData.category.type).toBe('exact');
      expect(filterData.category.values).toContain('Electronics');

      // Check price filter
      expect(filterData.price).toBeDefined();
      expect(filterData.price.type).toBe('range');
      expect(filterData.price.min).toBe(100);
      expect(filterData.price.max).toBe(500);

      // Check entity filter counts
      expect(analyticsPayload.metadata.entityFilterCounts).toBeDefined();
      expect(analyticsPayload.metadata.entityFilterCounts.product).toBe(3); // categories, minPrice, and maxPrice

      // Check facet usage tracking
      expect(analyticsPayload.metadata.facetUsage).toBeDefined();
      expect(analyticsPayload.metadata.facetUsage.categories).toBeDefined();
      expect(analyticsPayload.metadata.facetUsage.price).toBeDefined();
      expect(analyticsPayload.metadata.facetUsage.price.min).toBe(100);
      expect(analyticsPayload.metadata.facetUsage.price.max).toBe(500);
    });

    it('should track sort usage in analytics', async () => {
      const input: EnhancedSearchInput = {
        query: 'sort analytics',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: false,
        boostByValues: false,
        includeSponsoredContent: false,
        enableHighlighting: false,
        sortOptions: [
          { field: 'price', order: SortOrder.ASC },
          { field: 'rating', order: SortOrder.DESC },
        ],
      };

      // Define mock response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Test Product', score: 0.9 }],
        merchants: [],
        brands: [],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'sort analytics', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValueOnce(mockNlpResponse);

      await resolver.multiEntitySearch(input, mockUser as any);

      // Verify that analytics service was called with correct payload
      expect(mockAnalyticsService.trackSearch).toHaveBeenCalledTimes(1);
      const analyticsPayload = mockAnalyticsService.trackSearch.mock.calls[0][0];

      // Check sort options tracking
      expect(analyticsPayload.metadata.sortOptions).toBeDefined();

      // Check price sort
      expect(analyticsPayload.metadata.sortOptions.price).toBeDefined();
      expect(analyticsPayload.metadata.sortOptions.price.order).toBe(SortOrder.ASC);
      expect(analyticsPayload.metadata.sortOptions.price.priority).toBe(1); // Primary sort

      // Check rating sort
      expect(analyticsPayload.metadata.sortOptions.rating).toBeDefined();
      expect(analyticsPayload.metadata.sortOptions.rating.order).toBe(SortOrder.DESC);
      expect(analyticsPayload.metadata.sortOptions.rating.priority).toBe(2); // Secondary sort
    });

    it('should re-throw an error if NlpSearchService fails', async () => {
      const searchInput: EnhancedSearchInput = {
        query: 'error test',
        page: 1,
        limit: 10,
        enableNlp: undefined,
        personalized: undefined,
        boostByValues: undefined,
        includeSponsoredContent: undefined,
      };
      const mockError = new Error('NLP Service unavailable');
      mockNlpSearchService.searchAsync.mockRejectedValue(mockError);

      // Test that the error is re-thrown correctly
      await expect(resolver.multiEntitySearch(searchInput, null as any)).rejects.toThrow(
        'NLP Service unavailable',
      );
    });

    it('should succeed even if AnalyticsService fails', async () => {
      const searchInput: EnhancedSearchInput = {
        query: 'analytics error test',
        page: 1,
        limit: 10,
        enableNlp: undefined,
        personalized: undefined,
        boostByValues: undefined,
        includeSponsoredContent: undefined,
      };
      const mockAnalyticsError = new Error('Analytics tracking failed');

      // Set up a mock response for the NLP service
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Product 1', score: 0.9 }],
        merchants: [{ id: 'merch-1', name: 'Merchant 1', score: 0.8 }],
        brands: [{ id: 'brand-1', name: 'Brand 1', score: 0.7 }],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'analytics test', explanation: {} },
      };
      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      // Make analytics mock fail
      mockAnalyticsService.trackSearch.mockRejectedValue(mockAnalyticsError);

      // Execute the resolver method - should not throw despite analytics error
      const result = await resolver.multiEntitySearch(searchInput, null as any);

      // Assert that the main operation succeeded
      expect(result).toBeDefined();
      expect(result.query).toBe(searchInput.query);
      expect(result.pagination.total).toBe(3);
    });

    it('should apply personalization when enabled and user is authenticated', async () => {
      // Set up personalized search input
      const searchInput: EnhancedSearchInput = {
        query: 'personalized search',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: true, // Enable personalization
        boostByValues: true,
        includeSponsoredContent: false,
        enableHighlighting: false,
      };

      // Mock personalization service responses
      const mockPersonalizedFilters = {
        categories: ['clothing', 'accessories'],
        brands: ['brand-123', 'brand-456'],
        sizes: ['M', 'L'],
        colors: ['blue', 'black'],
        materials: ['cotton', 'leather'],
        sustainable: true,
        ethical: true,
        local: false,
      };

      const mockPersonalizedBoosts = {
        categoryBoosts: {
          clothing: 1.5,
          accessories: 1.2,
        },
        brandBoosts: {
          'brand-123': 2.0,
          'brand-456': 1.8,
        },
        productBoosts: {
          'prod-789': 3.0,
        },
      };

      mockPersonalizationService.generatePersonalizedFilters.mockResolvedValue(
        mockPersonalizedFilters,
      );
      mockPersonalizationService.generatePersonalizedBoosts.mockResolvedValue(
        mockPersonalizedBoosts,
      );

      // Set up NLP service response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [
          { id: 'prod-1', title: 'Personalized Product 1', score: 0.95 },
          { id: 'prod-2', title: 'Personalized Product 2', score: 0.85 },
        ],
        merchants: [{ id: 'merch-1', name: 'Merchant 1', score: 0.8 }],
        brands: [
          { id: 'brand-123', name: 'Preferred Brand 1', score: 0.9 },
          { id: 'brand-456', name: 'Preferred Brand 2', score: 0.75 },
        ],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'personalized search', explanation: {} },
      };

      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      // Execute the resolver method with a mock user
      const result = await resolver.multiEntitySearch(searchInput, mockUser as any);

      // Verify personalization services were called with the user ID
      expect(mockPersonalizationService.generatePersonalizedFilters).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockPersonalizationService.generatePersonalizedBoosts).toHaveBeenCalledWith(
        mockUser.id,
      );

      // Verify search options passed to NLP service include personalized filters
      const searchOptionsArg = mockNlpSearchService.searchAsync.mock.calls[0][0];

      // Check that personalization flag is set
      expect(searchOptionsArg.personalized).toBe(true);

      // Check that filters were properly converted and merged
      expect(searchOptionsArg.filters).toBeDefined();

      // Find category filter
      const categoryFilter = searchOptionsArg.filters.find(f => f.field === 'category');
      expect(categoryFilter).toBeDefined();
      expect(categoryFilter.values).toContain('clothing');
      expect(categoryFilter.values).toContain('accessories');
      expect(categoryFilter.exact).toBe(false); // Should use fuzzy matching for categories

      // Find brand filter
      const brandFilter = searchOptionsArg.filters.find(f => f.field === 'brandId');
      expect(brandFilter).toBeDefined();
      expect(brandFilter.values).toContain('brand-123');
      expect(brandFilter.values).toContain('brand-456');
      expect(brandFilter.exact).toBe(true); // Should use exact matching for brands

      // Find values filter
      const valuesFilter = searchOptionsArg.filters.find(f => f.field === 'values');
      expect(valuesFilter).toBeDefined();
      expect(valuesFilter.values).toContain('sustainable');
      expect(valuesFilter.values).toContain('ethical');
      expect(valuesFilter.values).not.toContain('local'); // This was false in the mock

      // Check that metadata contains personalized boosts
      expect(searchOptionsArg.metadata).toBeDefined();
      expect(searchOptionsArg.metadata.personalizedBoosts).toEqual(mockPersonalizedBoosts);

      // Verify user behavior was tracked
      expect(mockPersonalizationService.trackInteractionAndUpdatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        BehaviorType.SEARCH,
        'personalized search',
        'search',
        'personalized search',
      );

      // Verify the final response
      expect(result).toBeDefined();
      expect(result.isPersonalized).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should handle personalization failures gracefully', async () => {
      // Set up personalized search input
      const searchInput: EnhancedSearchInput = {
        query: 'personalization error test',
        page: 1,
        limit: 10,
        enableNlp: true,
        personalized: true, // Enable personalization
        boostByValues: true,
        includeSponsoredContent: false,
        enableHighlighting: false,
      };

      // Mock personalization service to throw an error
      const mockPersonalizationError = new Error('Personalization service unavailable');
      mockPersonalizationService.generatePersonalizedFilters.mockRejectedValue(
        mockPersonalizationError,
      );

      // Set up NLP service response
      const mockNlpResponse = {
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
        products: [{ id: 'prod-1', title: 'Product 1', score: 0.9 }],
        merchants: [{ id: 'merch-1', name: 'Merchant 1', score: 0.8 }],
        brands: [{ id: 'brand-1', name: 'Brand 1', score: 0.7 }],
        facets: { categories: [], values: [], price: undefined },
        queryExplanation: { query: 'personalization error test', explanation: {} },
      };

      mockNlpSearchService.searchAsync.mockResolvedValue(mockNlpResponse);

      // Execute the resolver method - should not throw despite personalization error
      const result = await resolver.multiEntitySearch(searchInput, mockUser as any);

      // We don't need to verify the logger was called as that's an implementation detail
      // The important thing is that the search still works despite the personalization error

      // Assert that the main operation succeeded with non-personalized results
      expect(result).toBeDefined();
      expect(result.query).toBe(searchInput.query);
      expect(result.pagination.total).toBe(3);

      // Verify NLP service was still called with basic search options
      expect(mockNlpSearchService.searchAsync).toHaveBeenCalled();

      // The search should still be marked as personalized in the intent, even if it failed
      const searchOptionsArg = mockNlpSearchService.searchAsync.mock.calls[0][0];
      expect(searchOptionsArg.personalized).toBe(true);
    });
  });
});
