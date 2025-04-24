import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository /* FindOperator */ } from 'typeorm';
import { Experiment, ExperimentStatus, ExperimentType } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult, ResultType } from '../entities/experiment-result.entity';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';

@Injectable()
export class ExperimentAssignmentService {
  private readonly logger = new Logger(ExperimentAssignmentService.name);

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
   * Get or create a variant assignment for a user/session
   * @param experimentId Experiment ID
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getOrCreateAssignment(
    experimentId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<UserExperimentAssignment> {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId must be provided');
      }

      // Check if experiment is running
      const experiment = await this.experimentRepository.findOne({
        where: { id: experimentId },
        relations: ['variants'],
      });

      if (!experiment) {
        throw new NotFoundException(`Experiment with ID ${experimentId} not found`);
      }

      if (experiment.status !== ExperimentStatus.RUNNING) {
        throw new Error(`Experiment is not running (status: ${experiment.status})`);
      }

      // Check if user/session is already assigned to a variant
      let assignment: UserExperimentAssignment | null = null;

      if (userId) {
        assignment = await this.assignmentRepository.findOne({
          where: {
            experimentId,
            userId,
          },
        });
      } else if (sessionId) {
        assignment = await this.assignmentRepository.findOne({
          where: {
            experimentId,
            sessionId,
          },
        });
      }

      // If assignment exists, return it
      if (assignment) {
        return assignment;
      }

      // Check audience percentage
      if (experiment.audiencePercentage !== null && experiment.audiencePercentage !== undefined) {
        // Generate a random number between 0 and 100
        const randomValue = Math.random() * 100;

        // If random value is greater than audience percentage, don't include in experiment
        if (randomValue > experiment.audiencePercentage) {
          // Find control variant
          const controlVariant = experiment.variants.find(v => v.isControl);
          if (!controlVariant) {
            throw new Error('No control variant found for experiment');
          }

          // Create assignment to control variant
          assignment = this.assignmentRepository.create({
            experimentId,
            userId,
            sessionId,
            variantId: controlVariant.id,
          });

          return this.assignmentRepository.save(assignment);
        }
      }

      // Randomly assign to a variant
      const variants = experiment.variants;
      const randomIndex = Math.floor(Math.random() * variants.length);
      const selectedVariant = variants[randomIndex];

      // Create assignment
      assignment = this.assignmentRepository.create({
        experimentId,
        userId,
        sessionId,
        variantId: selectedVariant.id,
      });

      return this.assignmentRepository.save(assignment);
    } catch (error) {
      this.logger.error(`Failed to get or create assignment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active experiments for a specific type
   * @param experimentType Experiment type
   */
  async getActiveExperiments(experimentType: string): Promise<Experiment[]> {
    try {
      // Validate and cast the input string to the ExperimentType enum
      const isValidType = Object.values(ExperimentType).includes(experimentType as ExperimentType);
      if (!isValidType) {
        this.logger.warn(`Invalid experiment type provided: ${experimentType}`);
        return []; // Or throw an error: throw new Error(`Invalid experiment type: ${experimentType}`);
      }
      const typeEnum = experimentType as ExperimentType;

      return this.experimentRepository.find({
        where: {
          status: ExperimentStatus.RUNNING,
          type: typeEnum, // Use the validated and casted enum value
        },
        relations: ['variants'],
      });
    } catch (error) {
      this.logger.error(`Failed to get active experiments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get variant configuration for a user/session
   * @param experimentType Experiment type
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getVariantConfiguration(
    experimentType: string,
    userId?: string,
    sessionId?: string,
  ): Promise<any> {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId must be provided');
      }

      // Get active experiments of the specified type
      const activeExperiments = await this.getActiveExperiments(experimentType);

      if (activeExperiments.length === 0) {
        return null;
      }

      // For each experiment, get or create assignment
      const assignments = await Promise.all(
        activeExperiments.map(async experiment => {
          const assignment = await this.getOrCreateAssignment(experiment.id, userId, sessionId);

          // Find the variant
          const variant = experiment.variants.find(v => v.id === assignment.variantId);

          if (!variant) {
            throw new Error(`Variant with ID ${assignment.variantId} not found`);
          }

          // Track impression
          await this.trackImpression(assignment.id);

          return {
            experimentId: experiment.id,
            experimentName: experiment.name,
            experimentType: experiment.type,
            variantId: variant.id,
            variantName: variant.name,
            isControl: variant.isControl,
            configuration: variant.configuration ? JSON.parse(variant.configuration) : {},
            assignmentId: assignment.id,
          };
        }),
      );

      // Return configurations
      return assignments.reduce((result, assignment) => {
        result[assignment.experimentId] = {
          variantId: assignment.variantId,
          configuration: assignment.configuration,
          assignmentId: assignment.assignmentId,
        };
        return result;
      }, {});
    } catch (error) {
      this.logger.error(`Failed to get variant configuration: ${error.message}`);
      // Return null in case of error to not break the application
      return null;
    }
  }

