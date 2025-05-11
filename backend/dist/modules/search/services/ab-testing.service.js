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
var ABTestingService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ABTestingService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const search_relevance_service_1 = require('./search-relevance.service');
const google_analytics_service_1 = require('../../analytics/services/google-analytics.service');
let ABTestingService = (ABTestingService_1 = class ABTestingService {
  constructor(configService, googleAnalyticsService) {
    this.configService = configService;
    this.googleAnalyticsService = googleAnalyticsService;
    this.logger = new common_1.Logger(ABTestingService_1.name);
    this.activeTests = new Map();
    this.userAssignments = new Map();
    this.initializeActiveTests();
  }
  initializeActiveTests() {
    const currentDate = new Date();
    const basicVsIntent = {
      id: 'search-relevance-test-001',
      name: 'Basic vs. Intent-Based Relevance',
      description: 'Testing standard BM25 algorithm against intent-based boosting',
      variants: [
        {
          id: 'control',
          algorithm: search_relevance_service_1.RelevanceAlgorithm.STANDARD,
          weight: 50,
        },
        {
          id: 'intent-boosted',
          algorithm: search_relevance_service_1.RelevanceAlgorithm.INTENT_BOOSTED,
          weight: 50,
        },
      ],
      startDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      analyticsEventName: 'search_relevance_test_001',
    };
    const userPreferenceTest = {
      id: 'user-preference-test-001',
      name: 'User Preference Boosting',
      description: 'Testing effectiveness of user preference-based boosting',
      variants: [
        {
          id: 'control',
          algorithm: search_relevance_service_1.RelevanceAlgorithm.STANDARD,
          weight: 33,
        },
        {
          id: 'preference-light',
          algorithm: search_relevance_service_1.RelevanceAlgorithm.USER_PREFERENCE,
          weight: 33,
          params: {
            preferenceWeight: 0.5,
          },
        },
        {
          id: 'preference-heavy',
          algorithm: search_relevance_service_1.RelevanceAlgorithm.USER_PREFERENCE,
          weight: 34,
          params: {
            preferenceWeight: 1.5,
          },
        },
      ],
      startDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() + 27 * 24 * 60 * 60 * 1000),
      isActive: true,
      analyticsEventName: 'user_preference_test_001',
    };
    this.activeTests.set(basicVsIntent.id, basicVsIntent);
    this.activeTests.set(userPreferenceTest.id, userPreferenceTest);
    this.logger.log(`Initialized ${this.activeTests.size} active A/B tests`);
  }
  getActiveTests() {
    return Array.from(this.activeTests.values()).filter(
      test =>
        test.isActive &&
        test.startDate <= new Date() &&
        (!test.endDate || test.endDate >= new Date()),
    );
  }
  getTestById(testId) {
    return this.activeTests.get(testId);
  }
  assignUserToVariant(testId, userId, clientId) {
    const test = this.activeTests.get(testId);
    if (!test || !test.isActive) {
      return null;
    }
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    const userTestAssignments = this.userAssignments.get(userId);
    if (userTestAssignments.has(testId)) {
      const variantId = userTestAssignments.get(testId);
      const variant = test.variants.find(v => v.id === variantId);
      if (variant) {
        return {
          variantId: variant.id,
          algorithm: variant.algorithm,
          params: variant.params,
        };
      }
    }
    const variant = this.selectVariantByWeight(test.variants);
    userTestAssignments.set(testId, variant.id);
    this.trackVariantAssignment(clientId, test, variant.id, userId);
    return {
      variantId: variant.id,
      algorithm: variant.algorithm,
      params: variant.params,
    };
  }
  selectVariantByWeight(variants) {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    let randomValue = Math.random() * totalWeight;
    for (const variant of variants) {
      randomValue -= variant.weight;
      if (randomValue <= 0) {
        return variant;
      }
    }
    return variants[0];
  }
  async trackVariantAssignment(clientId, test, variantId, userId) {
    try {
      await this.googleAnalyticsService.trackABTestImpression(
        clientId,
        test.id,
        variantId,
        {
          test_name: test.name,
          test_type: 'search_relevance',
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track variant assignment: ${error.message}`);
    }
  }
  async trackSearchResults(clientId, testId, variantId, searchTerm, resultCount, userId) {
    const test = this.activeTests.get(testId);
    if (!test) return;
    try {
      await this.googleAnalyticsService.trackSearch(
        clientId,
        searchTerm,
        resultCount,
        {
          testId,
          variantId,
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track search results: ${error.message}`);
    }
  }
  async trackSearchClick(clientId, testId, variantId, searchTerm, productId, position, userId) {
    const test = this.activeTests.get(testId);
    if (!test) return;
    try {
      await this.googleAnalyticsService.trackSearchClick(
        clientId,
        searchTerm,
        productId,
        position,
        {
          testId,
          variantId,
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track search click: ${error.message}`);
    }
  }
  async getTestMetrics(testId) {
    const test = this.activeTests.get(testId);
    if (!test) return null;
    try {
      const variantMetrics = test.variants.map(variant => {
        const searches = Math.floor(Math.random() * 1000) + 500;
        const clicks = Math.floor(searches * (Math.random() * 0.3 + 0.1));
        const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.05));
        return {
          variantId: variant.id,
          algorithm: variant.algorithm,
          metrics: {
            searches,
            clicks,
            conversions,
            clickThroughRate: clicks / searches,
            conversionRate: conversions / searches,
          },
        };
      });
      const controlVariant = variantMetrics.find(v => v.variantId === 'control');
      const variantsWithImprovements = variantMetrics.map(variant => {
        if (variant.variantId === 'control') {
          return {
            ...variant,
            improvements: {
              clickThroughRate: 0,
              conversionRate: 0,
            },
            isSignificant: false,
          };
        }
        const clickThroughImprovement =
          ((variant.metrics.clickThroughRate - controlVariant.metrics.clickThroughRate) /
            controlVariant.metrics.clickThroughRate) *
          100;
        const conversionImprovement =
          ((variant.metrics.conversionRate - controlVariant.metrics.conversionRate) /
            controlVariant.metrics.conversionRate) *
          100;
        const isSignificant =
          Math.abs(clickThroughImprovement) > 10 || Math.abs(conversionImprovement) > 15;
        return {
          ...variant,
          improvements: {
            clickThroughRate: clickThroughImprovement,
            conversionRate: conversionImprovement,
          },
          isSignificant,
        };
      });
      const totalSearches = variantMetrics.reduce((sum, v) => sum + v.metrics.searches, 0);
      const totalClicks = variantMetrics.reduce((sum, v) => sum + v.metrics.clicks, 0);
      const totalConversions = variantMetrics.reduce((sum, v) => sum + v.metrics.conversions, 0);
      const bestVariant = variantsWithImprovements
        .filter(v => v.variantId !== 'control')
        .sort((a, b) => b.improvements.conversionRate - a.improvements.conversionRate)[0];
      const hasSignificantResult = variantsWithImprovements.some(v => v.isSignificant);
      return {
        testId: test.id,
        testName: test.name,
        startDate: test.startDate,
        endDate: test.endDate,
        isActive: test.isActive,
        variants: variantsWithImprovements,
        overall: {
          searches: totalSearches,
          clicks: totalClicks,
          conversions: totalConversions,
          clickThroughRate: totalClicks / totalSearches,
          conversionRate: totalConversions / totalSearches,
        },
        bestVariant: bestVariant
          ? {
              variantId: bestVariant.variantId,
              algorithm: bestVariant.algorithm,
              improvement: bestVariant.improvements.conversionRate,
            }
          : null,
        hasSignificantResult,
        runningDays: Math.floor(
          (new Date().getTime() - test.startDate.getTime()) / (24 * 60 * 60 * 1000),
        ),
        remainingDays: test.endDate
          ? Math.floor((test.endDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
          : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get test metrics for ${testId}: ${error.message}`);
      return null;
    }
  }
});
exports.ABTestingService = ABTestingService;
exports.ABTestingService =
  ABTestingService =
  ABTestingService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          google_analytics_service_1.GoogleAnalyticsService,
        ]),
      ],
      ABTestingService,
    );
//# sourceMappingURL=ab-testing.service.js.map
