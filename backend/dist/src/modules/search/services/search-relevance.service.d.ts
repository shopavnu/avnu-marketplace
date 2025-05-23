import { ConfigService } from '@nestjs/config';
import { UserPreferenceService, UserPreferences } from './user-preference.service';
import { CollaborativeFilteringService } from './collaborative-filtering.service';
import { PreferenceDecayService } from './preference-decay.service';
import { User } from '../../users/entities/user.entity';
export declare enum RelevanceAlgorithm {
    STANDARD = "standard",
    INTENT_BOOSTED = "intent",
    USER_PREFERENCE = "preference",
    HYBRID = "hybrid",
    SEMANTIC = "semantic"
}
export interface ScoringProfile {
    name: string;
    boostFactors: {
        [field: string]: number;
    };
    functions: Array<{
        type: 'field_value_factor' | 'decay' | 'script_score';
        field?: string;
        factor?: number;
        modifier?: 'none' | 'log' | 'log1p' | 'log2p' | 'ln' | 'ln1p' | 'ln2p' | 'square' | 'sqrt' | 'reciprocal';
        weight?: number;
        params?: Record<string, any>;
        script?: string;
    }>;
    scoreMode: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min';
    boostMode: 'multiply' | 'replace' | 'sum' | 'avg' | 'max' | 'min';
}
export interface ABTestConfig {
    id: string;
    name: string;
    description: string;
    variants: {
        id: string;
        algorithm: RelevanceAlgorithm;
        weight: number;
        params?: Record<string, any>;
    }[];
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    analyticsEventName: string;
}
export declare class SearchRelevanceService {
    private readonly configService;
    private readonly userPreferenceService;
    private readonly collaborativeFilteringService;
    private readonly preferenceDecayService;
    private readonly logger;
    private readonly scoringProfiles;
    private readonly activeABTests;
    private readonly userPreferencesCache;
    constructor(configService: ConfigService, userPreferenceService: UserPreferenceService, collaborativeFilteringService: CollaborativeFilteringService, preferenceDecayService: PreferenceDecayService);
    private initializeScoringProfiles;
    private loadActiveABTests;
    getUserPreferences(userId: string, sessionId?: string): Promise<UserPreferences | null>;
    private shouldApplyDecay;
    applyScoringProfile(query: any, profileName: string, user?: User, intent?: string, entities?: Array<{
        type: string;
        value: string;
        confidence: number;
    }>): any;
    private applyUserPreferenceBoosts;
    private addRelatedCategoryBoosts;
    private getTopItems;
    private applyIntentBasedBoosts;
    selectABTestVariant(testId: string, userId: string): {
        testId: string;
        variantId: string;
        algorithm: RelevanceAlgorithm;
        params?: Record<string, any>;
        analyticsEventName: string;
    } | null;
    generateAnalyticsData(testInfo: {
        testId: string;
        variantId: string;
        analyticsEventName: string;
    }, searchQuery: string, resultCount: number): Record<string, any>;
    private hashString;
    getScoringProfiles(): string[];
    getActiveABTests(): ABTestConfig[];
}
