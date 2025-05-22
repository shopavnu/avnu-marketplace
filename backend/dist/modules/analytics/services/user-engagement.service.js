'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var UserEngagementService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserEngagementService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const user_engagement_entity_1 = require('../entities/user-engagement.entity');
let UserEngagementService = (UserEngagementService_1 = class UserEngagementService {
  constructor(userEngagementRepository) {
    this.userEngagementRepository = userEngagementRepository;
    this.logger = new common_1.Logger(UserEngagementService_1.name);
  }
  async trackEngagement(data) {
    try {
      const userEngagement = this.userEngagementRepository.create(data);
      return this.userEngagementRepository.save(userEngagement);
    } catch (error) {
      this.logger.error(`Failed to track user engagement: ${error.message}`);
      throw error;
    }
  }
  async trackPageView(
    userId,
    sessionId,
    pagePath,
    referrer,
    deviceType,
    platform,
    userAgent,
    ipAddress,
  ) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.PAGE_VIEW,
      pagePath,
      referrer,
      deviceType,
      platform,
      userAgent,
      ipAddress,
    });
  }
  async trackProductView(userId, sessionId, productId, pagePath, referrer, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.PRODUCT_VIEW,
      entityId: productId,
      entityType: 'product',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }
  async trackCategoryView(userId, sessionId, categoryId, pagePath, referrer, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.CATEGORY_VIEW,
      entityId: categoryId,
      entityType: 'category',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }
  async trackBrandView(userId, sessionId, brandId, pagePath, referrer, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.BRAND_VIEW,
      entityId: brandId,
      entityType: 'brand',
      pagePath,
      referrer,
      deviceType,
      platform,
    });
  }
  async trackSearch(userId, sessionId, searchQuery, pagePath, referrer, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.SEARCH,
      entityId: searchQuery,
      entityType: 'search',
      pagePath,
      referrer,
      deviceType,
      platform,
      metadata: JSON.stringify({ query: searchQuery }),
    });
  }
  async trackAddToCart(userId, sessionId, productId, quantity, pagePath, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.ADD_TO_CART,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ quantity }),
    });
  }
  async trackRemoveFromCart(
    userId,
    sessionId,
    productId,
    quantity,
    pagePath,
    deviceType,
    platform,
  ) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.REMOVE_FROM_CART,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ quantity }),
    });
  }
  async trackCheckoutStart(
    userId,
    sessionId,
    cartItems,
    totalAmount,
    pagePath,
    deviceType,
    platform,
  ) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_START,
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ cartItems, totalAmount }),
    });
  }
  async trackCheckoutComplete(
    userId,
    sessionId,
    orderId,
    orderItems,
    totalAmount,
    pagePath,
    deviceType,
    platform,
  ) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_COMPLETE,
      entityId: orderId,
      entityType: 'order',
      pagePath,
      deviceType,
      platform,
      metadata: JSON.stringify({ orderItems, totalAmount }),
    });
  }
  async trackFavorite(userId, sessionId, productId, pagePath, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.FAVORITE,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
    });
  }
  async trackUnfavorite(userId, sessionId, productId, pagePath, deviceType, platform) {
    return this.trackEngagement({
      userId,
      sessionId,
      engagementType: user_engagement_entity_1.EngagementType.UNFAVORITE,
      entityId: productId,
      entityType: 'product',
      pagePath,
      deviceType,
      platform,
    });
  }
  async getUserEngagementByTimePeriod(period = 30, interval = 'day') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      let dateFormat;
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
  async getUserEngagementByType(period = 30) {
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
  async getTopViewedProducts(limit = 10, period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('engagement.entityId', 'productId')
        .addSelect('COUNT(*)', 'viewCount')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.engagementType = :type', {
          type: user_engagement_entity_1.EngagementType.PRODUCT_VIEW,
        })
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
  async getTopFavoritedProducts(limit = 10, period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const result = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('engagement.entityId', 'productId')
        .addSelect('COUNT(*)', 'favoriteCount')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.engagementType = :type', {
          type: user_engagement_entity_1.EngagementType.FAVORITE,
        })
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
  async getUserEngagementFunnel(period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const productViews = await this.userEngagementRepository.count({
        where: {
          engagementType: user_engagement_entity_1.EngagementType.PRODUCT_VIEW,
          timestamp: (0, typeorm_2.Between)(startDate, new Date()),
        },
      });
      const addToCarts = await this.userEngagementRepository.count({
        where: {
          engagementType: user_engagement_entity_1.EngagementType.ADD_TO_CART,
          timestamp: (0, typeorm_2.Between)(startDate, new Date()),
        },
      });
      const checkoutStarts = await this.userEngagementRepository.count({
        where: {
          engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_START,
          timestamp: (0, typeorm_2.Between)(startDate, new Date()),
        },
      });
      const checkoutCompletions = await this.userEngagementRepository.count({
        where: {
          engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_COMPLETE,
          timestamp: (0, typeorm_2.Between)(startDate, new Date()),
        },
      });
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
  async getUserRetentionMetrics(period = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const uniqueUsersResult = await this.userEngagementRepository
        .createQueryBuilder('engagement')
        .select('COUNT(DISTINCT engagement.userId)', 'uniqueUsers')
        .where('engagement.timestamp >= :startDate', { startDate })
        .andWhere('engagement.userId IS NOT NULL')
        .getRawOne();
      const uniqueUsers = parseInt(uniqueUsersResult?.uniqueUsers || '0');
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
      const newUsers = uniqueUsers - returningUsers;
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
});
exports.UserEngagementService = UserEngagementService;
exports.UserEngagementService =
  UserEngagementService =
  UserEngagementService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(user_engagement_entity_1.UserEngagement)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      UserEngagementService,
    );
//# sourceMappingURL=user-engagement.service.js.map
