import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SearchExperimentService } from './search-experiment.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import {} from /* ExperimentStatus */ '../../ab-testing/entities/experiment.entity';
import { SearchResponseDto } from '../dto/search-response.dto';

describe('SearchExperimentService', () => {
  let service: SearchExperimentService;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    // Create mock implementations
    configService = {
      get: jest.fn(),
    };

    // Configure default behavior
    configService.get.mockImplementation((key: string, defaultValue: any) => {
      const config = {
        SEARCH_EXPERIMENTS_ENABLED: true,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchExperimentService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<SearchExperimentService>(SearchExperimentService);
    // Service constructor calls initializeExperiments, so experiments should be ready
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyExperiment', () => {
    it('should apply entity boosting experiment correctly', () => {
      // Arrange
      const baseOptions: SearchOptionsInput = { query: 'test' };

      // Act
      const modifiedOptions = service.applyExperiment(
        baseOptions,
        'entity_boosting_experiment',
        'product_focused',
      );

      // Assert
      expect(modifiedOptions.metadata).toBeDefined();
      expect(modifiedOptions.metadata.entityBoosting).toBeDefined();
      expect(modifiedOptions.metadata.entityBoosting.productBoost).toBe(1.5); // Check exact value from initialization
      expect(modifiedOptions.metadata.experimentId).toEqual('entity_boosting_experiment');
      expect(modifiedOptions.metadata.variantId).toEqual('product_focused');
      expect(modifiedOptions.experimentId).toEqual('entity_boosting_experiment:product_focused'); // Check combined ID
    });

    it('should apply nlp enhancement experiment correctly', () => {
      // Arrange
      const baseOptions: SearchOptionsInput = { query: 'test', enableNlp: false }; // Start with NLP disabled

      // Act
      const modifiedOptions = service.applyExperiment(
        baseOptions,
        'nlp_enhancement_experiment',
        'nlp_enhanced',
      );

      // Assert
      expect(modifiedOptions.enableNlp).toBe(true); // Check the direct property modification
      expect(modifiedOptions.metadata).toBeDefined();
      expect(modifiedOptions.metadata.experimentId).toEqual('nlp_enhancement_experiment');
      expect(modifiedOptions.metadata.variantId).toEqual('nlp_enhanced');
      expect(modifiedOptions.experimentId).toEqual('nlp_enhancement_experiment:nlp_enhanced');
    });

    it('should apply value alignment experiment correctly', () => {
      // Arrange
      const baseOptions: SearchOptionsInput = { query: 'test', boostByValues: false }; // Start with value boost disabled

      // Act
      const modifiedOptions = service.applyExperiment(
        baseOptions,
        'value_alignment_experiment',
        'value_aligned',
      );

      // Assert
      expect(modifiedOptions.boostByValues).toBe(true); // Check the direct property modification
      expect(modifiedOptions.metadata).toBeDefined();
      expect(modifiedOptions.metadata.experimentId).toEqual('value_alignment_experiment');
      expect(modifiedOptions.metadata.variantId).toEqual('value_aligned');
      expect(modifiedOptions.experimentId).toEqual('value_alignment_experiment:value_aligned');
    });

    it('should return original options if experiment is not found', () => {
      // Arrange
      const baseOptions: SearchOptionsInput = { query: 'test' };

      // Act
      const modifiedOptions = service.applyExperiment(
        baseOptions,
        'non-existent-experiment',
        'variant',
      );

      // Assert
      expect(modifiedOptions).toEqual(baseOptions);
    });
  });

  describe('processExperimentResults', () => {
    it('should add experimentId to results DTO', () => {
      // Arrange
      const searchResults: SearchResponseDto = {
        query: 'results test',
        pagination: { total: 10 } as any, // Minimal mock
        products: [],
        merchants: [],
        brands: [],
        facets: {} as any,
        usedNlp: false,
        // No experimentId initially
      };
      const options: SearchOptionsInput = {
        query: 'results test',
        experimentId: 'entity_boosting_experiment:product_focused', // Set by applyExperiment
        metadata: {
          experimentId: 'entity_boosting_experiment',
          variantId: 'product_focused',
        },
      };

      // Act
      const processedResults = service.processExperimentResults(searchResults, options);

      // Assert
      expect(processedResults.experimentId).toBeDefined();
      expect(processedResults.experimentId).toEqual(options.experimentId);
      // Ensure original results object was modified (or check if a new one is returned)
      expect(processedResults).toBe(searchResults); // Check if it modified in place
    });

    it('should return results unchanged when no experimentId is in options', () => {
      // Arrange
      const searchResults: SearchResponseDto = {
        query: 'results test',
        pagination: { total: 5 } as any,
        products: [],
        merchants: [],
        brands: [],
        facets: {} as any,
        usedNlp: false,
      };
      const options: SearchOptionsInput = {
        query: 'results test',
        // No experimentId or metadata
      };

      // Act
      const processedResults = service.processExperimentResults(searchResults, options);

      // Assert
      expect(processedResults.experimentId).toBeUndefined();
      expect(processedResults).toBe(searchResults);
    });
  });

  describe('getExperiment', () => {
    it('should return experiment by ID', () => {
      // Arrange
      const experimentId = 'entity_boosting_experiment';

      // Act
      const experiment = service.getExperiment(experimentId);

      // Assert
      expect(experiment).toBeDefined();
      expect(experiment.id).toEqual(experimentId);
      expect(experiment.variants).toBeDefined();
      expect(Array.isArray(experiment.variants)).toBe(true);
      expect(experiment.variants.length).toBeGreaterThan(0);
    });

    it('should return undefined for non-existent experiment ID', () => {
      // Arrange
      const experimentId = 'non-existent-experiment';

      // Act
      const experiment = service.getExperiment(experimentId);

      // Assert
      expect(experiment).toBeUndefined();
    });
  });

  describe('selectRandomVariant', () => {
    it('should select a variant when applying experiment without specific variantId', () => {
      const baseOptions: SearchOptionsInput = { query: 'test' };
      const experimentId = 'entity_boosting_experiment';

      // Act
      const modifiedOptions = service.applyExperiment(baseOptions, experimentId); // No variantId specified

      // Assert
      expect(modifiedOptions.metadata).toBeDefined();
      expect(modifiedOptions.metadata.experimentId).toEqual(experimentId);
      expect(modifiedOptions.metadata.variantId).toBeDefined(); // A variant should have been selected
      expect(modifiedOptions.experimentId).toBeDefined();
      expect(modifiedOptions.experimentId.startsWith(experimentId + ':')).toBe(true);
    });
  });
});
