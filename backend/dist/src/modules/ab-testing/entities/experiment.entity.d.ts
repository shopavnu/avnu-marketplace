import { ExperimentVariant } from './experiment-variant.entity';
export declare enum ExperimentStatus {
    DRAFT = "draft",
    RUNNING = "running",
    PAUSED = "paused",
    COMPLETED = "completed",
    ARCHIVED = "archived"
}
export declare enum ExperimentType {
    SEARCH_ALGORITHM = "search_algorithm",
    UI_COMPONENT = "ui_component",
    PERSONALIZATION = "personalization",
    RECOMMENDATION = "recommendation",
    PRICING = "pricing",
    CONTENT = "content",
    FEATURE_FLAG = "feature_flag"
}
export declare class Experiment {
    id: string;
    name: string;
    description: string;
    status: ExperimentStatus;
    type: ExperimentType;
    targetAudience: string;
    audiencePercentage: number;
    startDate: Date;
    endDate: Date;
    hypothesis: string;
    primaryMetric: string;
    secondaryMetrics: string[];
    hasWinner: boolean;
    winningVariantId: string;
    segmentation: string;
    variants: ExperimentVariant[];
    createdAt: Date;
    updatedAt: Date;
}
