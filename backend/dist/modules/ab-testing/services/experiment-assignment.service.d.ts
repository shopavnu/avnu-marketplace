import { Repository } from 'typeorm';
import { Experiment } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult } from '../entities/experiment-result.entity';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';
export declare class ExperimentAssignmentService {
  private readonly experimentRepository;
  private readonly variantRepository;
  private readonly resultRepository;
  private readonly assignmentRepository;
  private readonly logger;
  constructor(
    experimentRepository: Repository<Experiment>,
    variantRepository: Repository<ExperimentVariant>,
    resultRepository: Repository<ExperimentResult>,
    assignmentRepository: Repository<UserExperimentAssignment>,
  );
  getOrCreateAssignment(
    experimentId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<UserExperimentAssignment>;
  getActiveExperiments(experimentType: string): Promise<Experiment[]>;
  getVariantConfiguration(
    experimentType: string,
    userId?: string,
    sessionId?: string,
  ): Promise<any>;
  trackImpression(assignmentId: string): Promise<void>;
  trackInteraction(assignmentId: string, context?: string, metadata?: any): Promise<void>;
  trackConversion(
    assignmentId: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void>;
  trackCustomEvent(
    assignmentId: string,
    eventType: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void>;
  getUserAssignments(userId?: string, sessionId?: string): Promise<UserExperimentAssignment[]>;
}
