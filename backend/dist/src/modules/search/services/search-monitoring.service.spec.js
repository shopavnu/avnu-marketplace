'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const event_emitter_1 = require('@nestjs/event-emitter');
const config_1 = require('@nestjs/config');
const search_monitoring_service_1 = require('./search-monitoring.service');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
describe('SearchMonitoringService', () => {
  let service;
  let eventEmitter;
  let configService;
  const createMockResults = total => ({
    query: 'mock query',
    pagination: { total },
    products: [],
    merchants: [],
    brands: [],
    facets: {},
    usedNlp: false,
  });
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      providers: [
        search_monitoring_service_1.SearchMonitoringService,
        {
          provide: event_emitter_1.EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: config_1.ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              if (key === 'SEARCH_MONITORING_ENABLED') return true;
              if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
              if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
              if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();
    service = module.get(search_monitoring_service_1.SearchMonitoringService);
    eventEmitter = module.get(event_emitter_1.EventEmitter2);
    configService = module.get(config_1.ConfigService);
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('trackSearch', () => {
    const mockInput = {
      query: 'test query',
      entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
    };
    it('should track basic search performance and metrics', () => {
      const duration = 150;
      const mockResults = createMockResults(2);
      const resultCount = mockResults.pagination.total;
      service.trackSearch(mockInput, mockResults, duration);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.metrics',
        expect.objectContaining({
          query: 'test query',
          entityType: 'product',
          duration,
          resultCount,
        }),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.warning',
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.critical',
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.relevance.zero_results',
        expect.anything(),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.performance', expect.anything());
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.metrics', expect.anything());
    });
    it('should emit warning event for slow searches', () => {
      const duration = 600;
      const mockResults = createMockResults(1);
      const resultCount = mockResults.pagination.total;
      const _slowThreshold = 500;
      service.trackSearch(mockInput, mockResults, duration);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.metrics',
        expect.objectContaining({
          query: 'test query',
          entityType: 'product',
          duration,
          resultCount,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance.warning',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.critical',
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.relevance.zero_results',
        expect.anything(),
      );
    });
    it('should emit critical event for very slow searches', () => {
      const duration = 1200;
      const mockResults = createMockResults(1);
      const resultCount = mockResults.pagination.total;
      const _criticalThreshold = 1000;
      service.trackSearch(mockInput, mockResults, duration);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.metrics',
        expect.objectContaining({
          query: 'test query',
          entityType: 'product',
          duration,
          resultCount,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance.critical',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.warning',
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.relevance.zero_results',
        expect.anything(),
      );
    });
    it('should track zero results searches', () => {
      const mockInputZero = {
        query: 'nonexistent product',
        entityType: search_entity_type_enum_1.SearchEntityType.PRODUCT,
      };
      const duration = 50;
      const mockResults = createMockResults(0);
      const resultCount = mockResults.pagination.total;
      service.trackSearch(mockInputZero, mockResults, duration);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance',
        expect.objectContaining({ query: 'nonexistent product', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.metrics',
        expect.objectContaining({
          query: 'nonexistent product',
          entityType: 'product',
          duration,
          resultCount,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.relevance.zero_results',
        expect.objectContaining({ query: 'nonexistent product', entityType: 'product' }),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.warning',
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.performance.critical',
        expect.anything(),
      );
    });
    it('should not track when monitoring is disabled', () => {
      configService.get.mockImplementation(key => {
        if (key === 'SEARCH_MONITORING_ENABLED') return false;
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
        return true;
      });
      service = new search_monitoring_service_1.SearchMonitoringService(
        configService,
        eventEmitter,
      );
      const duration = 150;
      const mockResults = createMockResults(1);
      service.trackSearch(mockInput, mockResults, duration);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
    it('should not track when sampling rate is 0', () => {
      configService.get.mockImplementation((key, defaultValue) => {
        if (key === 'SEARCH_MONITORING_ENABLED') return true;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 0.0;
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        return defaultValue;
      });
      service = new search_monitoring_service_1.SearchMonitoringService(
        configService,
        eventEmitter,
      );
      const duration = 150;
      const mockResults = createMockResults(1);
      for (let i = 0; i < 10; i++) {
        service.trackSearch(mockInput, mockResults, duration);
      }
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
    it('should always track when sampling rate is 1', () => {
      configService.get.mockImplementation((key, defaultValue) => {
        if (key === 'SEARCH_MONITORING_ENABLED') return true;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        return defaultValue;
      });
      service = new search_monitoring_service_1.SearchMonitoringService(
        configService,
        eventEmitter,
      );
      const duration = 150;
      const mockResults = createMockResults(1);
      service.trackSearch(mockInput, mockResults, duration);
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.performance', expect.anything());
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.metrics', expect.anything());
    });
  });
});
//# sourceMappingURL=search-monitoring.service.spec.js.map
