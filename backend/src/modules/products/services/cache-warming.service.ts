import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductCacheService } from './product-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheWarmingService {
  private readonly logger = new Logger(CacheWarmingService.name);
  private readonly isEnabled: boolean;

  constructor(
    private readonly productCacheService: ProductCacheService,
    private readonly configService: ConfigService,
  ) {
    // Check if cache warming is enabled in configuration
    this.isEnabled = this.configService.get<boolean>('CACHE_WARMING_ENABLED', true);
  }

  // Run cache warming every hour
  @Cron(CronExpression.EVERY_HOUR)
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

  // Run more extensive cache warming once a day (at 3 AM)
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCacheWarming() {
    if (!this.isEnabled) {
      this.logger.debug('Cache warming is disabled. Skipping daily cache warming.');
      return;
    }

    this.logger.log('Starting daily extensive cache warming...');
    try {
      // Warm popular products cache
      await this.productCacheService.warmPopularProductsCache();

      // Warm category products cache
      await this.productCacheService.warmCategoryProductsCache();

      // Warm merchant products cache
      await this.productCacheService.warmMerchantProductsCache();

      this.logger.log('Daily cache warming completed successfully');
    } catch (error) {
      this.logger.error(`Error during daily cache warming: ${error.message}`, error.stack);
    }
  }

  // Manual trigger for cache warming (can be called via API)
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
}
