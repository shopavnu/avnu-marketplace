import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductValidationService } from '../services/product-validation.service';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Injectable()
export class ProductValidationTask {
  private readonly logger = new Logger(ProductValidationTask.name);

  constructor(
    private productValidationService: ProductValidationService,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * Run product validation daily at midnight
   * This will check all products for missing key data and suppress them if necessary
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async validateAllProducts(): Promise<void> {
    this.logger.log('Starting daily product validation task');

    try {
      await this.productValidationService.validateAllProducts();
      this.logger.log('Daily product validation task completed successfully');
    } catch (error) {
      this.logger.error(`Error in daily product validation task: ${error.message}`, error.stack);
    }
  }

  /**
   * Run product validation for newly imported products every hour
   * This ensures that newly imported products are quickly validated and suppressed if necessary
   */
  @Cron(CronExpression.EVERY_HOUR)
  async validateRecentProducts(): Promise<void> {
    this.logger.log('Starting hourly validation for recently imported products');

    try {
      // Get all merchants with products imported in the last hour
      const recentMerchants = await this.merchantRepository.query(`
        SELECT DISTINCT m.id 
        FROM merchants m
        JOIN products p ON p."merchantId" = m.id
        WHERE p."createdAt" > NOW() - INTERVAL '1 hour'
        OR p."updatedAt" > NOW() - INTERVAL '1 hour'
      `);

      // Validate products for each merchant
      for (const merchant of recentMerchants) {
        await this.productValidationService.validateMerchantProducts(merchant.id);
      }

      this.logger.log(
        `Validated products for ${recentMerchants.length} merchants with recent imports`,
      );
    } catch (error) {
      this.logger.error(`Error validating recent products: ${error.message}`, error.stack);
    }
  }
}
