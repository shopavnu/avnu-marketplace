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
var AnonymousUserService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AnonymousUserService = void 0;
const common_1 = require('@nestjs/common');
const uuid_1 = require('uuid');
const config_1 = require('@nestjs/config');
const session_service_1 = require('./session.service');
const session_interaction_type_enum_1 = require('../enums/session-interaction-type.enum');
let AnonymousUserService = (AnonymousUserService_1 = class AnonymousUserService {
  constructor(configService, sessionService) {
    this.configService = configService;
    this.sessionService = sessionService;
    this.logger = new common_1.Logger(AnonymousUserService_1.name);
    this.cookieName = this.configService.get('ANONYMOUS_USER_COOKIE_NAME', 'avnu_anonymous_id');
    this.cookieMaxAge = this.configService.get(
      'ANONYMOUS_USER_COOKIE_MAX_AGE',
      30 * 24 * 60 * 60 * 1000,
    );
    this.cookieSecure = this.configService.get(
      'COOKIE_SECURE',
      process.env.NODE_ENV === 'production',
    );
    this.cookieSameSite = this.configService.get('COOKIE_SAME_SITE', 'lax');
    this.cookieDomain = this.configService.get('COOKIE_DOMAIN', '');
  }
  getOrCreateAnonymousId(req, res) {
    try {
      const existingId = req.cookies[this.cookieName];
      if (existingId) {
        return existingId;
      }
      const newId = (0, uuid_1.v4)();
      res.cookie(this.cookieName, newId, {
        maxAge: this.cookieMaxAge,
        httpOnly: true,
        secure: this.cookieSecure,
        sameSite: this.cookieSameSite,
        domain: this.cookieDomain || undefined,
        path: '/',
      });
      this.logger.debug(`Created new anonymous user ID: ${newId}`);
      return newId;
    } catch (error) {
      this.logger.error(`Failed to get or create anonymous ID: ${error.message}`);
      return `temp-${(0, uuid_1.v4)()}`;
    }
  }
  async trackInteraction(req, res, type, data, durationMs) {
    const anonymousId = this.getOrCreateAnonymousId(req, res);
    await this.sessionService.trackInteraction(anonymousId, type, data, durationMs);
  }
  async getPersonalizationWeights(req, res) {
    const anonymousId = this.getOrCreateAnonymousId(req, res);
    return this.sessionService.calculateSessionWeights(anonymousId);
  }
  async getRecentSearches(req, res, limit = 5) {
    const anonymousId = this.getOrCreateAnonymousId(req, res);
    const searchInteractions = await this.sessionService.getRecentInteractions(
      anonymousId,
      session_interaction_type_enum_1.SessionInteractionType.SEARCH,
      limit,
    );
    return searchInteractions.map(interaction => ({
      query: interaction.data.query,
      timestamp: interaction.timestamp,
      resultCount: interaction.data.resultCount,
    }));
  }
  async getRecentlyViewedProducts(req, res, limit = 10) {
    const anonymousId = this.getOrCreateAnonymousId(req, res);
    const viewInteractions = await this.sessionService.getRecentInteractions(
      anonymousId,
      session_interaction_type_enum_1.SessionInteractionType.PRODUCT_VIEW,
      limit,
    );
    return viewInteractions.map(interaction => ({
      productId: interaction.data.productId,
      timestamp: interaction.timestamp,
      viewTimeSeconds: (interaction.data.viewTimeMs || 0) / 1000,
    }));
  }
  async getPreferredCategories(req, res) {
    const weights = await this.getPersonalizationWeights(req, res);
    return weights.categories || {};
  }
  async getPreferredBrands(req, res) {
    const weights = await this.getPersonalizationWeights(req, res);
    return weights.brands || {};
  }
  clearAnonymousUserData(req, res) {
    res.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      domain: this.cookieDomain || undefined,
      path: '/',
    });
    this.logger.debug('Cleared anonymous user data');
  }
});
exports.AnonymousUserService = AnonymousUserService;
exports.AnonymousUserService =
  AnonymousUserService =
  AnonymousUserService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [config_1.ConfigService, session_service_1.SessionService]),
      ],
      AnonymousUserService,
    );
//# sourceMappingURL=anonymous-user.service.js.map
