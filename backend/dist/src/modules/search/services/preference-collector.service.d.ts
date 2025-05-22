import {
  UserPreferenceService,
  UserPreferences as _UserPreferences,
} from './user-preference.service';
import { PreferenceDecayService } from './preference-decay.service';
import { Product } from '../../products/entities/product.entity';
import { UserPreferencesSurveyInput } from '../dto/user-preferences-survey.dto';
export declare class PreferenceCollectorService {
  private readonly userPreferenceService;
  private readonly preferenceDecayService;
  private readonly logger;
  constructor(
    userPreferenceService: UserPreferenceService,
    preferenceDecayService: PreferenceDecayService,
  );
  trackSearch(
    userId: string,
    query: string,
    filters?: Record<string, any>,
    resultCount?: number,
  ): Promise<boolean>;
  trackProductView(userId: string, product: Product, referrer?: string): Promise<boolean>;
  trackAddToCart(userId: string, product: Product, quantity?: number): Promise<boolean>;
  trackPurchase(userId: string, product: Product, quantity?: number): Promise<boolean>;
  trackFilterApply(userId: string, filters: Record<string, any>): Promise<boolean>;
  trackCategoryClick(userId: string, category: string): Promise<boolean>;
  trackBrandClick(userId: string, brand: string): Promise<boolean>;
  processPreferencesSurvey(
    userId: string,
    surveyData: UserPreferencesSurveyInput,
  ): Promise<boolean>;
  private getPriceRangeWeightFromSensitivity;
  getUserPreferences(userId: string): Promise<_UserPreferences>;
  applyPreferenceDecay(userId: string): Promise<boolean>;
  applyImmediateDecay(
    userId: string,
    preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges',
    decayFactor?: number,
  ): Promise<boolean>;
}
