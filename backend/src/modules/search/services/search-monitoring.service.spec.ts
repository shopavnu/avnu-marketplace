import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SearchMonitoringService } from './search-monitoring.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import {} from /* User */ '../../users/entities/user.entity';
// Remove LoggerService import if it's not used elsewhere after provider removal
// import { LoggerService } from '../../../common/services/logger.service';
import { SearchResponseDto } from '../dto/search-response.dto'; // Import SearchResponseDto

describe('SearchMonitoringService', () => {
  let service: SearchMonitoringService;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;
  // Remove logger variable declaration if not needed
  // let logger: LoggerService;

  // Helper function to create a mock SearchResponseDto
  const createMockResults = (total: number): SearchResponseDto => ({
    query: 'mock query', // Adjust as needed per test
    pagination: { total } as any, // Only mock necessary fields for these tests
    // Add other required fields from SearchResponseDto with default/mock values if needed
    products: [],
    merchants: [],
    brands: [],
    facets: {} as any,
    usedNlp: false,
    // relevanceScores: {}, // Add if needed
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMonitoringService,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              // Use config keys from the service code
              if (key === 'SEARCH_MONITORING_ENABLED') return true;
              if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
              if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
              if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
              // Add relevance thresholds if needed by tested logic, though these tests focus on emit
              // if (key === 'SEARCH_RELEVANCE_ZERO_RESULTS_THRESHOLD') return 0.05;
              // if (key === 'SEARCH_RELEVANCE_LOW_THRESHOLD') return 0.3;
              return defaultValue;
            }),
          },
        },
        // REMOVE LoggerService provider
        // {
        //   provide: LoggerService,
        //   useValue: { /* ... mock methods ... */ },
        // },
      ],
    }).compile();

    service = module.get<SearchMonitoringService>(SearchMonitoringService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    configService = module.get<ConfigService>(ConfigService);
    // Remove logger assignment if provider is removed
    // logger = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackSearch', () => {
    const mockInput: SearchOptionsInput = {
      query: 'test query',
      entityType: SearchEntityType.PRODUCT,
    };
    // const mockUser = { id: 'user-123' } as User; // Keep if needed

    it('should track basic search performance and metrics', () => {
      const duration = 150;
      const mockResults = createMockResults(2); // Pass result count here
      const resultCount = mockResults.pagination.total; // Use total from mock

      service.trackSearch(mockInput, mockResults, duration); // Pass mockResults

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.performance',
        expect.objectContaining({ query: 'test query', entityType: 'product', duration }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'search.metrics', // This event is emitted by trackSearchMetrics internally
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
      // Check if 'search.relevance.zero_results' is emitted by trackRelevance based on results
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'search.relevance.zero_results',
        expect.anything(),
      );

      // The number of calls depends on the internal logic of trackSearch calling sub-methods
      // Let's check for the main expected ones without being too strict on the exact count initially
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.performance', expect.anything());
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.metrics', expect.anything());
      // expect(eventEmitter.emit).toHaveBeenCalledTimes(X); // Adjust X based on internal calls
    });

    it('should emit warning event for slow searches', () => {
      const duration = 600; // Above slow threshold
      const mockResults = createMockResults(1);
      const resultCount = mockResults.pagination.total;
      const _slowThreshold = 500; // Get from config mock if needed, but hardcoded is fine for check

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
        // Note: The service code doesn't actually include the threshold in the payload
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
      // expect(eventEmitter.emit).toHaveBeenCalledTimes(X); // Adjust X
    });

    it('should emit critical event for very slow searches', () => {
      const duration = 1200; // Above critical threshold
      const mockResults = createMockResults(1);
      const resultCount = mockResults.pagination.total;
      const _criticalThreshold = 1000; // Get from config mock if needed

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
        // Note: The service code doesn't actually include the threshold in the payload
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
      // expect(eventEmitter.emit).toHaveBeenCalledTimes(X); // Adjust X
    });

    it('should track zero results searches', () => {
      const mockInputZero: SearchOptionsInput = {
        query: 'nonexistent product',
        entityType: SearchEntityType.PRODUCT,
      };
      const duration = 50;
      const mockResults = createMockResults(0); // Zero results
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
      // trackRelevance emits this
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
      // expect(eventEmitter.emit).toHaveBeenCalledTimes(X); // Adjust X
    });

    it('should not track when monitoring is disabled', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'SEARCH_MONITORING_ENABLED') return false;
        // Return other defaults
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
        return true; // Default return
      });
      // Re-initialize service needed if config changes behavior on construction
      service = new SearchMonitoringService(configService, eventEmitter); // Correct constructor call
      const duration = 150;
      const mockResults = createMockResults(1);

      service.trackSearch(mockInput, mockResults, duration);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not track when sampling rate is 0', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SEARCH_MONITORING_ENABLED') return true;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 0.0;
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        return defaultValue;
      });
      // service = new SearchMonitoringService(configService, eventEmitter); // Re-init
      service = new SearchMonitoringService(configService, eventEmitter); // Correct constructor call
      const duration = 150;
      const mockResults = createMockResults(1);

      for (let i = 0; i < 10; i++) {
        service.trackSearch(mockInput, mockResults, duration);
      }

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should always track when sampling rate is 1', () => {
      (configService.get as jest.Mock).mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'SEARCH_MONITORING_ENABLED') return true;
        if (key === 'SEARCH_MONITORING_SAMPLE_RATE') return 1.0;
        if (key === 'SEARCH_PERFORMANCE_WARNING_THRESHOLD') return 500;
        if (key === 'SEARCH_PERFORMANCE_CRITICAL_THRESHOLD') return 1000;
        return defaultValue;
      });
      // service = new SearchMonitoringService(configService, eventEmitter); // Re-init
      service = new SearchMonitoringService(configService, eventEmitter); // Correct constructor call
      const duration = 150;
      const mockResults = createMockResults(1);

      service.trackSearch(mockInput, mockResults, duration);

      expect(eventEmitter.emit).toHaveBeenCalledWith('search.performance', expect.anything());
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.metrics', expect.anything());
      // expect(eventEmitter.emit).toHaveBeenCalledTimes(X); // Adjust X
    });
  });
  // Remove other describe blocks if they rely on methods not present or tested
});
