import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
import { EntityBoostingDto } from '../dto/entity-specific-filters.dto';
import { ExperimentStatus } from '../../ab-testing/entities/experiment.entity';

/**
 * Service for managing search experiments (A/B testing)
 */
@Injectable()
export class SearchExperimentService {
  private readonly logger = new Logger(SearchExperimentService.name);
  private readonly experiments: Map<string, SearchExperiment> = new Map();
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('SEARCH_EXPERIMENTS_ENABLED', true);
    this.initializeExperiments();
  }

  /**
   * Initialize predefined experiments
   */
  private initializeExperiments(): void {
    // Experiment 1: Entity boosting variations
    this.registerExperiment({
      id: 'entity_boosting_experiment',
      name: 'Entity Boosting Experiment',
      description: 'Tests different entity boosting configurations',
      status: ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Default entity boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: (options: SearchOptionsInput) => {
            // No changes to options
            return options;
          },
        },
        {
          id: 'product_focused',
          name: 'Product Focused',
          description: 'Higher product boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: (options: SearchOptionsInput) => {
            if (!options.metadata) {
              options.metadata = {};
            }

            options.metadata.entityBoosting = {
              productBoost: 1.5,
              merchantBoost: 0.7,
              brandBoost: 0.8,
            } as EntityBoostingDto;

            return options;
          },
        },
        {
          id: 'merchant_focused',
          name: 'Merchant Focused',
          description: 'Higher merchant boosting',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: (options: SearchOptionsInput) => {
            if (!options.metadata) {
              options.metadata = {};
            }

            options.metadata.entityBoosting = {
              productBoost: 0.8,
              merchantBoost: 1.5,
              brandBoost: 0.7,
            } as EntityBoostingDto;

            return options;
          },
        },
        {
          id: 'balanced',
          name: 'Balanced',
          description: 'Equal boosting for all entities',
          weight: 25,
          trafficPercentage: 25,
          modifyOptions: (options: SearchOptionsInput) => {
            if (!options.metadata) {
              options.metadata = {};
            }

            options.metadata.entityBoosting = {
              productBoost: 1.0,
              merchantBoost: 1.0,
              brandBoost: 1.0,
            } as EntityBoostingDto;

            return options;
          },
        },
      ],
    });

    // Experiment 2: NLP enhancement variations
    this.registerExperiment({
      id: 'nlp_enhancement_experiment',
      name: 'NLP Enhancement Experiment',
      description: 'Tests different NLP enhancement configurations',
      status: ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'No NLP enhancement',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: (options: SearchOptionsInput) => {
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
          modifyOptions: (options: SearchOptionsInput) => {
            options.enableNlp = true;
            return options;
          },
        },
      ],
    });

    // Experiment 3: Value alignment variations
    this.registerExperiment({
      id: 'value_alignment_experiment',
      name: 'Value Alignment Experiment',
      description: 'Tests different value alignment configurations',
      status: ExperimentStatus.RUNNING,
      startDate: new Date(),
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'No value alignment boosting',
          weight: 50,
          trafficPercentage: 50,
          modifyOptions: (options: SearchOptionsInput) => {
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
          modifyOptions: (options: SearchOptionsInput) => {
            options.boostByValues = true;
            return options;
          },
        },
      ],
    });
  }

  /**
   * Register a new experiment
   * @param experiment Experiment configuration
   */
  registerExperiment(experiment: SearchExperiment): void {
    if (!this.enabled) {
      return;
    }

    this.experiments.set(experiment.id, experiment);
    this.logger.log(`Registered experiment: ${experiment.name} (${experiment.id})`);
  }

  /**
   * Get all registered experiments
   * @returns List of experiments
   */
  getExperiments(): SearchExperiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Get an experiment by ID
   * @param experimentId Experiment ID
   * @returns Experiment or undefined if not found
   */
  getExperiment(experimentId: string): SearchExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * Apply an experiment to search options
   * @param options Search options
   * @param experimentId Experiment ID
   * @param variantId Variant ID (optional, will select randomly if not provided)
   * @returns Modified search options with experiment applied
   */
  applyExperiment(
    options: SearchOptionsInput,
    experimentId: string,
    variantId?: string,
  ): SearchOptionsInput {
    if (!this.enabled) {
      return options;
    }

    const experiment = this.experiments.get(experimentId);

    if (!experiment) {
      this.logger.warn(`Experiment not found: ${experimentId}`);
      return options;
    }

    // Select variant
    let variant: SearchExperimentVariant;

    if (variantId) {
      // Use specified variant
      variant = experiment.variants.find(v => v.id === variantId);

      if (!variant) {
        this.logger.warn(`Variant not found: ${variantId} in experiment ${experimentId}`);
        return options;
      }
    } else {
      // Select random variant based on weights
      variant = this.selectRandomVariant(experiment.variants);
    }

    // Apply variant modifications
    const modifiedOptions = variant.modifyOptions({ ...options });

    // Set experiment and variant IDs
    if (!modifiedOptions.metadata) {
      modifiedOptions.metadata = {};
    }

    modifiedOptions.metadata.experimentId = experimentId;
    modifiedOptions.metadata.variantId = variant.id;
    modifiedOptions.experimentId = `${experimentId}:${variant.id}`;

    this.logger.debug(`Applied experiment: ${experimentId}, variant: ${variant.id}`);

    return modifiedOptions;
  }

  /**
   * Select a random variant based on weights
   * @param variants Experiment variants
   * @returns Selected variant
   */
  private selectRandomVariant(variants: SearchExperimentVariant[]): SearchExperimentVariant {
    // Calculate total weight
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);

    // Generate random number between 0 and total weight
    const random = Math.random() * totalWeight;

    // Select variant based on weight
    let cumulativeWeight = 0;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;

      if (random < cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  /**
   * Process search results for an experiment
   * @param results Search results
   * @param options Search options
   * @returns Processed search results
   */
  processExperimentResults(
    results: SearchResponseDto,
    options: SearchOptionsInput,
  ): SearchResponseDto {
    if (!this.enabled || !options.experimentId) {
      return results;
    }

    // Extract experiment and variant IDs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_experimentId, _variantId] = options.experimentId.split(':');

    // Add experiment information to results
    results.experimentId = options.experimentId;

    // Add experiment metadata if needed

    return results;
  }
}

/**
 * Search experiment configuration
 */
export interface SearchExperiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  startDate: Date;
  variants: SearchExperimentVariant[];
}

/**
 * Search experiment variant
 */
export interface SearchExperimentVariant {
  id: string;
  name: string;
  description: string;
  weight: number;
  trafficPercentage: number;
  modifyOptions: (options: SearchOptionsInput) => SearchOptionsInput;
}
