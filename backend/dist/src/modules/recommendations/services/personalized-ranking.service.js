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
var PersonalizedRankingService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PersonalizedRankingService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const product_entity_1 = require('../../products/entities/product.entity');
const user_preference_profile_service_1 = require('../../personalization/services/user-preference-profile.service');
let PersonalizedRankingService = (PersonalizedRankingService_1 = class PersonalizedRankingService {
  constructor(productRepository, userPreferenceProfileService) {
    this.productRepository = productRepository;
    this.userPreferenceProfileService = userPreferenceProfileService;
    this.logger = new common_1.Logger(PersonalizedRankingService_1.name);
  }
  async getPersonalizedRecommendations(
    userId,
    limit = 10,
    excludePurchased = true,
    freshness = 0.7,
  ) {
    try {
      const profile = await this.userPreferenceProfileService.getUserPreferenceProfile(userId);
      if (!profile || !profile.hasEnoughData) {
        this.logger.log(`Not enough data for personalized recommendations for user ${userId}`);
        return this.getTrendingProducts(limit);
      }
      const _topCategories = profile.topViewedCategories || [];
      const _topBrands = profile.topViewedBrands || [];
      const query = this.productRepository.createQueryBuilder('product');
      if (profile.topViewedCategories && profile.topViewedCategories.length > 0) {
        query.andWhere('product.categories && ARRAY[:...categories]', {
          categories: profile.topViewedCategories,
        });
      }
      if (profile.topViewedBrands && profile.topViewedBrands.length > 0) {
        query.orWhere('product.brandName IN (:...brands)', {
          brands: profile.topViewedBrands,
        });
      }
      if (excludePurchased) {
        if (profile.productPreferences) {
          const frequentlyViewedProductIds = Object.entries(profile.productPreferences)
            .filter(([_, count]) => count > 3)
            .map(([id]) => id);
          if (frequentlyViewedProductIds.length > 0) {
            query.andWhere('product.id NOT IN (:...excludedIds)', {
              excludedIds: frequentlyViewedProductIds,
            });
          }
        }
      }
      query.orderBy('RANDOM()');
      query.take(Math.ceil(limit * (1 - freshness)));
      const preferenceBasedProducts = await query.getMany();
      if (preferenceBasedProducts.length < limit) {
        const remainingCount = limit - preferenceBasedProducts.length;
        const trendingProducts = await this.getTrendingProducts(remainingCount);
        return [...preferenceBasedProducts, ...trendingProducts];
      }
      return preferenceBasedProducts;
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      return this.getTrendingProducts(limit);
    }
  }
  async getTrendingProducts(limit = 10) {
    try {
      return this.productRepository
        .createQueryBuilder('product')
        .orderBy('RANDOM()')
        .take(limit)
        .getMany();
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      return [];
    }
  }
});
exports.PersonalizedRankingService = PersonalizedRankingService;
exports.PersonalizedRankingService =
  PersonalizedRankingService =
  PersonalizedRankingService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          user_preference_profile_service_1.UserPreferenceProfileService,
        ]),
      ],
      PersonalizedRankingService,
    );
//# sourceMappingURL=personalized-ranking.service.js.map
