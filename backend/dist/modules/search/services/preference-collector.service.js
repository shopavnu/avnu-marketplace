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
var PreferenceCollectorService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PreferenceCollectorService = void 0;
const common_1 = require('@nestjs/common');
const user_preference_service_1 = require('./user-preference.service');
const preference_decay_service_1 = require('./preference-decay.service');
const user_preferences_survey_dto_1 = require('../dto/user-preferences-survey.dto');
let PreferenceCollectorService = (PreferenceCollectorService_1 = class PreferenceCollectorService {
  constructor(userPreferenceService, preferenceDecayService) {
    this.userPreferenceService = userPreferenceService;
    this.preferenceDecayService = preferenceDecayService;
    this.logger = new common_1.Logger(PreferenceCollectorService_1.name);
  }
  async trackSearch(userId, query, filters, resultCount) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.SEARCH,
        timestamp: Date.now(),
        data: {
          query,
          filters,
          resultCount,
        },
      };
      this.logger.debug(`Tracking search interaction for user ${userId}: ${query}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track search for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackProductView(userId, product, referrer) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.VIEW_PRODUCT,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          referrer,
        },
      };
      this.logger.debug(`Tracking product view for user ${userId}: ${product.title}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track product view for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackAddToCart(userId, product, quantity = 1) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.ADD_TO_CART,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          quantity,
        },
      };
      this.logger.debug(`Tracking add to cart for user ${userId}: ${product.title} (${quantity})`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track add to cart for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackPurchase(userId, product, quantity = 1) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.PURCHASE,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          quantity,
        },
      };
      this.logger.debug(`Tracking purchase for user ${userId}: ${product.title} (${quantity})`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track purchase for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackFilterApply(userId, filters) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.FILTER_APPLY,
        timestamp: Date.now(),
        data: {
          filters,
        },
      };
      this.logger.debug(`Tracking filter apply for user ${userId}: ${JSON.stringify(filters)}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track filter apply for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackCategoryClick(userId, category) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.CLICK_CATEGORY,
        timestamp: Date.now(),
        data: {
          category,
        },
      };
      this.logger.debug(`Tracking category click for user ${userId}: ${category}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track category click for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async trackBrandClick(userId, brand) {
    try {
      const interaction = {
        userId,
        type: user_preference_service_1.UserInteractionType.CLICK_BRAND,
        timestamp: Date.now(),
        data: {
          brand,
        },
      };
      this.logger.debug(`Tracking brand click for user ${userId}: ${brand}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track brand click for user ${userId}: ${error.message}`);
      return false;
    }
  }
  async processPreferencesSurvey(userId, surveyData) {
    try {
      this.logger.debug(`Processing preferences survey for user ${userId}`);
      let preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        preferences = {
          userId,
          categories: {},
          brands: {},
          priceRanges: [],
          values: {},
          recentSearches: [],
          recentlyViewedProducts: [],
          purchaseHistory: [],
          lastUpdated: Date.now(),
        };
      }
      surveyData.preferredCategories.forEach(category => {
        preferences.categories[category] = (preferences.categories[category] || 0) + 5;
      });
      surveyData.preferredBrands.forEach(brand => {
        preferences.brands[brand] = (preferences.brands[brand] || 0) + 5;
      });
      const priceRangeWeight = this.getPriceRangeWeightFromSensitivity(surveyData.priceSensitivity);
      preferences.priceRanges.push({
        min: surveyData.priceRangeMin,
        max: surveyData.priceRangeMax,
        weight: priceRangeWeight,
      });
      if (surveyData.preferredAttributes && surveyData.preferredAttributes.length > 0) {
        surveyData.preferredAttributes.forEach(attr => {
          preferences.values[attr] = (preferences.values[attr] || 0) + 3;
        });
      }
      if (!preferences.additionalData) {
        preferences.additionalData = {};
      }
      preferences.additionalData.shoppingFrequency = surveyData.shoppingFrequency;
      preferences.additionalData.priceSensitivity = surveyData.priceSensitivity;
      preferences.additionalData.reviewImportance = surveyData.reviewImportance;
      if (surveyData.additionalPreferences) {
        preferences.additionalData = {
          ...preferences.additionalData,
          ...surveyData.additionalPreferences,
        };
      }
      preferences.lastUpdated = Date.now();
      const result = await this.userPreferenceService.saveUserPreferences(preferences);
      this.logger.debug(
        `Preferences survey processed for user ${userId}: ${result ? 'success' : 'failed'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process preferences survey for user ${userId}: ${error.message}`,
      );
      return false;
    }
  }
  getPriceRangeWeightFromSensitivity(sensitivity) {
    switch (sensitivity) {
      case user_preferences_survey_dto_1.PriceSensitivity.BUDGET:
        return 5.0;
      case user_preferences_survey_dto_1.PriceSensitivity.VALUE:
        return 4.0;
      case user_preferences_survey_dto_1.PriceSensitivity.BALANCED:
        return 3.0;
      case user_preferences_survey_dto_1.PriceSensitivity.PREMIUM:
        return 2.0;
      case user_preferences_survey_dto_1.PriceSensitivity.LUXURY:
        return 1.5;
      default:
        return 3.0;
    }
  }
  async getUserPreferences(userId) {
    return this.userPreferenceService.getUserPreferences(userId);
  }
  async applyPreferenceDecay(userId) {
    return this.preferenceDecayService.applyDecayToUser(userId);
  }
  async applyImmediateDecay(userId, preferenceType, decayFactor = 0.5) {
    return this.preferenceDecayService.applyImmediateDecay(userId, preferenceType, decayFactor);
  }
});
exports.PreferenceCollectorService = PreferenceCollectorService;
exports.PreferenceCollectorService =
  PreferenceCollectorService =
  PreferenceCollectorService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          user_preference_service_1.UserPreferenceService,
          preference_decay_service_1.PreferenceDecayService,
        ]),
      ],
      PreferenceCollectorService,
    );
//# sourceMappingURL=preference-collector.service.js.map
