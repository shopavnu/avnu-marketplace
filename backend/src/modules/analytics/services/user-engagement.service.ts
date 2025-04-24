import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserEngagement, EngagementType } from '../entities/user-engagement.entity';

@Injectable()
export class UserEngagementService {
  private readonly logger = new Logger(UserEngagementService.name);

  constructor(
    @InjectRepository(UserEngagement)
    private readonly userEngagementRepository: Repository<UserEngagement>,
  ) {}

  /**
   * Track user engagement
   * @param data User engagement data
   */
  async trackEngagement(data: Partial<UserEngagement>): Promise<UserEngagement> {
    try {
      const userEngagement = this.userEngagementRepository.create(data);
      return this.userEngagementRepository.save(userEngagement);
    } catch (error) {
      this.logger.error(`Failed to track user engagement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track page view
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param pagePath Page path
   * @param referrer Referrer
   * @param deviceType Device type
   * @param platform Platform
   * @param userAgent User agent
   * @param ipAddress IP address
   */
  async trackPageView(
    userId: string | null,
    sessionId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.PAGE_VIEW,
      pagePath,
      referrer,
      deviceType,
      platform,
      userAgent,
      ipAddress,
    });
  }

  /**
   * Track product view
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param productId Product ID
   * @param pagePath Page path
   * @param referrer Referrer
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackProductView(
    userId: string | null,
    sessionId: string,
    productId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.PRODUCT_VIEW,
      entityId: productId,
      entityType: 'product',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }

  /**
   * Track category view
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param categoryId Category ID
   * @param pagePath Page path
   * @param referrer Referrer
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackCategoryView(
    userId: string | null,
    sessionId: string,
    categoryId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.CATEGORY_VIEW,
      entityId: categoryId,
      entityType: 'category',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }

  /**
   * Track brand view
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param brandId Brand ID
   * @param pagePath Page path
   * @param referrer Referrer
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackBrandView(
    userId: string | null,
    sessionId: string,
    brandId: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.BRAND_VIEW,
      entityId: brandId,
      entityType: 'brand',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }

  /**
   * Track search
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param searchQuery Search query
   * @param pagePath Page path
   * @param referrer Referrer
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackSearch(
    userId: string | null,
    sessionId: string,
    searchQuery: string,
    pagePath: string,
    referrer?: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.SEARCH,
      entityId: searchQuery,
      entityType: 'search',
      pagePath,
      referrer,
      deviceType,
      platform,
      metadata: JSON.stringify({ query: searchQuery }),
    });
  }

  /**
   * Track add to cart
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param productId Product ID
   * @param quantity Quantity
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackAddToCart(
    userId: string | null,
    sessionId: string,
    productId: string,
    quantity: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.ADD_TO_CART,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ quantity }),
    });
  }

  /**
   * Track remove from cart
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param productId Product ID
   * @param quantity Quantity
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackRemoveFromCart(
    userId: string | null,
    sessionId: string,
    productId: string,
    quantity: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.REMOVE_FROM_CART,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ quantity }),
    });
  }

  /**
   * Track checkout start
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param cartItems Cart items
   * @param totalAmount Total amount
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackCheckoutStart(
    userId: string | null,
    sessionId: string,
    cartItems: any[],
    totalAmount: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.CHECKOUT_START,
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ cartItems, totalAmount }),
    });
  }

  /**
   * Track checkout complete
   * @param userId User ID (optional)
   * @param sessionId Session ID
   * @param orderId Order ID
   * @param orderItems Order items
   * @param totalAmount Total amount
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackCheckoutComplete(
    userId: string | null,
    sessionId: string,
    orderId: string,
    orderItems: any[],
    totalAmount: number,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.CHECKOUT_COMPLETE,
      entityId: orderId,
      entityType: 'order',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ orderItems, totalAmount }),
    });
  }

  /**
   * Track favorite
   * @param userId User ID
   * @param sessionId Session ID
   * @param productId Product ID
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackFavorite(
    userId: string,
    sessionId: string,
    productId: string,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.FAVORITE,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
    });
  }

  /**
   * Track unfavorite
   * @param userId User ID
   * @param sessionId Session ID
   * @param productId Product ID
   * @param pagePath Page path
   * @param deviceType Device type
   * @param platform Platform
   */
  async trackUnfavorite(
    userId: string,
    sessionId: string,
    productId: string,
    pagePath: string,
    deviceType?: string,
    platform?: string,
  ): Promise<UserEngagement> {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: EngagementType.UNFAVORITE,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
    });
  }

  /**
   * Get user engagement by time period
   * @param period Period in days
   * @param interval Interval (day, week, month)
   */
  async getUserEngagementByTimePeriod(
    period = 30,
    interval: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      let dateFormat: string;
      switch (interval) {
        case 'week':
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'day':
        default:
          dateFormat = 'YYYY-MM-DD';
          break;
      }

      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select(`TO_CHAR(engagement.timestamp, '${dateFormat}')`, 'period')
        .addSelect('engagement.engagementType', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('engagement.timestamp >= :startDate', { startDate })
        .groupBy('period')
        .addGroupBy('engagement.engagementType')
        .orderBy('period', 'ASC')
        .addOrderBy('type', 'ASC')
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get user engagement by time period: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user engagement by type
   * @param period Period in days
   */
  async getUserEngagementByType(period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('engagement.engagementType', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('engagement.timestamp >= :startDate', { startDate })
        .groupBy('engagement.engagementType')
        .orderBy('count', 'DESC')
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get user engagement by type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top viewed products
   * @param limit Limit
   * @param period Period in days
   */
  async getTopViewedProducts(limit = 10, period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('engagement.entityId', 'productId')
        .addSelect('COUNT(*)', 'viewCount')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.engagementType = :type', { type: EngagementType.PRODUCT_VIEW })
        .groupBy('engagement.entityId')
        .orderBy('viewCount', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get top viewed products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top favorited products
   * @param limit Limit
   * @param period Period in days
   */
  async getTopFavoritedProducts(limit = 10, period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('engagement.entityId', 'productId')
        .addSelect('COUNT(*)', 'favoriteCount')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.engagementType = :type', { type: EngagementType.FAVORITE })
        .groupBy('engagement.entityId')
        .orderBy('favoriteCount', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get top favorited products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user engagement funnel
   * @param period Period in days
   */
  async getUserEngagementFunnel(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get counts for each stage of the funnel
      const productViews = await this.userEngagementRepository.count({
        where: {
          engagementType: EngagementType.PRODUCT_VIEW,
          timestamp: Between(startDate, new Date()),
        },
      });

      const addToCarts = await this.userEngagementRepository.count({
        where: {
          engagementType: EngagementType.ADD_TO_CART,
          timestamp: Between(startDate, new Date()),
        },
      });

      const checkoutStarts = await this.userEngagementRepository.count({
        where: {
          engagementType: EngagementType.CHECKOUT_START,
          timestamp: Between(startDate, new Date()),
        },
      });

      const checkoutCompletions = await this.userEngagementRepository.count({
        where: {
          engagementType: EngagementType.CHECKOUT_COMPLETE,
          timestamp: Between(startDate, new Date()),
        },
      });

      // Calculate conversion rates
      const addToCartRate = productViews > 0 ? addToCarts / productViews : 0;
      const checkoutStartRate = addToCarts > 0 ? checkoutStarts / addToCarts : 0;
      const checkoutCompletionRate = checkoutStarts > 0 ? checkoutCompletions / checkoutStarts : 0;
      const overallConversionRate = productViews > 0 ? checkoutCompletions / productViews : 0;

      return {
        stages: {
          productViews,
          addToCarts,
          checkoutStarts,
          checkoutCompletions,
        },
        conversionRates: {
          addToCartRate,
          checkoutStartRate,
          checkoutCompletionRate,
          overallConversionRate,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get user engagement funnel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user retention metrics
   * @param period Period in days
   */
  async getUserRetentionMetrics(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get unique users in the period
      const uniqueUsersResult = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('COUNT(DISTINCT engagement.userId)', 'uniqueUsers')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.userId IS NOT NULL')
        .getRawOne();

      const uniqueUsers = parseInt(uniqueUsersResult?.uniqueUsers || '0');

      // Get returning users (users who had activity before the period and during the period)
      const returningUsersResult = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('COUNT(DISTINCT engagement.userId)', 'returningUsers')
        .where(
          'engagement.userId IN ' +
            '(SELECT DISTINCT userId FROM user_engagement ' +
            'WHERE timestamp < :startDate AND userId IS NOT NULL)',
        )
        .andWhere('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.userId IS NOT NULL')
        .getRawOne();

      const returningUsers = parseInt(returningUsersResult?.returningUsers || '0');

      // Get new users (users who had their first activity during the period)
      const newUsers = uniqueUsers - returningUsers;

      // Calculate retention rate
      const retentionRate = uniqueUsers > 0 ? returningUsers / uniqueUsers : 0;

      return {
        uniqueUsers,
        newUsers,
        returningUsers,
        retentionRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get user retention metrics: ${error.message}`);
      throw error;
    }
  }
}
