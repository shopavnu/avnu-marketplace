import { Repository } from 'typeorm';
import { UserBehavior, BehaviorType } from '../entities/user-behavior.entity';
export declare class UserBehaviorService {
  private readonly userBehaviorRepository;
  private readonly logger;
  constructor(userBehaviorRepository: Repository<UserBehavior>);
  trackBehavior(
    userId: string,
    entityId: string,
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search',
    behaviorType: BehaviorType,
    metadata?: string,
  ): Promise<UserBehavior>;
  trackProductView(userId: string, productId: string, metadata?: string): Promise<UserBehavior>;
  trackProductFavorite(userId: string, productId: string): Promise<UserBehavior>;
  trackAddToCart(userId: string, productId: string, metadata?: string): Promise<UserBehavior>;
  trackPurchase(userId: string, productId: string, metadata?: string): Promise<UserBehavior>;
  trackSearch(userId: string, searchQuery: string): Promise<UserBehavior>;
  getUserBehaviorsByType(
    userId: string,
    behaviorType: BehaviorType,
    limit?: number,
  ): Promise<UserBehavior[]>;
  getUserBehaviorsByEntityType(
    userId: string,
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search',
    limit?: number,
  ): Promise<UserBehavior[]>;
  getMostViewedProducts(userId: string, limit?: number): Promise<UserBehavior[]>;
  getMostSearchedQueries(userId: string, limit?: number): Promise<UserBehavior[]>;
  getFavoriteProducts(userId: string, limit?: number): Promise<UserBehavior[]>;
  getPurchaseHistory(userId: string, limit?: number): Promise<UserBehavior[]>;
}
