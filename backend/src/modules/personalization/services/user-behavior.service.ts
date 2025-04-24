import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior, BehaviorType } from '../entities/user-behavior.entity';

@Injectable()
export class UserBehaviorService {
  private readonly logger = new Logger(UserBehaviorService.name);

  constructor(
    @InjectRepository(UserBehavior)
    private readonly userBehaviorRepository: Repository<UserBehavior>,
  ) {}

  /**
   * Track user behavior
   * @param userId User ID
   * @param entityId Entity ID (product, category, brand, etc.)
   * @param entityType Entity type
   * @param behaviorType Behavior type
   * @param metadata Additional metadata
   */
  async trackBehavior(
    userId: string,
    entityId: string,
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search',
    behaviorType: BehaviorType,
    metadata?: string,
  ): Promise<UserBehavior> {
    try {
      // Check if behavior already exists
      let behavior = await this.userBehaviorRepository.findOne({
        where: {
          userId,
          entityId,
          entityType,
          behaviorType,
        },
      });

      const now = new Date();

      if (behavior) {
        // Update existing behavior
        behavior.count += 1;
        behavior.lastInteractionAt = now;

        if (metadata) {
          behavior.metadata = metadata;
        }

        return this.userBehaviorRepository.save(behavior);
      } else {
        // Create new behavior
        behavior = this.userBehaviorRepository.create({
          userId,
          entityId,
          entityType,
          behaviorType,
          count: 1,
          metadata,
          lastInteractionAt: now,
        });

        return this.userBehaviorRepository.save(behavior);
      }
    } catch (error) {
      this.logger.error(`Failed to track behavior: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track product view
   * @param userId User ID
   * @param productId Product ID
   * @param metadata Additional metadata
   */
  async trackProductView(
    userId: string,
    productId: string,
    metadata?: string,
  ): Promise<UserBehavior> {
    return this.trackBehavior(userId, productId, 'product', BehaviorType.VIEW, metadata);
  }

  /**
   * Track product favorite
   * @param userId User ID
   * @param productId Product ID
   */
  async trackProductFavorite(userId: string, productId: string): Promise<UserBehavior> {
    return this.trackBehavior(userId, productId, 'product', BehaviorType.FAVORITE);
  }

  /**
   * Track add to cart
   * @param userId User ID
   * @param productId Product ID
   * @param metadata Additional metadata (e.g., quantity)
   */
  async trackAddToCart(
    userId: string,
    productId: string,
    metadata?: string,
  ): Promise<UserBehavior> {
    return this.trackBehavior(userId, productId, 'product', BehaviorType.ADD_TO_CART, metadata);
  }

  /**
   * Track purchase
   * @param userId User ID
   * @param productId Product ID
   * @param metadata Additional metadata (e.g., quantity, price)
   */
  async trackPurchase(userId: string, productId: string, metadata?: string): Promise<UserBehavior> {
    return this.trackBehavior(userId, productId, 'product', BehaviorType.PURCHASE, metadata);
  }

  /**
   * Track search
   * @param userId User ID
   * @param searchQuery Search query
   */
  async trackSearch(userId: string, searchQuery: string): Promise<UserBehavior> {
    return this.trackBehavior(userId, searchQuery, 'search', BehaviorType.SEARCH, searchQuery);
  }

  /**
   * Get user behaviors by type
   * @param userId User ID
   * @param behaviorType Behavior type
   * @param limit Limit
   */
  async getUserBehaviorsByType(
    userId: string,
    behaviorType: BehaviorType,
    limit = 10,
  ): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        behaviorType,
      },
      order: {
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get user behaviors by entity type
   * @param userId User ID
   * @param entityType Entity type
   * @param limit Limit
   */
  async getUserBehaviorsByEntityType(
    userId: string,
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search',
    limit = 10,
  ): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        entityType,
      },
      order: {
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get most viewed products by user
   * @param userId User ID
   * @param limit Limit
   */
  async getMostViewedProducts(userId: string, limit = 10): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        entityType: 'product',
        behaviorType: BehaviorType.VIEW,
      },
      order: {
        count: 'DESC',
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get most searched queries by user
   * @param userId User ID
   * @param limit Limit
   */
  async getMostSearchedQueries(userId: string, limit = 10): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        entityType: 'search',
        behaviorType: BehaviorType.SEARCH,
      },
      order: {
        count: 'DESC',
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get favorite products by user
   * @param userId User ID
   * @param limit Limit
   */
  async getFavoriteProducts(userId: string, limit = 10): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        entityType: 'product',
        behaviorType: BehaviorType.FAVORITE,
      },
      order: {
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get purchase history by user
   * @param userId User ID
   * @param limit Limit
   */
  async getPurchaseHistory(userId: string, limit = 10): Promise<UserBehavior[]> {
    return this.userBehaviorRepository.find({
      where: {
        userId,
        entityType: 'product',
        behaviorType: BehaviorType.PURCHASE,
      },
      order: {
        lastInteractionAt: 'DESC',
      },
      take: limit,
    });
  }
}
