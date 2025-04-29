import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductQueryOptimizerService } from '../services/product-query-optimizer.service';

@Injectable()
export class QueryCacheWarmupTask {
  private readonly logger = new Logger(QueryCacheWarmupTask.name);

  constructor(private readonly queryOptimizerService: ProductQueryOptimizerService) {}

  /**
   * Warm up the query cache for common filter combinations every hour
   * This ensures that common queries are always fast, even after cache expiration
   */
  @Cron(CronExpression.EVERY_HOUR)
  async warmupQueryCache() {
    this.logger.log('Starting scheduled query cache warmup');
    try {
      await this.queryOptimizerService.warmupQueryCache();
      this.logger.log('Scheduled query cache warmup completed successfully');
    } catch (error) {
      this.logger.error(`Error during query cache warmup: ${error.message}`, error.stack);
    }
  }
}
