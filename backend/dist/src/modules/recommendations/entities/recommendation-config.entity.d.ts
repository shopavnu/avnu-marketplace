export declare enum RecommendationAlgorithmType {
    CONTENT_BASED = "content_based",
    COLLABORATIVE_FILTERING = "collaborative_filtering",
    HYBRID = "hybrid",
    RULE_BASED = "rule_based",
    POPULARITY_BASED = "popularity_based",
    ATTRIBUTE_BASED = "attribute_based",
    EMBEDDING_BASED = "embedding_based",
    CUSTOM = "custom"
}
export declare class RecommendationConfig {
    id: string;
    name: string;
    description: string;
    algorithmType: RecommendationAlgorithmType;
    isActive: boolean;
    version: number;
    parameters: Record<string, any>;
    supportedRecommendationTypes: string[];
    defaultLimit: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    experimentId: string;
    createdAt: Date;
    updatedAt: Date;
}
