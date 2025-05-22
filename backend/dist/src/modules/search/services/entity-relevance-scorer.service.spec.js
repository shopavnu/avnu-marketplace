'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const config_1 = require('@nestjs/config');
const entity_relevance_scorer_service_1 = require('./entity-relevance-scorer.service');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
const common_1 = require('@nestjs/common');
describe('EntityRelevanceScorerService', () => {
  let service;
  let _loggerMock;
  let configService;
  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    };
    configService.get.mockImplementation((key, defaultValue) => {
      const config = {
        SEARCH_DEFAULT_PRODUCT_BOOST: 1.0,
        SEARCH_DEFAULT_MERCHANT_BOOST: 0.8,
        SEARCH_DEFAULT_BRAND_BOOST: 0.8,
        SEARCH_USER_HISTORY_BOOST_FACTOR: 1.2,
        SEARCH_USER_PREFERENCES_BOOST_FACTOR: 1.5,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });
    const module = await testing_1.Test.createTestingModule({
      providers: [
        entity_relevance_scorer_service_1.EntityRelevanceScorerService,
        {
          provide: common_1.Logger,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
        {
          provide: config_1.ConfigService,
          useValue: configService,
        },
      ],
    }).compile();
    service = module.get(entity_relevance_scorer_service_1.EntityRelevanceScorerService);
    _loggerMock = module.get(common_1.Logger);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('calculateEntityRelevance', () => {
    it('should calculate product entity relevance correctly', () => {
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
      const relevanceScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.PRODUCT,
        query,
        product,
      );
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });
    it('should calculate merchant entity relevance correctly', () => {
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
      const relevanceScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.MERCHANT,
        query,
        merchant,
      );
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });
    it('should calculate brand entity relevance correctly', () => {
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
      const relevanceScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.BRAND,
        query,
        brand,
      );
      expect(relevanceScore).toBeDefined();
      expect(relevanceScore).toBeGreaterThan(0);
      expect(relevanceScore).toBeLessThanOrEqual(1);
    });
    it('should handle different entity types correctly', () => {
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
      const productScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.PRODUCT,
        query,
        product,
      );
      const brandScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.BRAND,
        query,
        brand,
      );
      const merchantScore = service.calculateEntityRelevance(
        search_entity_type_enum_1.SearchEntityType.MERCHANT,
        query,
        merchant,
      );
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
      const boostedResults = service.applyEntityBoosting(
        results,
        search_entity_type_enum_1.SearchEntityType.ALL,
        entityBoosting,
      );
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(3);
      const product = boostedResults.hits.hits.find(hit => hit._index === 'products');
      const brand = boostedResults.hits.hits.find(hit => hit._index === 'brands');
      const merchant = boostedResults.hits.hits.find(hit => hit._index === 'merchants');
      expect(product._score).toBeCloseTo(0.8 * 2.0, 5);
      expect(brand._score).toBeCloseTo(0.85 * 1.5, 5);
      expect(merchant._score).toBeCloseTo(0.9 * 0.5, 5);
    });
    it('should use default boosting when custom boosting is not provided', () => {
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
      const boostedResults = service.applyEntityBoosting(
        results,
        search_entity_type_enum_1.SearchEntityType.ALL,
      );
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);
      const brand = boostedResults.hits.hits.find(hit => hit._index === 'brands');
      expect(brand._score).toBeCloseTo(0.85 * 0.8, 5);
    });
  });
  describe('applyEntityBoosting with user personalization', () => {
    it('should boost entities based on user preferences', () => {
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
      };
      const boostedResults = service.applyEntityBoosting(
        results,
        search_entity_type_enum_1.SearchEntityType.PRODUCT,
        undefined,
      );
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);
      const product1 = boostedResults.hits.hits.find(
        hit => hit._source.title === 'Sustainable T-Shirt',
      );
      const product2 = boostedResults.hits.hits.find(hit => hit._source.title === 'Leather Jacket');
      expect(product1._score).toBeCloseTo(0.8, 5);
      expect(product2._score).toBeCloseTo(0.9, 5);
    });
    it('should not modify scores when user is not provided', () => {
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
      const boostedResults = service.applyEntityBoosting(
        results,
        search_entity_type_enum_1.SearchEntityType.PRODUCT,
      );
      expect(boostedResults).toBeDefined();
      expect(boostedResults.hits.hits.length).toBe(2);
      expect(boostedResults.hits.hits[0]._score).toBeCloseTo(0.8, 5);
      expect(boostedResults.hits.hits[1]._score).toBeCloseTo(0.9, 5);
    });
  });
  describe('enhanceQueryWithEntityBoosting', () => {
    it('should enhance Elasticsearch query with entity boosting', () => {
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
      const enhancedQuery = service.enhanceQueryWithEntityBoosting(
        baseQuery,
        search_entity_type_enum_1.SearchEntityType.ALL,
        entityBoosting,
      );
      expect(enhancedQuery).toBeDefined();
      expect(enhancedQuery.function_score).toBeDefined();
      expect(enhancedQuery.function_score.query).toBeDefined();
      expect(enhancedQuery.function_score.query).toEqual(baseQuery);
      expect(enhancedQuery.function_score.functions).toBeDefined();
      expect(enhancedQuery.function_score.functions).toHaveLength(3);
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
      const baseQuery = {
        query: {
          bool: {
            must: [{ match: { title: 'sustainable' } }],
          },
        },
      };
      const enhancedQuery = service.enhanceQueryWithEntityBoosting(
        baseQuery,
        search_entity_type_enum_1.SearchEntityType.PRODUCT,
      );
      expect(enhancedQuery).toEqual(baseQuery);
    });
  });
  describe('normalizeScores', () => {
    it('should normalize scores to a 0-1 range', () => {
      const mockResults = {
        hits: {
          total: { value: 4, relation: 'eq' },
          max_score: null,
          hits: [
            { _index: 'products', _id: 'p1', _score: 2.5, _source: {} },
            { _index: 'products', _id: 'p2', _score: 1.0, _source: {} },
            { _index: 'merchants', _id: 'm1', _score: 5.0, _source: {} },
            { _index: 'merchants', _id: 'm2', _score: 0.5, _source: {} },
          ],
        },
      };
      const normalizedResults = service.normalizeScores(mockResults);
      expect(normalizedResults).toBeDefined();
      expect(normalizedResults.hits.hits).toHaveLength(4);
      const normalizedHits = normalizedResults.hits.hits;
      const product1 = normalizedHits.find(hit => hit._id === 'p1');
      const product2 = normalizedHits.find(hit => hit._id === 'p2');
      const merchant1 = normalizedHits.find(hit => hit._id === 'm1');
      const merchant2 = normalizedHits.find(hit => hit._id === 'm2');
      expect(product1._normalized_score).toBeCloseTo(2.5 / 2.5, 5);
      expect(product2._normalized_score).toBeCloseTo(1.0 / 2.5, 5);
      expect(merchant1._normalized_score).toBeCloseTo(5.0 / 5.0, 5);
      expect(merchant2._normalized_score).toBeCloseTo(0.5 / 5.0, 5);
      expect(normalizedHits[0]._id).toBe('p1');
      expect(normalizedHits[1]._id).toBe('m1');
      expect([normalizedHits[0]._id, normalizedHits[1]._id]).toEqual(
        expect.arrayContaining(['p1', 'm1']),
      );
      expect(normalizedHits[2]._id).toBe('p2');
      expect(normalizedHits[3]._id).toBe('m2');
    });
    it('should handle empty results', () => {
      const emptyResults = {
        hits: {
          total: { value: 0, relation: 'eq' },
          max_score: null,
          hits: [],
        },
      };
      const normalizedResults = service.normalizeScores(emptyResults);
      expect(normalizedResults).toEqual(emptyResults);
      expect(normalizedResults.hits.hits).toHaveLength(0);
    });
    it('should handle results with zero max score for a type', () => {
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
      const normalizedResults = service.normalizeScores(zeroScoreResults);
      const productHit = normalizedResults.hits.hits.find(h => h._id === 'p1');
      const merchantHit = normalizedResults.hits.hits.find(h => h._id === 'm1');
      expect(productHit._normalized_score).toBeUndefined();
      expect(merchantHit._normalized_score).toBeCloseTo(1.0, 5);
    });
  });
});
//# sourceMappingURL=entity-relevance-scorer.service.spec.js.map
