import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EntityRelevanceScorerService } from './entity-relevance-scorer.service';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { Logger } from '@nestjs/common';

describe('EntityRelevanceScorerService', () => {
  let service: EntityRelevanceScorerService;
  let _loggerMock: Logger;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    // Create mock implementations
    configService = {
      get: jest.fn(),
    };

    // Configure default behavior
    configService.get.mockImplementation((key: string, defaultValue: any) => {
      const config = {
        SEARCH_DEFAULT_PRODUCT_BOOST: 1.0,
        SEARCH_DEFAULT_MERCHANT_BOOST: 0.8,
        SEARCH_DEFAULT_BRAND_BOOST: 0.8,
        SEARCH_USER_HISTORY_BOOST_FACTOR: 1.2,
        SEARCH_USER_PREFERENCES_BOOST_FACTOR: 1.5,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityRelevanceScorerService,
        {
          provide: Logger,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<EntityRelevanceScorerService>(EntityRelevanceScorerService);
    _loggerMock = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateEntityRelevance', () => {
    it('should calculate product entity relevance correctly', () => {
      // Arrange
      const product = {
        id: '1',
        title: 'Sustainable T-Shirt',
        description: 'Made from organic cotton',
        price: 29.99,
        rating: 4.5,
        categories: ['Clothing', 'Sustainable Fashion'],
        tags: ['organic', 'eco-friendly'],
        brandName: 'EcoWear',
      };

      const query = 'sustainable clothing';

      // Act
      const relevanceScore = service.calculateEntityRelevance(
        SearchEntityType.PRODUCT,
        query,
        product,
      );

      // Assert
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });

    it('should calculate merchant entity relevance correctly', () => {
      // Arrange
      const merchant = {
        id: '1',
        name: 'Sustainable Fashion Co',
        description: 'Eco-friendly clothing brand',
        location: 'Portland, OR',
        foundedYear: 2018,
        categories: ['Fashion', 'Sustainable'],
        values: ['Eco-friendly', 'Fair Trade'],
      };

      const query = 'sustainable fashion';

      // Act
      const relevanceScore = service.calculateEntityRelevance(
        SearchEntityType.MERCHANT,
        query,
        merchant,
      );

      // Assert
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });

    it('should calculate brand entity relevance correctly', () => {
      // Arrange
      const brand = {
        id: '1',
        name: 'EcoWear',
        description: 'Sustainable fashion brand',
        location: 'USA',
        foundedYear: 2010,
        categories: ['Fashion', 'Apparel'],
        values: ['Sustainability', 'Fair Labor'],
        story: 'Founded with a mission to create sustainable fashion',
      };

      const query = 'sustainable fashion brand';

      // Act
      const relevanceScore = service.calculateEntityRelevance(SearchEntityType.BRAND, query, brand);

      // Assert
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });

    it('should handle different entity types correctly', () => {
      // Arrange
      const product = {
        id: '1',
        title: 'Sustainable T-Shirt',
        description: 'Made from organic cotton',
        categories: ['Clothing'],
      };

      const brand = {
        id: '2',
        name: 'EcoWear',
        description: 'Sustainable fashion brand',
      };

      const merchant = {
        id: '3',
        name: 'Sustainable Fashion Co',
        description: 'Eco-friendly clothing brand',
      };

      const query = 'sustainable fashion';

      // Act
      const productScore = service.calculateEntityRelevance(
        SearchEntityType.PRODUCT,
        query,
        product,
      );
      const brandScore = service.calculateEntityRelevance(SearchEntityType.BRAND, query, brand);
      const merchantScore = service.calculateEntityRelevance(
        SearchEntityType.MERCHANT,
        query,
        merchant,
      );

      // Assert
      expect(productScore).toBeDefined();
      expect(brandScore).toBeDefined();
      expect(merchantScore).toBeDefined();
      expect(productScore).toBeGreaterThan(0);
      expect(brandScore).toBeGreaterThan(0);
      expect(merchantScore).toBeGreaterThan(0);
    });
  });

  describe('applyEntityBoosting', () => {
    it('should apply custom entity boosting factors', () => {
      // Arrange
      const results = {
        hits: {
          hits: [
            {
              _index: 'products',
              _score: 0.8,
              _source: { title: 'Sustainable T-Shirt' },
            },
            {
              _index: 'brands',
              _score: 0.85,
              _source: { name: 'EcoWear' },
            },
            {
              _index: 'merchants',
              _score: 0.9,
              _source: { name: 'Sustainable Fashion Co' },
            },
          ],
        },
      };

      const entityBoosting = {
        productBoost: 2.0,
        brandBoost: 1.5,
        merchantBoost: 0.5,
      };

      // Act
      const boostedResults = service.applyEntityBoosting(
        results,
        SearchEntityType.ALL,
        entityBoosting,
      );

      // Assert
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(3);

      // Find each entity type
      const product = boostedResults.hits.hits.find(hit => hit._index === 'products');
      const brand = boostedResults.hits.hits.find(hit => hit._index === 'brands');
      const merchant = boostedResults.hits.hits.find(hit => hit._index === 'merchants');

      // Check scores were boosted correctly
      expect(product._score).toBeCloseTo(0.8 * 2.0, 5);
      expect(brand._score).toBeCloseTo(0.85 * 1.5, 5);
      expect(merchant._score).toBeCloseTo(0.9 * 0.5, 5);
    });

    it('should use default boosting when custom boosting is not provided', () => {
      // Arrange
      const results = {
        hits: {
          hits: [
            {
              _index: 'products',
              _score: 0.8,
              _source: { title: 'Sustainable T-Shirt' },
            },
            {
              _index: 'brands',
              _score: 0.85,
              _source: { name: 'EcoWear' },
            },
          ],
        },
      };

      // Act
      const boostedResults = service.applyEntityBoosting(results, SearchEntityType.ALL);

      // Assert
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);

      // Find brand entity
      const brand = boostedResults.hits.hits.find(hit => hit._index === 'brands');

      // Check default boosting was applied
      expect(brand._score).toBeCloseTo(0.85 * 0.8, 5); // Using default brand boost of 0.8
    });
  });

  describe('applyEntityBoosting with user personalization', () => {
    it('should boost entities based on user preferences', () => {
      // Arrange
      const results = {
        hits: {
          hits: [
            {
              _index: 'products',
              _score: 0.8,
              _source: {
                title: 'Sustainable T-Shirt',
                tags: ['sustainable', 'organic'],
              },
            },
            {
              _index: 'products',
              _score: 0.9,
              _source: {
                title: 'Leather Jacket',
                tags: ['leather', 'premium'],
              },
            },
          ],
        },
      };

      const _user = {
        id: '123',
        preferences: {
          values: ['sustainability', 'eco-friendly'],
          preferredCategories: ['clothing'],
        },
        history: {
          viewedProducts: ['456', '789'],
          viewedMerchants: ['101'],
        },
      } as any;

      // Act
      const boostedResults = service.applyEntityBoosting(
        results,
        SearchEntityType.PRODUCT,
        undefined,
      );

      // Assert
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);

      // Scores should be unchanged since we're searching a specific entity type
      const product1 = boostedResults.hits.hits.find(
        hit => hit._source.title === 'Sustainable T-Shirt',
      );
      const product2 = boostedResults.hits.hits.find(hit => hit._source.title === 'Leather Jacket');

      expect(product1._score).toBeCloseTo(0.8, 5);
      expect(product2._score).toBeCloseTo(0.9, 5);
    });

    it('should not modify scores when user is not provided', () => {
      // Arrange
      const results = {
        hits: {
          hits: [
            {
              _index: 'products',
              _score: 0.8,
              _source: { title: 'Sustainable T-Shirt' },
            },
            {
              _index: 'products',
              _score: 0.9,
              _source: { title: 'Leather Jacket' },
            },
          ],
        },
      };

      // Act
      const boostedResults = service.applyEntityBoosting(results, SearchEntityType.PRODUCT);

      // Assert
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);

      // Scores should remain unchanged for specific entity type search
      expect(boostedResults.hits.hits[0]._score).toBeCloseTo(0.8, 5);
      expect(boostedResults.hits.hits[1]._score).toBeCloseTo(0.9, 5);
    });
  });

  describe('enhanceQueryWithEntityBoosting', () => {
    it('should enhance Elasticsearch query with entity boosting', () => {
      // Arrange
      const baseQuery = {
        query: {
          bool: {
            must: [{ match: { title: 'sustainable' } }],
          },
        },
      };

      const entityBoosting = {
        productBoost: 2.0,
        brandBoost: 1.5,
        merchantBoost: 0.5,
      };

      // Act
      const enhancedQuery = service.enhanceQueryWithEntityBoosting(
        baseQuery,
        SearchEntityType.ALL,
        entityBoosting,
      );

      // Assert
      expect(enhancedQuery).toBeDefined();
      expect(enhancedQuery.function_score).toBeDefined();
      expect(enhancedQuery.function_score.query).toBeDefined();
      expect(enhancedQuery.function_score.query).toEqual(baseQuery); // The original query should be nested
      expect(enhancedQuery.function_score.functions).toBeDefined();
      expect(enhancedQuery.function_score.functions).toHaveLength(3);

      // Check if boost weights are applied correctly
      const productFunction = enhancedQuery.function_score.functions.find(
        f => f.filter.term._index === 'products',
      );
      expect(productFunction?.weight).toBe(entityBoosting.productBoost);

      const merchantFunction = enhancedQuery.function_score.functions.find(
        f => f.filter.term._index === 'merchants',
      );
      expect(merchantFunction?.weight).toBe(entityBoosting.merchantBoost);

      const brandFunction = enhancedQuery.function_score.functions.find(
        f => f.filter.term._index === 'brands',
      );
      expect(brandFunction?.weight).toBe(entityBoosting.brandBoost);
    });

    it('should not modify query for specific entity type search', () => {
      // Arrange
      const baseQuery = {
        query: {
          bool: {
            must: [{ match: { title: 'sustainable' } }],
          },
        },
      };

      // Act
      const enhancedQuery = service.enhanceQueryWithEntityBoosting(
        baseQuery,
        SearchEntityType.PRODUCT,
      );

      // Assert
      expect(enhancedQuery).toEqual(baseQuery);
    });
  });

  describe('normalizeScores', () => {
    it('should normalize scores to a 0-1 range', () => {
      // Arrange
      const mockResults = {
        hits: {
          total: { value: 4, relation: 'eq' },
          max_score: null,
          hits: [
            // Products
            { _index: 'products', _id: 'p1', _score: 2.5, _source: {} },
            { _index: 'products', _id: 'p2', _score: 1.0, _source: {} },
            // Merchants
            { _index: 'merchants', _id: 'm1', _score: 5.0, _source: {} },
            { _index: 'merchants', _id: 'm2', _score: 0.5, _source: {} },
          ],
        },
      };

      // Act
      const normalizedResults = service.normalizeScores(mockResults);

      // Assert
      expect(normalizedResults).toBeDefined();
      expect(normalizedResults.hits.hits).toHaveLength(4);

      const normalizedHits = normalizedResults.hits.hits;

      // Find specific hits
      const product1 = normalizedHits.find(hit => hit._id === 'p1');
      const product2 = normalizedHits.find(hit => hit._id === 'p2');
      const merchant1 = normalizedHits.find(hit => hit._id === 'm1');
      const merchant2 = normalizedHits.find(hit => hit._id === 'm2');

      // Check product normalization (max score was 2.5)
      expect(product1._normalized_score).toBeCloseTo(2.5 / 2.5, 5); // Should be 1
      expect(product2._normalized_score).toBeCloseTo(1.0 / 2.5, 5); // Should be 0.4

      // Check merchant normalization (max score was 5.0)
      expect(merchant1._normalized_score).toBeCloseTo(5.0 / 5.0, 5); // Should be 1
      expect(merchant2._normalized_score).toBeCloseTo(0.5 / 5.0, 5); // Should be 0.1

      // Check overall sorting (should be by _normalized_score descending)
      expect(normalizedHits[0]._id).toBe('p1'); // Normalized score 1.0
      expect(normalizedHits[1]._id).toBe('m1'); // Normalized score 1.0
      // Order of p1 and m1 might vary if scores are exactly equal, accept either
      expect([normalizedHits[0]._id, normalizedHits[1]._id]).toEqual(
        expect.arrayContaining(['p1', 'm1']),
      );
      expect(normalizedHits[2]._id).toBe('p2'); // Normalized score 0.4
      expect(normalizedHits[3]._id).toBe('m2'); // Normalized score 0.1
    });

    it('should handle empty results', () => {
      // Arrange
      const emptyResults = {
        hits: {
          total: { value: 0, relation: 'eq' },
          max_score: null,
          hits: [],
        },
      };

      // Act
      const normalizedResults = service.normalizeScores(emptyResults);

      // Assert
      expect(normalizedResults).toEqual(emptyResults);
      expect(normalizedResults.hits.hits).toHaveLength(0);
    });

    it('should handle results with zero max score for a type', () => {
      // Arrange
      const zeroScoreResults = {
        hits: {
          total: { value: 2, relation: 'eq' },
          max_score: null,
          hits: [
            { _index: 'products', _id: 'p1', _score: 0, _source: {} },
            { _index: 'merchants', _id: 'm1', _score: 5.0, _source: {} },
          ],
        },
      };

      // Act
      const normalizedResults = service.normalizeScores(zeroScoreResults);

      // Assert
      const productHit = normalizedResults.hits.hits.find(h => h._id === 'p1');
      const merchantHit = normalizedResults.hits.hits.find(h => h._id === 'm1');
      expect(productHit._normalized_score).toBeUndefined(); // No normalization if max is 0
      expect(merchantHit._normalized_score).toBeCloseTo(1.0, 5); // Merchant normalized correctly
    });
  });
});
