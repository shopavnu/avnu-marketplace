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
var CacheWarmingService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.CacheWarmingService = void 0;
const common_1 = require('@nestjs/common');
const schedule_1 = require('@nestjs/schedule');
const product_cache_service_1 = require('./product-cache.service');
const config_1 = require('@nestjs/config');
let CacheWarmingService = (CacheWarmingService_1 = class CacheWarmingService {
  constructor(productCacheService, configService) {
    this.productCacheService = productCacheService;
    this.configService = configService;
    this.logger = new common_1.Logger(CacheWarmingService_1.name);
    this.isEnabled = this.configService.get('CACHE_WARMING_ENABLED', true);
  }
  async handleHourlyCacheWarming() {
    if (!this.isEnabled) {
      this.logger.debug('Cache warming is disabled. Skipping hourly cache warming.');
      return;
    }
    this.logger.log('Starting hourly cache warming...');
    try {
      await this.productCacheService.warmCache();
      this.logger.log('Hourly cache warming completed successfully');
    } catch (error) {
      this.logger.error(`Error during hourly cache warming: ${error.message}`, error.stack);
    }
  }
  async handleDailyCacheWarming() {
    if (!this.isEnabled) {
      this.logger.debug('Cache warming is disabled. Skipping daily cache warming.');
      return;
    }
    this.logger.log('Starting daily extensive cache warming...');
    try {
      await this.productCacheService.warmPopularProductsCache();
      await this.productCacheService.warmCategoryProductsCache();
      await this.productCacheService.warmMerchantProductsCache();
      this.logger.log('Daily cache warming completed successfully');
    } catch (error) {
      this.logger.error(`Error during daily cache warming: ${error.message}`, error.stack);
    }
  }
  async triggerCacheWarming() {
    this.logger.log('Manually triggering cache warming...');
    try {
      await this.productCacheService.warmCache();
      this.logger.log('Manual cache warming completed successfully');
      return { success: true, message: 'Cache warming completed successfully' };
    } catch (error) {
      this.logger.error(`Error during manual cache warming: ${error.message}`, error.stack);
      return { success: false, message: `Cache warming failed: ${error.message}` };
    }
  }
});
exports.CacheWarmingService = CacheWarmingService;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  CacheWarmingService.prototype,
  'handleHourlyCacheWarming',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  CacheWarmingService.prototype,
  'handleDailyCacheWarming',
  null,
);
exports.CacheWarmingService =
  CacheWarmingService =
  CacheWarmingService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          product_cache_service_1.ProductCacheService,
          config_1.ConfigService,
        ]),
      ],
      CacheWarmingService,
    );
//# sourceMappingURL=cache-warming.service.js.map
