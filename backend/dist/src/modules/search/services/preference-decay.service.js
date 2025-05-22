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
var PreferenceDecayService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PreferenceDecayService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const user_preference_service_1 = require('./user-preference.service');
const schedule_1 = require('@nestjs/schedule');
let PreferenceDecayService = (PreferenceDecayService_1 = class PreferenceDecayService {
  constructor(configService, elasticsearchService, userPreferenceService) {
    this.configService = configService;
    this.elasticsearchService = elasticsearchService;
    this.userPreferenceService = userPreferenceService;
    this.logger = new common_1.Logger(PreferenceDecayService_1.name);
    this.preferencesIndex = this.configService.get(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.decayEnabled = this.configService.get('PREFERENCE_DECAY_ENABLED', true);
    this.halfLifeDays = {
      categories: this.configService.get('PREFERENCE_DECAY_HALFLIFE_CATEGORIES', 30),
      brands: this.configService.get('PREFERENCE_DECAY_HALFLIFE_BRANDS', 45),
      values: this.configService.get('PREFERENCE_DECAY_HALFLIFE_VALUES', 60),
      priceRanges: this.configService.get('PREFERENCE_DECAY_HALFLIFE_PRICERANGES', 90),
    };
    const msInDay = 24 * 60 * 60 * 1000;
    this.decayRates = {
      categories: Math.log(2) / (this.halfLifeDays.categories * msInDay),
      brands: Math.log(2) / (this.halfLifeDays.brands * msInDay),
      values: Math.log(2) / (this.halfLifeDays.values * msInDay),
      priceRanges: Math.log(2) / (this.halfLifeDays.priceRanges * msInDay),
    };
    this.maxPreferenceAge = this.configService.get('PREFERENCE_MAX_AGE_DAYS', 365);
    this.batchSize = this.configService.get('PREFERENCE_DECAY_BATCH_SIZE', 100);
    this.logger.log(
      `Preference decay service initialized with decay ${this.decayEnabled ? 'enabled' : 'disabled'}`,
    );
    if (this.decayEnabled) {
      this.logger.log(
        `Half-life days: Categories=${this.halfLifeDays.categories}, Brands=${this.halfLifeDays.brands}, Values=${this.halfLifeDays.values}, PriceRanges=${this.halfLifeDays.priceRanges}`,
      );
    }
  }
  async applyDecayToUser(userId) {
    if (!this.decayEnabled) {
      return false;
    }
    try {
      const preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        return false;
      }
      const decayedPreferences = this.calculateDecayedPreferences(preferences);
      await this.userPreferenceService.saveUserPreferences(decayedPreferences);
      return true;
    } catch (error) {
      this.logger.error(`Error applying decay to user ${userId}: ${error.message}`);
      return false;
    }
  }
  calculateDecayedPreferences(preferences) {
    const now = Date.now();
    const maxAgeMs = this.maxPreferenceAge * 24 * 60 * 60 * 1000;
    const decayedPreferences = JSON.parse(JSON.stringify(preferences));
    decayedPreferences.categories = this.applyDecayToMap(
      preferences.categories,
      this.decayRates.categories,
      now,
      maxAgeMs,
    );
    decayedPreferences.brands = this.applyDecayToMap(
      preferences.brands,
      this.decayRates.brands,
      now,
      maxAgeMs,
    );
    decayedPreferences.values = this.applyDecayToMap(
      preferences.values,
      this.decayRates.values,
      now,
      maxAgeMs,
    );
    decayedPreferences.priceRanges = this.applyDecayToPriceRanges(
      preferences.priceRanges,
      this.decayRates.priceRanges,
      now,
      maxAgeMs,
    );
    decayedPreferences.recentSearches = this.filterRecentItems(
      preferences.recentSearches,
      now,
      maxAgeMs,
    );
    decayedPreferences.recentlyViewedProducts = this.filterRecentItems(
      preferences.recentlyViewedProducts,
      now,
      maxAgeMs,
    );
    decayedPreferences.purchaseHistory = this.filterRecentItems(
      preferences.purchaseHistory,
      now,
      maxAgeMs,
      this.decayRates.brands / 2,
    );
    decayedPreferences.lastUpdated = now;
    if (!decayedPreferences.additionalData) {
      decayedPreferences.additionalData = {};
    }
    decayedPreferences.additionalData.lastDecay = {
      timestamp: now,
      decayRates: this.decayRates,
    };
    return decayedPreferences;
  }
  applyDecayToMap(map, decayRate, now, maxAgeMs) {
    const result = {};
    const _cutoffTime = now - maxAgeMs;
    const lastDecayTime = now - 24 * 60 * 60 * 1000;
    const timeSinceLastDecay = now - lastDecayTime;
    const decayFactor = Math.exp(-decayRate * timeSinceLastDecay);
    for (const [key, value] of Object.entries(map)) {
      const decayedValue = value * decayFactor;
      if (decayedValue >= 0.1) {
        result[key] = decayedValue;
      }
    }
    return result;
  }
  applyDecayToPriceRanges(priceRanges, decayRate, now, maxAgeMs) {
    const result = [];
    const _cutoffTime = now - maxAgeMs;
    const lastDecayTime = now - 24 * 60 * 60 * 1000;
    const timeSinceLastDecay = now - lastDecayTime;
    const decayFactor = Math.exp(-decayRate * timeSinceLastDecay);
    for (const range of priceRanges) {
      const decayedWeight = range.weight * decayFactor;
      if (decayedWeight >= 0.1) {
        result.push({
          min: range.min,
          max: range.max,
          weight: decayedWeight,
        });
      }
    }
    return result;
  }
  filterRecentItems(items, now, maxAgeMs, _decayRate) {
    const cutoffTime = now - maxAgeMs;
    return items.filter(item => item.timestamp > cutoffTime);
  }
  async applyDecayToAllUsers() {
    if (!this.decayEnabled) {
      return;
    }
    try {
      this.logger.log('Starting scheduled preference decay for all users');
      let processedUsers = 0;
      let scrollId;
      const countResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });
      const totalUsers = countResult.count;
      this.logger.log(`Found ${totalUsers} users with preferences to process`);
      const initialResult = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        scroll: '1m',
        size: this.batchSize,
        body: {
          query: {
            match_all: {},
          },
          _source: ['userId'],
        },
      });
      scrollId = initialResult._scroll_id;
      let hits = initialResult.hits.hits;
      while (hits && hits.length > 0) {
        const userIds = hits.map(hit => hit._source.userId);
        await Promise.all(userIds.map(userId => this.applyDecayToUser(userId)));
        processedUsers += userIds.length;
        this.logger.log(
          `Processed ${processedUsers}/${totalUsers} users (${Math.round((processedUsers / totalUsers) * 100)}%)`,
        );
        if (scrollId) {
          const scrollResult = await this.elasticsearchService.scroll({
            scroll_id: scrollId,
            scroll: '1m',
          });
          scrollId = scrollResult._scroll_id;
          hits = scrollResult.hits.hits;
        } else {
          break;
        }
      }
      if (scrollId) {
        await this.elasticsearchService.clearScroll({
          scroll_id: scrollId,
        });
      }
      this.logger.log(`Completed preference decay for ${processedUsers} users`);
    } catch (error) {
      this.logger.error(`Error applying decay to all users: ${error.message}`);
    }
  }
  async applyImmediateDecay(userId, preferenceType, decayFactor) {
    if (!this.decayEnabled) {
      return false;
    }
    try {
      const preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        return false;
      }
      const decayedPreferences = JSON.parse(JSON.stringify(preferences));
      switch (preferenceType) {
        case 'categories':
          decayedPreferences.categories = this.applyImmediateDecayToMap(
            preferences.categories,
            decayFactor,
          );
          break;
        case 'brands':
          decayedPreferences.brands = this.applyImmediateDecayToMap(
            preferences.brands,
            decayFactor,
          );
          break;
        case 'values':
          decayedPreferences.values = this.applyImmediateDecayToMap(
            preferences.values,
            decayFactor,
          );
          break;
        case 'priceRanges':
          decayedPreferences.priceRanges = this.applyImmediateDecayToPriceRanges(
            preferences.priceRanges,
            decayFactor,
          );
          break;
      }
      decayedPreferences.lastUpdated = Date.now();
      await this.userPreferenceService.saveUserPreferences(decayedPreferences);
      return true;
    } catch (error) {
      this.logger.error(`Error applying immediate decay to user ${userId}: ${error.message}`);
      return false;
    }
  }
  applyImmediateDecayToMap(map, decayFactor) {
    const result = {};
    for (const [key, value] of Object.entries(map)) {
      const decayedValue = value * decayFactor;
      if (decayedValue >= 0.1) {
        result[key] = decayedValue;
      }
    }
    return result;
  }
  applyImmediateDecayToPriceRanges(priceRanges, decayFactor) {
    const result = [];
    for (const range of priceRanges) {
      const decayedWeight = range.weight * decayFactor;
      if (decayedWeight >= 0.1) {
        result.push({
          min: range.min,
          max: range.max,
          weight: decayedWeight,
        });
      }
    }
    return result;
  }
  getDecayRate(preferenceType) {
    return this.decayRates[preferenceType];
  }
  getHalfLifeDays(preferenceType) {
    return this.halfLifeDays[preferenceType];
  }
  isDecayEnabled() {
    return this.decayEnabled;
  }
});
exports.PreferenceDecayService = PreferenceDecayService;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  PreferenceDecayService.prototype,
  'applyDecayToAllUsers',
  null,
);
exports.PreferenceDecayService =
  PreferenceDecayService =
  PreferenceDecayService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          elasticsearch_1.ElasticsearchService,
          user_preference_service_1.UserPreferenceService,
        ]),
      ],
      PreferenceDecayService,
    );
//# sourceMappingURL=preference-decay.service.js.map
