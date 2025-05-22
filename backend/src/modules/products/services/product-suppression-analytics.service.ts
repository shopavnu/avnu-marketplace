import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Category } from '../../categories/entities/category.entity';
import { subDays } from 'date-fns';

@Injectable()
export class ProductSuppressionAnalyticsService {
  private readonly logger = new Logger(ProductSuppressionAnalyticsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get suppression metrics overview
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  async getSuppressionMetrics(period: number = 30, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);

      // Build base query
      const baseQuery = this.productRepository
        .createQueryBuilder('product')
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate });

      // Add merchant filter if provided
      if (merchantId) {
        baseQuery.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      // Get overview metrics
      const overview = await this.getOverviewMetrics(period, merchantId);

      // Get metrics by merchant
      const byMerchant = await this.getMerchantMetrics(period, merchantId);

      // Get metrics by category
      const byCategory = await this.getCategoryMetrics(period, merchantId);

      // Get metrics by timeframe
      const byTimeframe = await this.getTimeframeMetrics(period, merchantId);

      // Get resolution time distribution
      const resolutionTimeDistribution = await this.getResolutionTimeDistribution(
        period,
        merchantId,
      );

      return {
        overview,
        byMerchant,
        byCategory,
        byTimeframe,
        resolutionTimeDistribution,
      };
    } catch (error) {
      this.logger.error(`Failed to get suppression metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get overview metrics
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  private async getOverviewMetrics(period: number, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);

      // Build base query
      const baseQuery = this.productRepository.createQueryBuilder('product');

      // Add merchant filter if provided
      if (merchantId) {
        baseQuery.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      // Get total products
      const totalProducts = await baseQuery.clone().getCount();

      // Get total suppressed products
      const totalSuppressedProducts = await baseQuery
        .clone()
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate })
        .getCount();

      // Get total active suppressed products
      const totalActiveSuppressedProducts = await baseQuery
        .clone()
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate })
        .andWhere('product.unsuppressedAt IS NULL')
        .getCount();

      // Get total resolved suppressions
      const totalResolvedSuppressions = await baseQuery
        .clone()
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate })
        .andWhere('product.unsuppressedAt IS NOT NULL')
        .getCount();

      // Calculate average resolution time
      const resolutionTimes = await baseQuery
        .clone()
        .select(
          'EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600',
          'resolutionTimeHours',
        )
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate })
        .andWhere('product.unsuppressedAt IS NOT NULL')
        .getRawMany();

      const totalResolutionTime = resolutionTimes.reduce(
        (sum, item) => sum + parseFloat(item.resolutionTimeHours),
        0,
      );

      const avgResolutionTimeHours =
        resolutionTimes.length > 0 ? totalResolutionTime / resolutionTimes.length : 0;

      // Calculate suppression rate
      const suppressionRate = totalProducts > 0 ? totalSuppressedProducts / totalProducts : 0;

      return {
        totalSuppressedProducts,
        totalActiveSuppressedProducts,
        totalResolvedSuppressions,
        avgResolutionTimeHours,
        suppressionRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get overview metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get metrics by merchant
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  private async getMerchantMetrics(period: number, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);

      // Build base query
      let query = this.productRepository
        .createQueryBuilder('product')
        .select('product.merchantId', 'merchantId')
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate)',
          'suppressedCount',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)',
          'resolvedCount',
        )
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)',
          'avgResolutionTimeHours',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate) / COUNT(product.id)::float',
          'suppressionRate',
        )
        .setParameter('startDate', startDate)
        .groupBy('product.merchantId');

      // Add merchant filter if provided
      if (merchantId) {
        query = query.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      const results = await query.getRawMany();

      // Get merchant names
      const merchantIds = results.map(result => result.merchantId);
      const merchants = await this.merchantRepository.find({
        where: { id: In(merchantIds) },
        select: ['id', 'name'],
      });

      const merchantMap = new Map(merchants.map(merchant => [merchant.id, merchant.name]));

      return results.map(result => ({
        merchantId: result.merchantId,
        merchantName: merchantMap.get(result.merchantId) || 'Unknown Merchant',
        suppressedCount: parseInt(result.suppressedCount) || 0,
        resolvedCount: parseInt(result.resolvedCount) || 0,
        avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
        suppressionRate: parseFloat(result.suppressionRate) || 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get merchant metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get metrics by category
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  private async getCategoryMetrics(period: number, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);

      // Build base query
      let query = this.productRepository
        .createQueryBuilder('product')
        .select('unnest(product.categories)', 'categoryId')
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate)',
          'suppressedCount',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)',
          'resolvedCount',
        )
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate AND product.unsuppressedAt IS NOT NULL)',
          'avgResolutionTimeHours',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.suppressedAt >= :startDate) / COUNT(product.id)::float',
          'suppressionRate',
        )
        .setParameter('startDate', startDate)
        .groupBy('categoryId');

      // Add merchant filter if provided
      if (merchantId) {
        query = query.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      const results = await query.getRawMany();

      // Get category names
      const categoryIds = results.map(result => result.categoryId);
      const categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
        select: ['id', 'name'],
      });

      const categoryMap = new Map(categories.map(category => [category.id, category.name]));

      return results.map(result => ({
        categoryId: result.categoryId,
        categoryName: categoryMap.get(result.categoryId) || 'Unknown Category',
        suppressedCount: parseInt(result.suppressedCount) || 0,
        resolvedCount: parseInt(result.resolvedCount) || 0,
        avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
        suppressionRate: parseFloat(result.suppressionRate) || 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get category metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get metrics by timeframe
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  private async getTimeframeMetrics(period: number, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);
      const dateFormat = period <= 30 ? 'yyyy-MM-dd' : 'yyyy-MM';

      // Build base query
      let query = this.productRepository
        .createQueryBuilder('product')
        .select(`TO_CHAR(product.suppressedAt, '${dateFormat}')`, 'date')
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL)',
          'suppressedCount',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.unsuppressedAt IS NOT NULL)',
          'resolvedCount',
        )
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600) FILTER (WHERE product.suppressedAt IS NOT NULL AND product.unsuppressedAt IS NOT NULL)',
          'avgResolutionTimeHours',
        )
        .addSelect(
          'COUNT(product.id) FILTER (WHERE product.suppressedAt IS NOT NULL) / COUNT(product.id)::float',
          'suppressionRate',
        )
        .where('product.suppressedAt >= :startDate', { startDate })
        .groupBy('date')
        .orderBy('date', 'ASC');

      // Add merchant filter if provided
      if (merchantId) {
        query = query.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      const results = await query.getRawMany();

      return results.map(result => ({
        date: result.date,
        suppressedCount: parseInt(result.suppressedCount) || 0,
        resolvedCount: parseInt(result.resolvedCount) || 0,
        avgResolutionTimeHours: parseFloat(result.avgResolutionTimeHours) || 0,
        suppressionRate: parseFloat(result.suppressionRate) || 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get timeframe metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get resolution time distribution
   * @param period Time period in days
   * @param merchantId Optional merchant ID to filter by
   */
  private async getResolutionTimeDistribution(period: number, merchantId?: string) {
    try {
      const startDate = subDays(new Date(), period);

      // Build base query
      let query = this.productRepository
        .createQueryBuilder('product')
        .select(
          'CASE ' +
            "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 24 THEN '< 24 hours' " +
            "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 48 THEN '24-48 hours' " +
            "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 72 THEN '48-72 hours' " +
            "WHEN EXTRACT(EPOCH FROM (product.unsuppressedAt - product.suppressedAt)) / 3600 < 168 THEN '3-7 days' " +
            "ELSE '> 7 days' " +
            'END',
          'timeRange',
        )
        .addSelect('COUNT(product.id)', 'count')
        .where('product.suppressedAt IS NOT NULL')
        .andWhere('product.suppressedAt >= :startDate', { startDate })
        .andWhere('product.unsuppressedAt IS NOT NULL')
        .groupBy('timeRange')
        .orderBy(
          'CASE ' +
            "WHEN timeRange = '< 24 hours' THEN 1 " +
            "WHEN timeRange = '24-48 hours' THEN 2 " +
            "WHEN timeRange = '48-72 hours' THEN 3 " +
            "WHEN timeRange = '3-7 days' THEN 4 " +
            'ELSE 5 ' +
            'END',
          'ASC',
        );

      // Add merchant filter if provided
      if (merchantId) {
        query = query.andWhere('product.merchantId = :merchantId', { merchantId });
      }

      const results = await query.getRawMany();

      // Calculate total count for percentage
      const totalCount = results.reduce((sum, item) => sum + parseInt(item.count), 0);

      return results.map(result => ({
        timeRange: result.timeRange,
        count: parseInt(result.count),
        percentage: totalCount > 0 ? parseInt(result.count) / totalCount : 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get resolution time distribution: ${error.message}`);
      throw error;
    }
  }
}
