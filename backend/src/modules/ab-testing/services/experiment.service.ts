import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experiment, ExperimentStatus } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult, ResultType } from '../entities/experiment-result.entity';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
import { UpdateExperimentVariantDto } from '../dto/update-experiment-variant.dto';

@Injectable()
export class ExperimentService {
  private readonly logger = new Logger(ExperimentService.name);

  constructor(
    @InjectRepository(Experiment)
    private readonly experimentRepository: Repository<Experiment>,
    @InjectRepository(ExperimentVariant)
    private readonly variantRepository: Repository<ExperimentVariant>,
    @InjectRepository(ExperimentResult)
    private readonly resultRepository: Repository<ExperimentResult>,
    @InjectRepository(UserExperimentAssignment)
    private readonly assignmentRepository: Repository<UserExperimentAssignment>,
  ) {}

  /**
   * Create a new experiment
   * @param createExperimentDto Experiment data
   */
  async create(createExperimentDto: CreateExperimentDto): Promise<Experiment> {
    try {
      // Validate that at least one variant is marked as control
      const hasControl = createExperimentDto.variants.some(variant => variant.isControl);
      if (!hasControl) {
        throw new BadRequestException('At least one variant must be marked as control');
      }

      // Create the experiment
      const experiment = this.experimentRepository.create({
        ...createExperimentDto,
        variants: [],
      });

      // Save the experiment to get an ID
      const savedExperiment = await this.experimentRepository.save(experiment);

      // Create and save variants
      const variants = createExperimentDto.variants.map(variantDto =>
        this.variantRepository.create({
          ...variantDto,
          experimentId: savedExperiment.id,
        }),
      );

      const savedVariants = await this.variantRepository.save(variants);

      // Update the experiment with the variants
      savedExperiment.variants = savedVariants;

      return savedExperiment;
    } catch (error) {
      this.logger.error(`Failed to create experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all experiments
   * @param status Optional status filter
   */
  async findAll(status?: ExperimentStatus): Promise<Experiment[]> {
    try {
      const query: any = {};

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

  /**
   * Find one experiment by ID
   * @param id Experiment ID
   */
  async findOne(id: string): Promise<Experiment> {
    try {
      const experiment = await this.experimentRepository.findOne({
        where: { id },
        relations: ['variants'],
      });

      if (!experiment) {
        throw new NotFoundException(`Experiment with ID ${id} not found`);
      }

      return experiment;
    } catch (error) {
      this.logger.error(`Failed to find experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an experiment
   * @param id Experiment ID
   * @param updateExperimentDto Updated experiment data
   */
  async update(id: string, updateExperimentDto: UpdateExperimentDto): Promise<Experiment> {
    try {
      const experiment = await this.findOne(id);

      // Update experiment properties
      const updatedExperiment = {
        ...experiment,
        ...updateExperimentDto,
      };

      // Remove variants property if present (we'll handle variants separately)
      delete updatedExperiment.variants;

      // Save updated experiment
      await this.experimentRepository.save(updatedExperiment);

      // Update variants if provided
      if (updateExperimentDto.variants) {
        // Validate that at least one variant is marked as control
        const hasControl = updateExperimentDto.variants.some(variant => variant.isControl);
        if (!hasControl) {
          throw new BadRequestException('At least one variant must be marked as control');
        }

        // Delete existing variants
        await this.variantRepository.delete({ experimentId: id });

        // Create and save new variants
        const variants = updateExperimentDto.variants.map(variantDto =>
          this.variantRepository.create({
            ...variantDto,
            experimentId: id,
          }),
        );

        await this.variantRepository.save(variants);
      }

      // Return the updated experiment with variants
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to update experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an experiment variant
   * @param id Variant ID
   * @param updateVariantDto Updated variant data
   */
  async updateVariant(
    id: string,
    updateVariantDto: UpdateExperimentVariantDto,
  ): Promise<ExperimentVariant> {
    try {
      const variant = await this.variantRepository.findOne({
        where: { id },
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${id} not found`);
      }

      // Update variant properties
      const updatedVariant = {
        ...variant,
        ...updateVariantDto,
      };

      // Save updated variant
      return this.variantRepository.save(updatedVariant);
    } catch (error) {
      this.logger.error(`Failed to update variant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an experiment
   * @param id Experiment ID
   */
  async remove(id: string): Promise<void> {
    try {
      const experiment = await this.findOne(id);

      // Delete all assignments for this experiment
      await this.assignmentRepository.delete({ experimentId: id });

      // Delete all variants for this experiment
      await this.variantRepository.delete({ experimentId: id });

      // Delete the experiment
      await this.experimentRepository.remove(experiment);
    } catch (error) {
      this.logger.error(`Failed to remove experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start an experiment
   * @param id Experiment ID
   */
  async startExperiment(id: string): Promise<Experiment> {
    try {
      const experiment = await this.findOne(id);

      if (experiment.status === ExperimentStatus.RUNNING) {
        throw new BadRequestException(`Experiment is already running`);
      }

      // Update experiment status
      experiment.status = ExperimentStatus.RUNNING;
      experiment.startDate = new Date();

      // Save updated experiment
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to start experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pause an experiment
   * @param id Experiment ID
   */
  async pauseExperiment(id: string): Promise<Experiment> {
    try {
      const experiment = await this.findOne(id);

      if (experiment.status !== ExperimentStatus.RUNNING) {
        throw new BadRequestException(`Experiment is not running`);
      }

      // Update experiment status
      experiment.status = ExperimentStatus.PAUSED;

      // Save updated experiment
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to pause experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Complete an experiment
   * @param id Experiment ID
   */
  async completeExperiment(id: string): Promise<Experiment> {
    try {
      const experiment = await this.findOne(id);

      if (
        experiment.status !== ExperimentStatus.RUNNING &&
        experiment.status !== ExperimentStatus.PAUSED
      ) {
        throw new BadRequestException(`Experiment is not running or paused`);
      }

      // Update experiment status
      experiment.status = ExperimentStatus.COMPLETED;
      experiment.endDate = new Date();

      // Save updated experiment
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to complete experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive an experiment
   * @param id Experiment ID
   */
  async archiveExperiment(id: string): Promise<Experiment> {
    try {
      const experiment = await this.findOne(id);

      if (experiment.status === ExperimentStatus.RUNNING) {
        throw new BadRequestException(`Cannot archive a running experiment`);
      }

      // Update experiment status
      experiment.status = ExperimentStatus.ARCHIVED;

      // Save updated experiment
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to archive experiment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Declare a winner for an experiment
   * @param experimentId Experiment ID
   * @param variantId Winning variant ID
   */
  async declareWinner(experimentId: string, variantId: string): Promise<Experiment> {
    try {
      const experiment = await this.findOne(experimentId);

      // Verify the variant belongs to this experiment
      const variant = experiment.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new BadRequestException(
          `Variant with ID ${variantId} does not belong to this experiment`,
        );
      }

      // Update experiment
      experiment.hasWinner = true;
      experiment.winningVariantId = variantId;

      // Update variant
      variant.isWinner = true;
      await this.variantRepository.save(variant);

      // Save updated experiment
      return this.experimentRepository.save(experiment);
    } catch (error) {
      this.logger.error(`Failed to declare winner: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get experiment results
   * @param id Experiment ID
   */
  async getExperimentResults(id: string): Promise<any> {
    try {
      const experiment = await this.findOne(id);

      // Get all variants for this experiment
      const variants = experiment.variants;

      // Calculate metrics for each variant
      const variantResults = await Promise.all(
        variants.map(async variant => {
          // Get impression count
          const impressions = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: ResultType.IMPRESSION,
            },
          });

          // Get click count
          const clicks = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: ResultType.CLICK,
            },
          });

          // Get conversion count
          const conversions = await this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: ResultType.CONVERSION,
            },
          });

          // Calculate rates
          const clickThroughRate = impressions > 0 ? clicks / impressions : 0;
          const conversionRate = impressions > 0 ? conversions / impressions : 0;

          // Get revenue if available
          const revenueResults = await this.resultRepository.find({
            where: {
              variantId: variant.id,
              resultType: ResultType.REVENUE,
            },
          });

          const totalRevenue = revenueResults.reduce((sum, result) => sum + (result.value || 0), 0);
          const averageRevenue = conversions > 0 ? totalRevenue / conversions : 0;

          // Update variant with latest metrics
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
            improvementRate: null, // Initialize improvementRate
          };
        }),
      );

      // Calculate improvement rates compared to control
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
}