  /**
   * Track impression for an assignment
   * @param assignmentId Assignment ID
   */
  async trackImpression(assignmentId: string): Promise<void> {
    try {
      // Get assignment
      const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
      }

      // Update assignment
      if (!assignment.hasImpression) {
        assignment.hasImpression = true;
        await this.assignmentRepository.save(assignment);
      }

      // Create result
      const result = this.resultRepository.create({
        variantId: assignment.variantId,
        userId: assignment.userId,
        sessionId: assignment.sessionId,
        resultType: ResultType.IMPRESSION,
      });

      await this.resultRepository.save(result);
    } catch (error) {
      this.logger.error(`Failed to track impression: ${error.message}`);
    }
  }

  /**
   * Track interaction for an assignment
   * @param assignmentId Assignment ID
   * @param context Context of the interaction
   * @param metadata Additional metadata
   */
  async trackInteraction(assignmentId: string, context?: string, metadata?: any): Promise<void> {
    try {
      // Get assignment
      const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
      }

      // Update assignment
      if (!assignment.hasInteraction) {
        assignment.hasInteraction = true;
        await this.assignmentRepository.save(assignment);
      }

      // Create result
      const result = this.resultRepository.create({
        variantId: assignment.variantId,
        userId: assignment.userId,
        sessionId: assignment.sessionId,
        resultType: ResultType.CLICK,
        context,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      await this.resultRepository.save(result);
    } catch (error) {
      this.logger.error(`Failed to track interaction: ${error.message}`);
    }
  }

  /**
   * Track conversion for an assignment
   * @param assignmentId Assignment ID
   * @param value Value of the conversion
   * @param context Context of the conversion
   * @param metadata Additional metadata
   */
  async trackConversion(
    assignmentId: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void> {
    try {
      // Get assignment
      const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
      }

      // Update assignment
      if (!assignment.hasConversion) {
        assignment.hasConversion = true;
        await this.assignmentRepository.save(assignment);
      }

      // Create conversion result
      const conversionResult = this.resultRepository.create({
        variantId: assignment.variantId,
        userId: assignment.userId,
        sessionId: assignment.sessionId,
        resultType: ResultType.CONVERSION,
        context,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      await this.resultRepository.save(conversionResult);

      // Create revenue result if value is provided
      if (value !== undefined && value !== null) {
        const revenueResult = this.resultRepository.create({
          variantId: assignment.variantId,
          userId: assignment.userId,
          sessionId: assignment.sessionId,
          resultType: ResultType.REVENUE,
          value,
          context,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        });

        await this.resultRepository.save(revenueResult);
      }
    } catch (error) {
      this.logger.error(`Failed to track conversion: ${error.message}`);
    }
  }

  /**
   * Track custom event for an assignment
   * @param assignmentId Assignment ID
   * @param eventType Event type
   * @param value Value of the event
   * @param context Context of the event
   * @param metadata Additional metadata
   */
  async trackCustomEvent(
    assignmentId: string,
    eventType: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void> {
    try {
      // Get assignment
      const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
      }

      // Create result
      const result = this.resultRepository.create({
        variantId: assignment.variantId,
        userId: assignment.userId,
        sessionId: assignment.sessionId,
        resultType: ResultType.CUSTOM,
        value,
        context: eventType,
        metadata: metadata
          ? JSON.stringify({
              ...metadata,
              eventType,
              customContext: context,
            })
          : JSON.stringify({ eventType, customContext: context }),
      });

      await this.resultRepository.save(result);
    } catch (error) {
      this.logger.error(`Failed to track custom event: ${error.message}`);
    }
  }

  /**
   * Get all assignments for a user/session
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getUserAssignments(
    userId?: string,
    sessionId?: string,
  ): Promise<UserExperimentAssignment[]> {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId must be provided');
      }

      const query: any = {};

      if (userId) {
        query.userId = userId;
      } else if (sessionId) {
        query.sessionId = sessionId;
      }

      return this.assignmentRepository.find({
        where: query,
        relations: ['experiment', 'variant'],
      });
    } catch (error) {
      this.logger.error(`Failed to get user assignments: ${error.message}`);
      throw error;
    }
  }
}
