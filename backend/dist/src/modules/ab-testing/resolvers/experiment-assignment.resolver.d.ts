import { AbTestingService } from '../services/ab-testing.service';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';
import { ExperimentType } from '../entities/experiment.entity';
export declare class ExperimentAssignmentResolver {
    private readonly abTestingService;
    constructor(abTestingService: AbTestingService);
    getSearchExperiments(context: any): Promise<any>;
    getPersonalizationExperiments(context: any): Promise<any>;
    getRecommendationExperiments(context: any): Promise<any>;
    getUiExperiments(context: any): Promise<any>;
    getExperimentVariants(experimentType: ExperimentType, context: any): Promise<any>;
    trackImpression(assignmentId: string): Promise<boolean>;
    trackInteraction(assignmentId: string, context?: string, metadata?: string): Promise<boolean>;
    trackConversion(assignmentId: string, value?: number, context?: string, metadata?: string): Promise<boolean>;
    trackCustomEvent(assignmentId: string, eventType: string, value?: number, context?: string, metadata?: string): Promise<boolean>;
    getUserAssignments(context: any): Promise<UserExperimentAssignment[]>;
}
