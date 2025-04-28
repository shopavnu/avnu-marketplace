import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class CachePerformanceMonitorService {
  private readonly logger = new Logger(CachePerformanceMonitorService.name);
  private readonly isEnabled: boolean;
  
  // Performance metrics
  private cacheHits = 0;
  private cacheMisses = 0;
  private cacheInvalidations = 0;
  private cacheWarmingTime = 0;
  private responseTimeWithCache: number[] = [];
  private responseTimeWithoutCache: number[] = [];
  
  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.isEnabled = this.configService.get<boolean>('CACHE_MONITORING_ENABLED', true);
  }
  
  // Record a cache hit
  recordCacheHit() {
    if (!this.isEnabled) return;
    this.cacheHits++;
  }
  
  // Record a cache miss
  recordCacheMiss() {
    if (!this.isEnabled) return;
    this.cacheMisses++;
  }
  
  // Record a cache invalidation
  recordCacheInvalidation() {
    if (!this.isEnabled) return;
    this.cacheInvalidations++;
  }
  
  // Record response time with cache
  recordResponseTimeWithCache(timeMs: number) {
    if (!this.isEnabled) return;
    this.responseTimeWithCache.push(timeMs);
    // Keep only the last 1000 measurements to avoid memory issues
    if (this.responseTimeWithCache.length > 1000) {
      this.responseTimeWithCache.shift();
    }
  }
  
  // Record response time without cache
  recordResponseTimeWithoutCache(timeMs: number) {
    if (!this.isEnabled) return;
    this.responseTimeWithoutCache.push(timeMs);
    // Keep only the last 1000 measurements to avoid memory issues
    if (this.responseTimeWithoutCache.length > 1000) {
      this.responseTimeWithoutCache.shift();
    }
  }
  
  // Record cache warming time
  recordCacheWarmingTime(timeMs: number) {
    if (!this.isEnabled) return;
    this.cacheWarmingTime = timeMs;
  }
  
  // Calculate cache hit rate
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return (this.cacheHits / total) * 100;
  }
  
  // Calculate average response time with cache
  getAverageResponseTimeWithCache(): number {
    if (this.responseTimeWithCache.length === 0) return 0;
    const sum = this.responseTimeWithCache.reduce((a, b) => a + b, 0);
    return sum / this.responseTimeWithCache.length;
  }
  
  // Calculate average response time without cache
  getAverageResponseTimeWithoutCache(): number {
    if (this.responseTimeWithoutCache.length === 0) return 0;
    const sum = this.responseTimeWithoutCache.reduce((a, b) => a + b, 0);
    return sum / this.responseTimeWithoutCache.length;
  }
  
  // Calculate response time improvement percentage
  getResponseTimeImprovement(): number {
    const withoutCache = this.getAverageResponseTimeWithoutCache();
    const withCache = this.getAverageResponseTimeWithCache();
    
    if (withoutCache === 0 || withCache === 0) return 0;
    return ((withoutCache - withCache) / withoutCache) * 100;
  }
  
  // Get all metrics
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
  
  // Reset metrics
  private lastResetTime = new Date();
  
  resetMetrics() {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.cacheInvalidations = 0;
    this.responseTimeWithCache = [];
    this.responseTimeWithoutCache = [];
    this.lastResetTime = new Date();
    this.logger.log('Cache performance metrics have been reset');
  }
  
  // Log metrics hourly
  @Cron(CronExpression.EVERY_HOUR)
  logHourlyMetrics() {
    if (!this.isEnabled) return;
    
    const metrics = this.getMetrics();
    this.logger.log(`Hourly Cache Metrics - Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%, Response Time Improvement: ${metrics.responseTimeImprovement.toFixed(2)}%`);
    
    // Emit event with metrics for potential dashboard or alerting
    this.eventEmitter.emit('cache.metrics.hourly', metrics);
  }
  
  // Log detailed metrics daily
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  logDailyMetrics() {
    if (!this.isEnabled) return;
    
    const metrics = this.getMetrics();
    this.logger.log('Daily Cache Performance Report:');
    this.logger.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(2)}%`);
    this.logger.log(`Cache Hits: ${metrics.cacheHits}, Cache Misses: ${metrics.cacheMisses}`);
    this.logger.log(`Cache Invalidations: ${metrics.cacheInvalidations}`);
    this.logger.log(`Avg Response Time (with cache): ${metrics.averageResponseTimeWithCache.toFixed(2)}ms`);
    this.logger.log(`Avg Response Time (without cache): ${metrics.averageResponseTimeWithoutCache.toFixed(2)}ms`);
    this.logger.log(`Response Time Improvement: ${metrics.responseTimeImprovement.toFixed(2)}%`);
    this.logger.log(`Last Cache Warming Time: ${metrics.cacheWarmingTime}ms`);
    
    // Emit event with metrics for potential dashboard or alerting
    this.eventEmitter.emit('cache.metrics.daily', metrics);
    
    // Reset metrics after daily report
    this.resetMetrics();
  }
  
  // Event handlers
  @OnEvent('cache.hit')
  handleCacheHit() {
    this.recordCacheHit();
  }
  
  @OnEvent('cache.miss')
  handleCacheMiss() {
    this.recordCacheMiss();
  }
  
  @OnEvent('cache.invalidate')
  handleCacheInvalidation() {
    this.recordCacheInvalidation();
  }
  
  @OnEvent('cache.warming.complete')
  handleCacheWarmingComplete(timeMs: number) {
    this.recordCacheWarmingTime(timeMs);
  }
}
