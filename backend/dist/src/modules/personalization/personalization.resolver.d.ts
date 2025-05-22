import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
export declare class PersonalizationResolver {
  private readonly personalizationService;
  private readonly userPreferencesService;
  private readonly userBehaviorService;
  constructor(
    personalizationService: PersonalizationService,
    userPreferencesService: UserPreferencesService,
    userBehaviorService: UserBehaviorService,
  );
  createUserPreferences(
    createUserPreferencesDto: CreateUserPreferencesDto,
    context: any,
  ): Promise<UserPreferences>;
  getUserPreferences(context: any): Promise<UserPreferences>;
  updateUserPreferences(
    updateUserPreferencesDto: UpdateUserPreferencesDto,
    context: any,
  ): Promise<UserPreferences>;
  trackEntityView(
    entityType: 'product' | 'category' | 'brand' | 'merchant',
    entityId: string,
    context: any,
  ): Promise<boolean>;
  trackEntityFavorite(
    entityType: 'product' | 'category' | 'brand' | 'merchant',
    entityId: string,
    context: any,
  ): Promise<boolean>;
  trackSearch(query: string, context: any): Promise<boolean>;
  trackAddToCart(context: any, productId: string, quantity?: number): Promise<boolean>;
  trackPurchase(
    context: any,
    productId: string,
    quantity?: number,
    price?: number,
  ): Promise<boolean>;
  getPersonalizedRecommendations(context: any, limit?: number): Promise<string[]>;
  getMostViewedProducts(context: any): Promise<UserBehavior[]>;
  getFavoriteProducts(context: any): Promise<UserBehavior[]>;
  getRecentSearches(context: any): Promise<UserBehavior[]>;
}
