import { ExperimentStatus, ExperimentType } from '../entities/experiment.entity';
import { CreateExperimentVariantDto } from './create-experiment-variant.dto';
export declare class CreateExperimentDto {
    name: string;
    description?: string;
    status?: ExperimentStatus;
    type: ExperimentType;
    targetAudience?: string;
    audiencePercentage?: number;
    startDate?: Date;
    endDate?: Date;
    hypothesis?: string;
    primaryMetric?: string;
    secondaryMetrics?: string[];
    segmentation?: string;
    variants: CreateExperimentVariantDto[];
}
