import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
export declare class PersonalizationController {
    private readonly personalizationService;
    private readonly userPreferencesService;
    private readonly userBehaviorService;
    constructor(personalizationService: PersonalizationService, userPreferencesService: UserPreferencesService, userBehaviorService: UserBehaviorService);
    createPreferences(req: any, createUserPreferencesDto: CreateUserPreferencesDto): Promise<import("./entities/user-preferences.entity").UserPreferences>;
    getPreferences(req: any): Promise<import("./entities/user-preferences.entity").UserPreferences>;
    updatePreferences(req: any, updateUserPreferencesDto: UpdateUserPreferencesDto): Promise<import("./entities/user-preferences.entity").UserPreferences>;
    trackView(req: any, entityType: 'product' | 'category' | 'brand' | 'merchant', entityId: string): Promise<{
        success: boolean;
    }>;
    trackFavorite(req: any, entityType: 'product' | 'category' | 'brand' | 'merchant', entityId: string): Promise<{
        success: boolean;
    }>;
    trackSearch(req: any, body: {
        query: string;
    }): Promise<{
        success: boolean;
    }>;
    trackAddToCart(req: any, productId: string, body: {
        quantity?: number;
    }): Promise<{
        success: boolean;
    }>;
    trackPurchase(req: any, productId: string, body: {
        quantity?: number;
        price?: number;
    }): Promise<{
        success: boolean;
    }>;
    getRecommendations(req: any): Promise<{
        productIds: string[];
    }>;
    enhanceSearch(req: any, body: {
        query: string;
        params?: any;
    }): Promise<any>;
    getMostViewedProducts(req: any): Promise<import("./entities/user-behavior.entity").UserBehavior[]>;
    getFavoriteProducts(req: any): Promise<import("./entities/user-behavior.entity").UserBehavior[]>;
    getRecentSearches(req: any): Promise<import("./entities/user-behavior.entity").UserBehavior[]>;
}
