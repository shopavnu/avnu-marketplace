import { User } from '../../users/entities/user.entity';
import { PreferenceCollectorService } from '../services/preference-collector.service';
import { UserPreferenceService } from '../services/user-preference.service';
import { ProductsService } from '../../products/products.service';
import { UserPreferencesSurveyInput } from '../dto/user-preferences-survey.dto';
import { SearchFiltersInput } from '../dto/search-filters.input';
declare enum PreferenceType {
    CATEGORIES = "categories",
    BRANDS = "brands",
    VALUES = "values",
    PRICE_RANGES = "priceRanges"
}
export declare class UserPreferenceResolver {
    private readonly preferenceCollectorService;
    private readonly userPreferenceService;
    private readonly productsService;
    constructor(preferenceCollectorService: PreferenceCollectorService, userPreferenceService: UserPreferenceService, productsService: ProductsService);
    trackSearch(user: User, query: string, filters?: SearchFiltersInput, resultCount?: number): Promise<boolean>;
    trackProductView(user: User, productId: string, referrer?: string): Promise<boolean>;
    trackAddToCart(user: User, productId: string, quantity: number): Promise<boolean>;
    trackPurchase(user: User, productId: string, quantity: number): Promise<boolean>;
    trackFilterApply(user: User, filters: SearchFiltersInput): Promise<boolean>;
    trackCategoryClick(user: User, category: string): Promise<boolean>;
    trackBrandClick(user: User, brand: string): Promise<boolean>;
    submitPreferencesSurvey(user: User, surveyData: UserPreferencesSurveyInput): Promise<boolean>;
    clearPreferencesCache(): Promise<boolean>;
    applyPreferenceDecay(user: User): Promise<boolean>;
    applyImmediateDecay(user: User, preferenceType: PreferenceType, decayFactor: number): Promise<boolean>;
}
export {};
