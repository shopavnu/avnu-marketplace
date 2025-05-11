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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var ExperimentService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ExperimentService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const experiment_entity_1 = require('../entities/experiment.entity');
const experiment_variant_entity_1 = require('../entities/experiment-variant.entity');
const experiment_result_entity_1 = require('../entities/experiment-result.entity');
const user_experiment_assignment_entity_1 = require('../entities/user-experiment-assignment.entity');
let ExperimentService = (ExperimentService_1 = class ExperimentService {
  constructor(experimentRepository, variantRepository, resultRepository, assignmentRepository) {
    this.experimentRepository = experimentRepository;
    this.variantRepository = variantRepository;
    this.resultRepository = resultRepository;
    this.assignmentRepository = assignmentRepository;
    this.logger = new common_1.Logger(ExperimentService_1.name);
  }
  async create(createExperimentDto) {
    try {
      const hasControl = createExperimentDto.variants.some(variant => variant.isControl);
      if (!hasControl) {
        throw new common_1.BadRequestException('At least one variant must be marked as control');
      }
      const experiment = this.experimentRepository.create({
        ...createExperimentDto,
        variants: [],
      });
      const savedExperiment = await this.experimentRepository.save(experiment);
      const variants = createExperimentDto.variants.map(variantDto =>
        this.variantRepository.create({
          ...variantDto,
          experimentId: savedExperiment.id,
        }),
      );
      const savedVariants = await this.variantRepository.save(variants);
      savedExperiment.variants = savedVariants;
      return savedExperiment;
    } catch (error) {
      this.logger.error(`Failed to create experiment: ${error.message}`);
      throw error;
    }
  }
  async findAll(status) {
    try {
      const query = {};
      if (status) {
        query.status = status;
      }
      return this.experimentRepository.find({
        where: query,
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find experiments: ${error.message}`);
      throw error;
    }
  }
  async findOne(id) {
    try {
      const experiment = await this.experimentRepository.findOne({
        where: { id },
        relations: ['variants'],
      });
      if (!experiment) {
        throw new common_1.NotFoundException(`Experiment with ID ${id} not found`);
      }
      return experiment;
    } catch (error) {
      this.logger.error(`Failed to find experiment: ${error.message}`);
      throw error;
    }
  }
  async update(id, updateExperimentDto) {
    try {
      const experiment = await this.findOne(id);
      const updatedExperiment = {
        ...experiment,
        ...updateExperimentDto,
      };
      delete updatedExperiment.variants;
      await this.experimentRepository.save(updatedExperiment);
      if (updateExperimentDto.variants) {
        const hasControl = updateExperimentDto.variants.some(variant => variant.isControl);
        if (!hasControl) {
          throw new common_1.BadRequestException('At least one variant must be marked as control');
        }
        await this.variantRepository.delete({ experimentId: id });
        const variants = updateExperimentDto.variants.map(variantDto =>
          this.variantRepository.create({
            ...variantDto,
            experimentId: id,
          }),
        );
        await this.variantRepository.save(variants);
      }
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to update experiment: ${error.message}`);
      throw error;
    }
  }
  async updateVariant(id, updateVariantDto) {
    try {
      const variant = await this.variantRepository.findOne({
        where: { id },
      });
      if (!variant) {
        throw new common_1.NotFoundException(`Variant with ID ${id} not found`);
      }
      const updatedVariant = {
        ...variant,
        ...updateVariantDto,
      };
      return this.variantRepository.save(updatedVariant);
    } catch (error) {
      this.logger.error(`Failed to update variant: ${error.message}`);
      throw error;
    }
  }
  async remove(id) {
    try {
      const experiment = await this.findOne(id);
      await this.assignmentRepository.delete({ experimentId: id });
      await this.variantRepository.delete({ experimentId: id });
      await this.experimentRepository.remove(experiment);
    } catch (error) {
      this.logger.error(`Failed to remove experiment: ${error.message}`);
      throw error;
    }
  }
  async startExperiment(id) {
    try {
      const experiment = await this.findOne(id);
      if (experiment.status === experiment_entity_1.ExperimentStatus.RUNNING) {
        throw new common_1.BadRequestException(`Experiment is already running`);
      }
      experiment.status = experiment_entity_1.ExperimentStatus.RUNNING;
      experiment.startDate = new Date();
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to start experiment: ${error.message}`);
      throw error;
    }
  }
  async pauseExperiment(id) {
    try {
      const experiment = await this.findOne(id);
      if (experiment.status !== experiment_entity_1.ExperimentStatus.RUNNING) {
        throw new common_1.BadRequestException(`Experiment is not running`);
      }
      experiment.status = experiment_entity_1.ExperimentStatus.PAUSED;
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to pause experiment: ${error.message}`);
      throw error;
    }
  }
  async completeExperiment(id) {
    try {
      const experiment = await this.findOne(id);
      if (
        experiment.status !== experiment_entity_1.ExperimentStatus.RUNNING &&
        experiment.status !== experiment_entity_1.ExperimentStatus.PAUSED
      ) {
        throw new common_1.BadRequestException(`Experiment is not running or paused`);
      }
      experiment.status = experiment_entity_1.ExperimentStatus.COMPLETED;
      experiment.endDate = new Date();
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to complete experiment: ${error.message}`);
      throw error;
    }
  }
  async archiveExperiment(id) {
    try {
      const experiment = await this.findOne(id);
      if (experiment.status === experiment_entity_1.ExperimentStatus.RUNNING) {
        throw new common_1.BadRequestException(`Cannot archive a running experiment`);
      }
      experiment.status = experiment_entity_1.ExperimentStatus.ARCHIVED;
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to archive experiment: ${error.message}`);
      throw error;
    }
  }
  async declareWinner(experimentId, variantId) {
    try {
      const experiment = await this.findOne(experimentId);
      const variant = experiment.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new common_1.BadRequestException(
          `Variant with ID ${variantId} does not belong to this experiment`,
        );
      }
      experiment.hasWinner = true;
      experiment.winningVariantId = variantId;
      variant.isWinner = true;
      await this.variantRepository.save(variant);
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to declare winner: ${error.message}`);
      throw error;
    }
  }
  async getExperimentResults(id) {
    try {
      const experiment = await this.findOne(id);
      const variants = experiment.variants;
      const variantResults = await Promise.all(
        variants.map(async variant => {
          const impressions = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: experiment_result_entity_1.ResultType.IMPRESSION,
            },
          });
          const clicks = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: experiment_result_entity_1.ResultType.CLICK,
            },
          });
          const conversions = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: experiment_result_entity_1.ResultType.CONVERSION,
            },
          });
          const clickThroughRate = impressions > 0 ? clicks / impressions : 0;
          const conversionRate = impressions > 0 ? conversions / impressions : 0;
          const revenueResults = await this.resultRepository.find({
            where: {
              variantId: variant.id,
              resultType: experiment_result_entity_1.ResultType.REVENUE,
            },
          });
          const totalRevenue = revenueResults.reduce((sum, result) => sum + (result.value || 0), 0);
          const averageRevenue = conversions > 0 ? totalRevenue / conversions : 0;
          variant.impressions = impressions;
          variant.conversions = conversions;
          variant.conversionRate = conversionRate;
          await this.variantRepository.save(variant);
          return {
            variantId: variant.id,
            variantName: variant.name,
            isControl: variant.isControl,
            impressions,
            clicks,
            conversions,
            clickThroughRate,
            conversionRate,
            totalRevenue,
            averageRevenue,
            isWinner: variant.isWinner,
            improvementRate: null,
          };
        }),
      );
      const controlVariant = variantResults.find(v => v.isControl);
      if (controlVariant) {
        variantResults.forEach(variant => {
          if (!variant.isControl) {
            variant.improvementRate =
              controlVariant.conversionRate > 0
                ? (variant.conversionRate - controlVariant.conversionRate) /
                  controlVariant.conversionRate
                : 0;
          }
        });
      }
      return {
        experimentId: experiment.id,
        experimentName: experiment.name,
        status: experiment.status,
        startDate: experiment.startDate,
        endDate: experiment.endDate,
        variants: variantResults,
      };
    } catch (error) {
      this.logger.error(`Failed to get experiment results: ${error.message}`);
      throw error;
    }
  }
});
exports.ExperimentService = ExperimentService;
exports.ExperimentService =
  ExperimentService =
  ExperimentService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(experiment_entity_1.Experiment)),
        __param(1, (0, typeorm_1.InjectRepository)(experiment_variant_entity_1.ExperimentVariant)),
        __param(2, (0, typeorm_1.InjectRepository)(experiment_result_entity_1.ExperimentResult)),
        __param(
          3,
          (0, typeorm_1.InjectRepository)(
            user_experiment_assignment_entity_1.UserExperimentAssignment,
          ),
        ),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          typeorm_2.Repository,
          typeorm_2.Repository,
          typeorm_2.Repository,
        ]),
      ],
      ExperimentService,
    );
//# sourceMappingURL=experiment.service.js.map
