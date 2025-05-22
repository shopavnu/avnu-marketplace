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
var CachePerformanceMonitorService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.CachePerformanceMonitorService = void 0;
const common_1 = require('@nestjs/common');
const schedule_1 = require('@nestjs/schedule');
const config_1 = require('@nestjs/config');
const event_emitter_1 = require('@nestjs/event-emitter');
let CachePerformanceMonitorService =
  (CachePerformanceMonitorService_1 = class CachePerformanceMonitorService {
    constructor(configService, eventEmitter) {
      this.configService = configService;
      this.eventEmitter = eventEmitter;
      this.logger = new common_1.Logger(CachePerformanceMonitorService_1.name);
      this.cacheHits = 0;
      this.cacheMisses = 0;
      this.cacheInvalidations = 0;
      this.cacheWarmingTime = 0;
      this.responseTimeWithCache = [];
      this.responseTimeWithoutCache = [];
      this.lastResetTime = new Date();
      this.isEnabled = this.configService.get('CACHE_MONITORING_ENABLED', true);
    }
    recordCacheHit() {
      if (!this.isEnabled) return;
      this.cacheHits++;
    }
    recordCacheMiss() {
      if (!this.isEnabled) return;
      this.cacheMisses++;
    }
    recordCacheInvalidation() {
      if (!this.isEnabled) return;
      this.cacheInvalidations++;
    }
    recordResponseTimeWithCache(timeMs) {
      if (!this.isEnabled) return;
      this.responseTimeWithCache.push(timeMs);
      if (this.responseTimeWithCache.length > 1000) {
        this.responseTimeWithCache.shift();
      }
    }
    recordResponseTimeWithoutCache(timeMs) {
      if (!this.isEnabled) return;
      this.responseTimeWithoutCache.push(timeMs);
      if (this.responseTimeWithoutCache.length > 1000) {
        this.responseTimeWithoutCache.shift();
      }
    }
    recordCacheWarmingTime(timeMs) {
      if (!this.isEnabled) return;
      this.cacheWarmingTime = timeMs;
    }
    getCacheHitRate() {
      const total = this.cacheHits + this.cacheMisses;
      if (total === 0) return 0;
      return (this.cacheHits / total) * 100;
    }
    getAverageResponseTimeWithCache() {
      if (this.responseTimeWithCache.length === 0) return 0;
      const sum = this.responseTimeWithCache.reduce((a, b) => a + b, 0);
      return sum / this.responseTimeWithCache.length;
    }
    getAverageResponseTimeWithoutCache() {
      if (this.responseTimeWithoutCache.length === 0) return 0;
      const sum = this.responseTimeWithoutCache.reduce((a, b) => a + b, 0);
      return sum / this.responseTimeWithoutCache.length;
    }
    getResponseTimeImprovement() {
      const withoutCache = this.getAverageResponseTimeWithoutCache();
      const withCache = this.getAverageResponseTimeWithCache();
      if (withoutCache === 0 || withCache === 0) return 0;
      return ((withoutCache - withCache) / withoutCache) * 100;
    }
    getMetrics() {
      return {
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        cacheInvalidations: this.cacheInvalidations,
        cacheHitRate: this.getCacheHitRate(),
        averageResponseTimeWithCache: this.getAverageResponseTimeWithCache(),
        averageResponseTimeWithoutCache: this.getAverageResponseTimeWithoutCache(),
        responseTimeImprovement: this.getResponseTimeImprovement(),
        cacheWarmingTime: this.cacheWarmingTime,
        lastResetTime: this.lastResetTime,
      };
    }
    resetMetrics() {
      this.cacheHits = 0;
      this.cacheMisses = 0;
      this.cacheInvalidations = 0;
      this.responseTimeWithCache = [];
      this.responseTimeWithoutCache = [];
      this.lastResetTime = new Date();
      this.logger.log('Cache performance metrics have been reset');
    }
    logHourlyMetrics() {
      if (!this.isEnabled) return;
      const metrics = this.getMetrics();
      this.logger.log(
        `Hourly Cache Metrics - Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%, Response Time Improvement: ${metrics.responseTimeImprovement.toFixed(2)}%`,
      );
      this.eventEmitter.emit('cache.metrics.hourly', metrics);
    }
    logDailyMetrics() {
      if (!this.isEnabled) return;
      const metrics = this.getMetrics();
      this.logger.log('Daily Cache Performance Report:');
      this.logger.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%`);
      this.logger.log(`Cache Hits: ${metrics.cacheHits}, Cache Misses: ${metrics.cacheMisses}`);
      this.logger.log(`Cache Invalidations: ${metrics.cacheInvalidations}`);
      this.logger.log(
        `Avg Response Time (with cache): ${metrics.averageResponseTimeWithCache.toFixed(2)}ms`,
      );
      this.logger.log(
        `Avg Response Time (without cache): ${metrics.averageResponseTimeWithoutCache.toFixed(2)}ms`,
      );
      this.logger.log(`Response Time Improvement: ${metrics.responseTimeImprovement.toFixed(2)}%`);
      this.logger.log(`Last Cache Warming Time: ${metrics.cacheWarmingTime}ms`);
      this.eventEmitter.emit('cache.metrics.daily', metrics);
      this.resetMetrics();
    }
    handleCacheHit() {
      this.recordCacheHit();
    }
    handleCacheMiss() {
      this.recordCacheMiss();
    }
    handleCacheInvalidation() {
      this.recordCacheInvalidation();
    }
    handleCacheWarmingComplete(timeMs) {
      this.recordCacheWarmingTime(timeMs);
    }
  });
exports.CachePerformanceMonitorService = CachePerformanceMonitorService;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'logHourlyMetrics',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'logDailyMetrics',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('cache.hit'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'handleCacheHit',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('cache.miss'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'handleCacheMiss',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('cache.invalidate'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'handleCacheInvalidation',
  null,
);
__decorate(
  [
    (0, event_emitter_1.OnEvent)('cache.warming.complete'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', void 0),
  ],
  CachePerformanceMonitorService.prototype,
  'handleCacheWarmingComplete',
  null,
);
exports.CachePerformanceMonitorService =
  CachePerformanceMonitorService =
  CachePerformanceMonitorService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [config_1.ConfigService, event_emitter_1.EventEmitter2]),
      ],
      CachePerformanceMonitorService,
    );
//# sourceMappingURL=cache-performance-monitor.service.js.map
