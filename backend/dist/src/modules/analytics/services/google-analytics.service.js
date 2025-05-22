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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var GoogleAnalyticsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.GoogleAnalyticsService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const axios_1 = __importDefault(require('axios'));
let GoogleAnalyticsService = (GoogleAnalyticsService_1 = class GoogleAnalyticsService {
  constructor(configService) {
    this.configService = configService;
    this.logger = new common_1.Logger(GoogleAnalyticsService_1.name);
    this.measurementId = this.configService.get('GOOGLE_ANALYTICS_MEASUREMENT_ID', '');
    this.apiSecret = this.configService.get('GOOGLE_ANALYTICS_API_SECRET', '');
    this.endpoint = 'https://www.google-analytics.com/mp/collect';
    this.isEnabled = !!this.measurementId && !!this.apiSecret;
    if (!this.isEnabled) {
      this.logger.warn('Google Analytics integration is disabled due to missing configuration');
    } else {
      this.logger.log('Google Analytics integration initialized');
    }
  }
  async sendEvent(clientId, event, userId) {
    if (!this.isEnabled) {
      this.logger.debug('Google Analytics event not sent - integration disabled');
      return false;
    }
    try {
      const url = `${this.endpoint}?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
      const payload = {
        client_id: clientId,
        user_id: userId,
        events: [
          {
            name: event.name,
            params: event.params,
          },
        ],
      };
      const response = await axios_1.default.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 204) {
        this.logger.debug(`Successfully sent event "${event.name}" to Google Analytics`);
        return true;
      } else {
        this.logger.warn(`Unexpected response from Google Analytics: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send event to Google Analytics: ${error.message}`);
      return false;
    }
  }
  async trackSearch(clientId, searchTerm, resultCount, testInfo, userId) {
    const params = {
      search_term: searchTerm,
      result_count: resultCount,
    };
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }
    return this.sendEvent(
      clientId,
      {
        name: 'search',
        params,
      },
      userId,
    );
  }
  async trackSearchClick(clientId, searchTerm, productId, position, testInfo, userId) {
    const params = {
      search_term: searchTerm,
      item_id: productId,
      position,
    };
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }
    return this.sendEvent(
      clientId,
      {
        name: 'search_click',
        params,
      },
      userId,
    );
  }
  async trackSearchRefinement(
    clientId,
    originalSearchTerm,
    refinedSearchTerm,
    filterApplied,
    testInfo,
    userId,
  ) {
    const params = {
      original_search_term: originalSearchTerm,
      refined_search_term: refinedSearchTerm,
      filter_applied: JSON.stringify(filterApplied),
    };
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }
    return this.sendEvent(
      clientId,
      {
        name: 'search_refinement',
        params,
      },
      userId,
    );
  }
  async trackABTestImpression(clientId, testId, variantId, context, userId) {
    return this.sendEvent(
      clientId,
      {
        name: 'ab_test_impression',
        params: {
          test_id: testId,
          variant_id: variantId,
          context: JSON.stringify(context),
        },
      },
      userId,
    );
  }
  generateClientId() {
    return 'GA1.1.' + Math.floor(Math.random() * 2147483647) + '.' + Math.floor(Date.now() / 1000);
  }
});
exports.GoogleAnalyticsService = GoogleAnalyticsService;
exports.GoogleAnalyticsService =
  GoogleAnalyticsService =
  GoogleAnalyticsService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      GoogleAnalyticsService,
    );
//# sourceMappingURL=google-analytics.service.js.map
