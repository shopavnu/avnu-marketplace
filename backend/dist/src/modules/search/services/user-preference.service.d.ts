import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
export interface UserPreferences {
    userId: string;
    categories: {
        [category: string]: number;
    };
    brands: {
        [brand: string]: number;
    };
    priceRanges: {
        min: number;
        max: number;
        weight: number;
    }[];
    values: {
        [value: string]: number;
    };
    recentSearches: {
        term: string;
        timestamp: number;
    }[];
    recentlyViewedProducts: {
        productId: string;
        timestamp: number;
    }[];
    purchaseHistory: {
        productId: string;
        timestamp: number;
    }[];
    lastUpdated: number;
    additionalData?: Record<string, any>;
}
export declare enum UserInteractionType {
    SEARCH = "search",
    VIEW_PRODUCT = "view_product",
    ADD_TO_CART = "add_to_cart",
    PURCHASE = "purchase",
    FILTER_APPLY = "filter_apply",
    SORT_APPLY = "sort_apply",
    CLICK_CATEGORY = "click_category",
    CLICK_BRAND = "click_brand",
    SEARCH_RESULT_IMPRESSION = "search_result_impression",
    SEARCH_RESULT_DWELL_TIME = "search_result_dwell_time"
}
export interface UserInteraction {
    userId: string;
    type: UserInteractionType;
    timestamp: number;
    sessionId?: string;
    sessionDuration?: number;
    data: Record<string, any>;
}
export declare class UserPreferenceService {
    private readonly configService;
    private readonly elasticsearchService;
    private readonly logger;
    private readonly preferencesCache;
    private readonly preferencesIndex;
    private readonly interactionsIndex;
    private readonly cacheTimeMs;
    constructor(configService: ConfigService, elasticsearchService: ElasticsearchService);
    private initializeIndices;
    private indexExists;
    private createPreferencesIndex;
    private createInteractionsIndex;
    getUserPreferences(userId: string): Promise<UserPreferences | null>;
    private createDefaultPreferences;
    saveUserPreferences(preferences: UserPreferences): Promise<boolean>;
    private userPreferencesExist;
    recordInteraction(interaction: UserInteraction): Promise<boolean>;
    private updatePreferencesFromInteraction;
    private updateFromSearch;
    private updateFromProductView;
    private updateFromPurchaseActivity;
    private updateFromFilterApply;
    private updateFromSearchResultDwellTime;
    private updateFromSearchResultImpression;
    private updateFromCategoryOrBrandClick;
    private updatePriceRangePreference;
    applyPreferencesToQuery(query: any, preferences: UserPreferences, preferenceWeight?: number): any;
    private getTopItems;
    clearCache(): void;
}
