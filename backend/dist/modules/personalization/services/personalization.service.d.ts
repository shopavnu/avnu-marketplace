import { UserPreferencesService } from './user-preferences.service';
import { UserBehaviorService } from './user-behavior.service';
import { BehaviorType } from '../entities/user-behavior.entity';
import { SessionService } from './session.service';
export declare class PersonalizationService {
    private readonly userPreferencesService;
    private readonly userBehaviorService;
    private readonly sessionService;
    private readonly logger;
    constructor(userPreferencesService: UserPreferencesService, userBehaviorService: UserBehaviorService, sessionService: SessionService);
    generatePersonalizedSearchParams(userId: string, baseQuery?: string, sessionId?: string): Promise<any>;
    generatePersonalizedFilters(userId: string): Promise<any>;
    generatePersonalizedBoosts(userId: string): Promise<any>;
    generatePersonalizedRecommendations(userId: string, limit?: number): Promise<string[]>;
    getPersonalizedSuggestions(query: string, userId: string, limit?: number, categories?: string[]): Promise<Array<{
        text: string;
        relevance: number;
        category?: string;
        type: string;
    }>>;
    enhanceSearchWithPersonalization(userId: string, searchQuery: string, searchParams?: any): Promise<any>;
    trackInteractionAndUpdatePreferences(userId: string, interactionType: BehaviorType, entityId: string, entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search', metadata?: string): Promise<void>;
}
