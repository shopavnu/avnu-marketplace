'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var SearchExperimentService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchExperimentService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const experiment_entity_1 = require('../../ab-testing/entities/experiment.entity');
let SearchExperimentService = (SearchExperimentService_1 = class SearchExperimentService {
  constructor(configService) {
    this.configService = configService;
    this.logger = new common_1.Logger(SearchExperimentService_1.name);
    this.experiments = new Map();
    this.enabled = this.configService.get('SEARCH_EXPERIMENTS_ENABLED', true);
    this.initializeExperiments();
  }
  initializeExperiments() {
    this.registerExperiment({
      id: 'entity_boosting_experiment',
      name: 'Entity Boosting Experiment',
      description: 'Tests different entity boosting configurations',
      status: experiment_entity_1.ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Default entity boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: options => {
            return options;
          },
        },
        {
          id: 'product_focused',
          name: 'Product Focused',
          description: 'Higher product boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: options => {
            if (!options.metadata) {
              options.metadata = {};
            }
            options.metadata.entityBoosting = {
              productBoost: 1.5,
              merchantBoost: 0.7,
              brandBoost: 0.8,
            };
            return options;
          },
        },
        {
          id: 'merchant_focused',
          name: 'Merchant Focused',
          description: 'Higher merchant boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: options => {
            if (!options.metadata) {
              options.metadata = {};
            }
            options.metadata.entityBoosting = {
              productBoost: 0.8,
              merchantBoost: 1.5,
              brandBoost: 0.7,
            };
            return options;
          },
        },
        {
          id: 'balanced',
          name: 'Balanced',
          description: 'Equal boosting for all entities',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: options => {
            if (!options.metadata) {
              options.metadata = {};
            }
            options.metadata.entityBoosting = {
              productBoost: 1.0,
              merchantBoost: 1.0,
              brandBoost: 1.0,
            };
            return options;
          },
        },
      ],
    });
    this.registerExperiment({
      id: 'nlp_enhancement_experiment',
      name: 'NLP Enhancement Experiment',
      description: 'Tests different NLP enhancement configurations',
      status: experiment_entity_1.ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'No NLP enhancement',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: options => {
            options.enableNlp = false;
            return options;
          },
        },
        {
          id: 'nlp_enhanced',
          name: 'NLP Enhanced',
          description: 'With NLP enhancement',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: options => {
            options.enableNlp = true;
            return options;
          },
        },
      ],
    });
    this.registerExperiment({
      id: 'value_alignment_experiment',
      name: 'Value Alignment Experiment',
      description: 'Tests different value alignment configurations',
      status: experiment_entity_1.ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'No value alignment boosting',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: options => {
            options.boostByValues = false;
            return options;
          },
        },
        {
          id: 'value_aligned',
          name: 'Value Aligned',
          description: 'With value alignment boosting',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: options => {
            options.boostByValues = true;
            return options;
          },
        },
      ],
    });
  }
  registerExperiment(experiment) {
    if (!this.enabled) {
      return;
    }
    this.experiments.set(experiment.id, experiment);
    this.logger.log(`Registered experiment: ${experiment.name} (${experiment.id})`);
  }
  getExperiments() {
    return Array.from(this.experiments.values());
  }
  getExperiment(experimentId) {
    return this.experiments.get(experimentId);
  }
  applyExperiment(options, experimentId, variantId) {
    if (!this.enabled) {
      return options;
    }
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      this.logger.warn(`Experiment not found: ${experimentId}`);
      return options;
    }
    let variant;
    if (variantId) {
      variant = experiment.variants.find(v => v.id === variantId);
      if (!variant) {
        this.logger.warn(`Variant not found: ${variantId} in experiment ${experimentId}`);
        return options;
      }
    } else {
      variant = this.selectRandomVariant(experiment.variants);
    }
    const modifiedOptions = variant.modifyOptions({ ...options });
    if (!modifiedOptions.metadata) {
      modifiedOptions.metadata = {};
    }
    modifiedOptions.metadata.experimentId = experimentId;
    modifiedOptions.metadata.variantId = variant.id;
    modifiedOptions.experimentId = `${experimentId}:${variant.id}`;
    this.logger.debug(`Applied experiment: ${experimentId}, variant: ${variant.id}`);
    return modifiedOptions;
  }
  selectRandomVariant(variants) {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant;
      }
    }
    return variants[0];
  }
  processExperimentResults(results, options) {
    if (!this.enabled || !options.experimentId) {
      return results;
    }
    const [_experimentId, _variantId] = options.experimentId.split(':');
    results.experimentId = options.experimentId;
    return results;
  }
});
exports.SearchExperimentService = SearchExperimentService;
exports.SearchExperimentService =
  SearchExperimentService =
  SearchExperimentService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      SearchExperimentService,
    );
//# sourceMappingURL=search-experiment.service.js.map
