"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const search_experiment_service_1 = require("./search-experiment.service");
describe('SearchExperimentService', () => {
    let service;
    let configService;
    beforeEach(async () => {
        configService = {
            get: jest.fn(),
        };
        configService.get.mockImplementation((key, defaultValue) => {
            const config = {
                SEARCH_EXPERIMENTS_ENABLED: true,
            };
            return config[key] !== undefined ? config[key] : defaultValue;
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                search_experiment_service_1.SearchExperimentService,
                {
                    provide: config_1.ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();
        service = module.get(search_experiment_service_1.SearchExperimentService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('applyExperiment', () => {
        it('should apply entity boosting experiment correctly', () => {
            const baseOptions = { query: 'test' };
            const modifiedOptions = service.applyExperiment(baseOptions, 'entity_boosting_experiment', 'product_focused');
            expect(modifiedOptions.metadata).toBeDefined();
            expect(modifiedOptions.metadata.entityBoosting).toBeDefined();
            expect(modifiedOptions.metadata.entityBoosting.productBoost).toBe(1.5);
            expect(modifiedOptions.metadata.experimentId).toEqual('entity_boosting_experiment');
            expect(modifiedOptions.metadata.variantId).toEqual('product_focused');
            expect(modifiedOptions.experimentId).toEqual('entity_boosting_experiment:product_focused');
        });
        it('should apply nlp enhancement experiment correctly', () => {
            const baseOptions = { query: 'test', enableNlp: false };
            const modifiedOptions = service.applyExperiment(baseOptions, 'nlp_enhancement_experiment', 'nlp_enhanced');
            expect(modifiedOptions.enableNlp).toBe(true);
            expect(modifiedOptions.metadata).toBeDefined();
            expect(modifiedOptions.metadata.experimentId).toEqual('nlp_enhancement_experiment');
            expect(modifiedOptions.metadata.variantId).toEqual('nlp_enhanced');
            expect(modifiedOptions.experimentId).toEqual('nlp_enhancement_experiment:nlp_enhanced');
        });
        it('should apply value alignment experiment correctly', () => {
            const baseOptions = { query: 'test', boostByValues: false };
            const modifiedOptions = service.applyExperiment(baseOptions, 'value_alignment_experiment', 'value_aligned');
            expect(modifiedOptions.boostByValues).toBe(true);
            expect(modifiedOptions.metadata).toBeDefined();
            expect(modifiedOptions.metadata.experimentId).toEqual('value_alignment_experiment');
            expect(modifiedOptions.metadata.variantId).toEqual('value_aligned');
            expect(modifiedOptions.experimentId).toEqual('value_alignment_experiment:value_aligned');
        });
        it('should return original options if experiment is not found', () => {
            const baseOptions = { query: 'test' };
            const modifiedOptions = service.applyExperiment(baseOptions, 'non-existent-experiment', 'variant');
            expect(modifiedOptions).toEqual(baseOptions);
        });
    });
    describe('processExperimentResults', () => {
        it('should add experimentId to results DTO', () => {
            const searchResults = {
                query: 'results test',
                pagination: { total: 10 },
                products: [],
                merchants: [],
                brands: [],
                facets: {},
                usedNlp: false,
            };
            const options = {
                query: 'results test',
                experimentId: 'entity_boosting_experiment:product_focused',
                metadata: {
                    experimentId: 'entity_boosting_experiment',
                    variantId: 'product_focused',
                },
            };
            const processedResults = service.processExperimentResults(searchResults, options);
            expect(processedResults.experimentId).toBeDefined();
            expect(processedResults.experimentId).toEqual(options.experimentId);
            expect(processedResults).toBe(searchResults);
        });
        it('should return results unchanged when no experimentId is in options', () => {
            const searchResults = {
                query: 'results test',
                pagination: { total: 5 },
                products: [],
                merchants: [],
                brands: [],
                facets: {},
                usedNlp: false,
            };
            const options = {
                query: 'results test',
            };
            const processedResults = service.processExperimentResults(searchResults, options);
            expect(processedResults.experimentId).toBeUndefined();
            expect(processedResults).toBe(searchResults);
        });
    });
    describe('getExperiment', () => {
        it('should return experiment by ID', () => {
            const experimentId = 'entity_boosting_experiment';
            const experiment = service.getExperiment(experimentId);
            expect(experiment).toBeDefined();
            expect(experiment.id).toEqual(experimentId);
            expect(experiment.variants).toBeDefined();
            expect(Array.isArray(experiment.variants)).toBe(true);
            expect(experiment.variants.length).toBeGreaterThan(0);
        });
        it('should return undefined for non-existent experiment ID', () => {
            const experimentId = 'non-existent-experiment';
            const experiment = service.getExperiment(experimentId);
            expect(experiment).toBeUndefined();
        });
    });
    describe('selectRandomVariant', () => {
        it('should select a variant when applying experiment without specific variantId', () => {
            const baseOptions = { query: 'test' };
            const experimentId = 'entity_boosting_experiment';
            const modifiedOptions = service.applyExperiment(baseOptions, experimentId);
            expect(modifiedOptions.metadata).toBeDefined();
            expect(modifiedOptions.metadata.experimentId).toEqual(experimentId);
            expect(modifiedOptions.metadata.variantId).toBeDefined();
            expect(modifiedOptions.experimentId).toBeDefined();
            expect(modifiedOptions.experimentId.startsWith(experimentId + ':')).toBe(true);
        });
    });
});
//# sourceMappingURL=search-experiment.service.spec.js.map