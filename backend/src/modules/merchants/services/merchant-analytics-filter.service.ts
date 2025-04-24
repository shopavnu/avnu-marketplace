import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not, FindOptionsWhere, In, Raw } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { ProductService, CategoryService } from '../../products/services';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type SortOrder = 'asc' | 'desc';

@Injectable()
export class MerchantAnalyticsFilterService {
  private readonly logger = new Logger(MerchantAnalyticsFilterService.name);

  constructor(
    @InjectRepository(MerchantAnalytics)
    private readonly analyticsRepository: Repository<MerchantAnalytics>,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * Get analytics data filtered by product and/or category
   * @param merchantId The merchant ID
   * @param filters Filter options
   */
  async getFilteredAnalytics(
    merchantId: string,
    filters: {
      timeFrame?: TimeFrame;
      startDate?: Date;
      endDate?: Date;
      productIds?: string[];
      categoryIds?: string[];
      sortBy?: string;
      sortOrder?: SortOrder;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: MerchantAnalytics[]; total: number; page: number; limit: number }> {
    try {
      const {
        timeFrame = 'monthly',
        startDate,
        endDate,
        productIds,
        categoryIds,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = filters;

      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        timeFrame,
      };

      // Add date range if provided
      if (startDate && endDate) {
        whereConditions.date = Between(startDate, endDate);
      }

      // Add product filter if provided
      if (productIds && productIds.length > 0) {
        whereConditions.productId = In(productIds);
      }

      // Add category filter if provided
      if (categoryIds && categoryIds.length > 0) {
        whereConditions.categoryId = In(categoryIds);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get data with pagination
      const [data, total] = await this.analyticsRepository.findAndCount({
        where: whereConditions,
        order: { [sortBy]: sortOrder },
        skip,
        take: limit,
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get filtered analytics for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get top performing products based on a specific metric
   * @param merchantId The merchant ID
   * @param metric The metric to sort by (revenue, orders, views, etc.)
   * @param timeFrame The time frame for data
   * @param limit The maximum number of products to return
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @param categoryIds Optional category filter
   */
  async getTopPerformingProducts(
    merchantId: string,
    metric: string = 'revenue',
    timeFrame: TimeFrame = 'monthly',
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
    categoryIds?: string[],
  ): Promise<any[]> {
    try {
      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        timeFrame,
        productId: Not(IsNull()), // Only include records with a product ID
      };

      // Add date range if provided
      if (startDate && endDate) {
        whereConditions.date = Between(startDate, endDate);
      }

      // Add category filter if provided
      if (categoryIds && categoryIds.length > 0) {
        whereConditions.categoryId = In(categoryIds);
      }

      // Get all product analytics
      const productAnalytics = await this.analyticsRepository.find({
        where: whereConditions,
      });

      // Group by product ID and sum the metric
      const productPerformance = {};

      productAnalytics.forEach(record => {
        const productId = record.productId;
        if (!productPerformance[productId]) {
          productPerformance[productId] = {
            productId,
            revenue: 0,
            orders: 0,
            views: record.productViews || 0,
            clicks: record.clicks || 0,
            conversionRate: 0,
            clickThroughRate: 0,
          };
        }

        productPerformance[productId].revenue += record.revenue || 0;
        productPerformance[productId].orders += record.orders || 0;
        productPerformance[productId].views += record.productViews || 0;
        productPerformance[productId].clicks += record.clicks || 0;
      });

      // Calculate rates
      Object.values(productPerformance).forEach((product: any) => {
        if (product.clicks > 0) {
          product.conversionRate = product.orders / product.clicks;
        }

        if (product.views > 0) {
          product.clickThroughRate = product.clicks / product.views;
        }
      });

      // Sort by the specified metric and get top products
      const sortedProducts = Object.values(productPerformance)
        .sort((a: any, b: any) => b[metric] - a[metric])
        .slice(0, limit);

      // Fetch product details
      const productIds = sortedProducts.map((product: any) => product.productId);
      const productDetails = await this.productService.findByIds(productIds);

      // Merge analytics with product details
      return sortedProducts.map((performance: any) => {
        const product = productDetails.find(p => p.id === performance.productId);
        return {
          ...performance,
          productName: product?.title || 'Unknown Product',
          productImage: product?.thumbnail || product?.images?.[0] || '',
          productPrice: product?.price || 0,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to get top performing products for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get category performance comparison
   * @param merchantId The merchant ID
   * @param metric The metric to compare (revenue, orders, views, etc.)
   * @param timeFrame The time frame for data
   * @param startDate Optional start date
   * @param endDate Optional end date
   */
  async getCategoryPerformance(
    merchantId: string,
    metric: string = 'revenue',
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    try {
      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        timeFrame,
        categoryId: Not(IsNull()), // Only include records with a category ID
      };

      // Add date range if provided
      if (startDate && endDate) {
        whereConditions.date = Between(startDate, endDate);
      }

      // Get all category analytics
      const categoryAnalytics = await this.analyticsRepository.find({
        where: whereConditions,
      });

      // Group by category ID and sum the metric
      const categoryPerformance = {};

      categoryAnalytics.forEach(record => {
        const categoryId = record.categoryId;
        if (!categoryPerformance[categoryId]) {
          categoryPerformance[categoryId] = {
            categoryId,
            revenue: 0,
            orders: 0,
            views: 0,
            clicks: 0,
          };
        }

        categoryPerformance[categoryId].revenue += record.revenue || 0;
        categoryPerformance[categoryId].orders += record.orders || 0;
        categoryPerformance[categoryId].views += record.productViews || 0;
        categoryPerformance[categoryId].clicks += record.clicks || 0;
      });

      // Fetch category details
      const categoryIds = Object.keys(categoryPerformance);
      const categoryDetails = await this.categoryService.findByIds(categoryIds);

      // Merge analytics with category details
      return Object.values(categoryPerformance)
        .map((performance: any) => {
          const category = categoryDetails.find(c => c.id === performance.categoryId);
          return {
            ...performance,
            categoryName: category?.name || 'Unknown Category', // Using name from our mock Category interface
            [metric]: performance[metric] || 0,
          };
        })
        .sort((a: any, b: any) => b[metric] - a[metric]);
    } catch (error) {
      this.logger.error(
        `Failed to get category performance for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get product performance over time
   * @param merchantId The merchant ID
   * @param productId The product ID
   * @param metric The metric to track (revenue, orders, views, etc.)
   * @param timeFrame The time frame for data
   * @param startDate Optional start date
   * @param endDate Optional end date
   */
  async getProductPerformanceOverTime(
    merchantId: string,
    productId: string,
    metric: string = 'revenue',
    timeFrame: TimeFrame = 'daily',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    try {
      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        productId,
        timeFrame,
      };

      // Add date range if provided
      if (startDate && endDate) {
        whereConditions.date = Between(startDate, endDate);
      }

      // Get product analytics over time
      const productAnalytics = await this.analyticsRepository.find({
        where: whereConditions,
        order: { date: 'ASC' },
      });

      // Map to time series format
      return productAnalytics.map(record => ({
        date: record.date,
        value: record[metric] || 0,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get product performance over time for merchant ${merchantId} and product ${productId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get category performance over time
   * @param merchantId The merchant ID
   * @param categoryId The category ID
   * @param metric The metric to track (revenue, orders, views, etc.)
   * @param timeFrame The time frame for data
   * @param startDate Optional start date
   * @param endDate Optional end date
   */
  async getCategoryPerformanceOverTime(
    merchantId: string,
    categoryId: string,
    metric: string = 'revenue',
    timeFrame: TimeFrame = 'daily',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    try {
      // Build base query conditions
      const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
        merchantId,
        categoryId,
        timeFrame,
      };

      // Add date range if provided
      if (startDate && endDate) {
        whereConditions.date = Between(startDate, endDate);
      }

      // Get category analytics over time
      const categoryAnalytics = await this.analyticsRepository.find({
        where: whereConditions,
        order: { date: 'ASC' },
      });

      // Map to time series format
      return categoryAnalytics.map(record => ({
        date: record.date,
        value: record[metric] || 0,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get category performance over time for merchant ${merchantId} and category ${categoryId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Compare product performance
   * @param merchantId The merchant ID
   * @param productIds Array of product IDs to compare
   * @param metric The metric to compare (revenue, orders, views, etc.)
   * @param timeFrame The time frame for data
   * @param startDate Optional start date
   * @param endDate Optional end date
   */
  async compareProducts(
    merchantId: string,
    productIds: string[],
    metric: string = 'revenue',
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    try {
      const result = {};

      // Get product details
      const productDetails = await this.productService.findByIds(productIds);

      // For each product, get its performance data
      for (const productId of productIds) {
        const productAnalytics = await this.getProductPerformanceOverTime(
          merchantId,
          productId,
          metric,
          timeFrame,
          startDate,
          endDate,
        );

        const product = productDetails.find(p => p.id === productId);

        result[productId] = {
          productId,
          productName: product?.title || 'Unknown Product',
          data: productAnalytics,
          total: productAnalytics.reduce((sum, item) => sum + item.value, 0),
        };
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to compare products for merchant ${merchantId}: ${error.message}`);
      throw error;
    }
  }
}
