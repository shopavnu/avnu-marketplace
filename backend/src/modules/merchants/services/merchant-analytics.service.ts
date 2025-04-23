import { Injectable } from '@nestjs/common'; // Removed unused NotFoundException import
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not, FindOptionsWhere } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

@Injectable()
export class MerchantAnalyticsService {
  constructor(
    @InjectRepository(MerchantAnalytics)
    private analyticsRepository: Repository<MerchantAnalytics>,
  ) {}

  async getAnalytics(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
    productId?: string,
    categoryId?: string,
  ): Promise<MerchantAnalytics[]> {
    // Set default date range if not provided
    if (!startDate) {
      startDate = new Date();
      switch (timeFrame) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 7); // Last 7 days
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 28); // Last 4 weeks
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 6); // Last 6 months
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 12); // Last 4 quarters
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 3); // Last 3 years
          break;
      }
    }

    if (!endDate) {
      endDate = new Date();
    }

    // Build where conditions
    const whereConditions: FindOptionsWhere<MerchantAnalytics> = {
      merchantId,
      timeFrame,
      date: Between(startDate, endDate),
    };

    if (productId) {
      whereConditions.productId = productId;
    }

    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    return this.analyticsRepository.find({
      where: whereConditions,
      order: { date: 'ASC' },
    });
  }

  async getProductAnalytics(
    merchantId: string,
    productId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    return this.getAnalytics(merchantId, timeFrame, startDate, endDate, productId);
  }

  async getCategoryAnalytics(
    merchantId: string,
    categoryId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    return this.getAnalytics(merchantId, timeFrame, startDate, endDate, undefined, categoryId);
  }

  async getOverallAnalytics(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
  ): Promise<MerchantAnalytics[]> {
    // For overall analytics, we want records where both productId and categoryId are null
    if (!startDate) {
      startDate = new Date();
      switch (timeFrame) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 28);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 12);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 3);
          break;
      }
    }

    if (!endDate) {
      endDate = new Date();
    }

    return this.analyticsRepository.find({
      where: {
        merchantId,
        timeFrame,
        date: Between(startDate, endDate),
        productId: IsNull(),
        categoryId: IsNull(),
      },
      order: { date: 'ASC' },
    });
  }

  async getDemographicData(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
  ): Promise<Record<string, number>> {
    const analytics = await this.getOverallAnalytics(merchantId, timeFrame);

    // Aggregate demographic data
    const demographicCounts: Record<string, number> = {};

    analytics.forEach(record => {
      if (record.demographics) {
        record.demographics.forEach(demo => {
          if (!demographicCounts[demo]) {
            demographicCounts[demo] = 0;
          }
          demographicCounts[demo]++;
        });
      }
    });

    return demographicCounts;
  }

  async getTopProducts(
    merchantId: string,
    limit: number = 10,
    timeFrame: TimeFrame = 'monthly',
  ): Promise<{ productId: string; revenue: number; orders: number }[]> {
    // Get all product analytics for the merchant in the given timeframe
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months by default

    const productAnalytics = await this.analyticsRepository.find({
      where: {
        merchantId,
        timeFrame,
        date: Between(startDate, new Date()),
        productId: Not(IsNull()),
      },
    });

    // Aggregate by product
    const productMap: Record<string, { revenue: number; orders: number }> = {};

    productAnalytics.forEach(record => {
      if (record.productId) {
        if (!productMap[record.productId]) {
          productMap[record.productId] = { revenue: 0, orders: 0 };
        }
        productMap[record.productId].revenue += record.revenue;
        productMap[record.productId].orders += record.orders;
      }
    });

    // Convert to array and sort by revenue
    const products = Object.entries(productMap).map(([productId, data]) => ({
      productId,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Sort by revenue descending and limit
    return products.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  }

  async recordProductView(
    merchantId: string,
    productId: string,
    isOrganic: boolean = true,
    demographics: string[] = [],
  ): Promise<void> {
    await this.updateDailyAnalytics(merchantId, productId, {
      productViews: 1,
      organicImpressions: isOrganic ? 1 : 0,
      paidImpressions: isOrganic ? 0 : 1,
      demographics,
    });
  }

  async recordProductClick(
    merchantId: string,
    productId: string,
    _isOrganic: boolean = true, // Prefixed with underscore as it's unused
    demographics: string[] = [],
  ): Promise<void> {
    await this.updateDailyAnalytics(merchantId, productId, {
      clicks: 1,
      demographics,
    });
  }

  async recordAddToCart(
    merchantId: string,
    productId: string,
    demographics: string[] = [],
  ): Promise<void> {
    await this.updateDailyAnalytics(merchantId, productId, {
      addToCarts: 1,
      demographics,
    });
  }

  async recordAbandonedCart(
    merchantId: string,
    productId: string,
    demographics: string[] = [],
  ): Promise<void> {
    await this.updateDailyAnalytics(merchantId, productId, {
      abandonedCarts: 1,
      demographics,
    });
  }

  async recordPurchase(
    merchantId: string,
    productId: string,
    revenue: number,
    demographics: string[] = [],
  ): Promise<void> {
    await this.updateDailyAnalytics(merchantId, productId, {
      revenue,
      orders: 1,
      demographics,
    });
  }

  private async updateDailyAnalytics(
    merchantId: string,
    productId: string,
    data: {
      revenue?: number;
      orders?: number;
      productViews?: number;
      organicImpressions?: number;
      paidImpressions?: number;
      clicks?: number;
      addToCarts?: number;
      abandonedCarts?: number;
      demographics?: string[];
    },
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get category for the product (this would need to be implemented)
    const categoryId = await this.getCategoryForProduct(productId);

    // Update product-specific analytics
    await this.updateAnalyticsRecord(merchantId, today, 'daily', data, productId);

    // Update category analytics if available
    if (categoryId) {
      await this.updateAnalyticsRecord(merchantId, today, 'daily', data, null, categoryId);
    }

    // Update overall merchant analytics
    await this.updateAnalyticsRecord(merchantId, today, 'daily', data);

    // Also update weekly, monthly, quarterly, and yearly aggregates
    await this.updateTimeFrameAggregates(merchantId, today, data, productId, categoryId);
  }

  private async updateAnalyticsRecord(
    merchantId: string,
    date: Date,
    timeFrame: TimeFrame,
    data: {
      revenue?: number;
      orders?: number;
      productViews?: number;
      organicImpressions?: number;
      paidImpressions?: number;
      clicks?: number;
      addToCarts?: number;
      abandonedCarts?: number;
      demographics?: string[];
    },
    productId: string = null,
    categoryId: string = null,
  ): Promise<void> {
    // Find existing record or create new one
    let record = await this.analyticsRepository.findOne({
      where: {
        merchantId,
        date,
        timeFrame,
        productId: productId || IsNull(),
        categoryId: categoryId || IsNull(),
      },
    });

    if (!record) {
      record = this.analyticsRepository.create({
        merchantId,
        date,
        timeFrame,
        productId,
        categoryId,
        revenue: 0,
        orders: 0,
        productViews: 0,
        organicImpressions: 0,
        paidImpressions: 0,
        clicks: 0,
        addToCarts: 0,
        abandonedCarts: 0,
        conversionRate: 0,
        clickThroughRate: 0,
        demographics: [],
      });
    }

    // Update the record with new data
    if (data.revenue) record.revenue += data.revenue;
    if (data.orders) record.orders += data.orders;
    if (data.productViews) record.productViews += data.productViews;
    if (data.organicImpressions) record.organicImpressions += data.organicImpressions;
    if (data.paidImpressions) record.paidImpressions += data.paidImpressions;
    if (data.clicks) record.clicks += data.clicks;
    if (data.addToCarts) record.addToCarts += data.addToCarts;
    if (data.abandonedCarts) record.abandonedCarts += data.abandonedCarts;

    // Update calculated fields
    if (record.productViews > 0) {
      record.clickThroughRate = record.clicks / record.productViews;
    }

    if (record.clicks > 0) {
      record.conversionRate = record.orders / record.clicks;
    }

    // Add demographics if provided
    if (data.demographics && data.demographics.length > 0) {
      if (!record.demographics) {
        record.demographics = [];
      }
      record.demographics = [...record.demographics, ...data.demographics];
    }

    await this.analyticsRepository.save(record);
  }

  private async updateTimeFrameAggregates(
    merchantId: string,
    date: Date,
    data: any,
    productId: string = null,
    categoryId: string = null,
  ): Promise<void> {
    // Update weekly record
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to start of week (Sunday)
    await this.updateAnalyticsRecord(merchantId, weekStart, 'weekly', data, productId, categoryId);

    // Update monthly record
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    await this.updateAnalyticsRecord(
      merchantId,
      monthStart,
      'monthly',
      data,
      productId,
      categoryId,
    );

    // Update quarterly record
    const quarter = Math.floor(date.getMonth() / 3);
    const quarterStart = new Date(date.getFullYear(), quarter * 3, 1);
    await this.updateAnalyticsRecord(
      merchantId,
      quarterStart,
      'quarterly',
      data,
      productId,
      categoryId,
    );

    // Update yearly record
    const yearStart = new Date(date.getFullYear(), 0, 1);
    await this.updateAnalyticsRecord(merchantId, yearStart, 'yearly', data, productId, categoryId);
  }

  // This method would need to be implemented to get the category for a product
  private async getCategoryForProduct(_productId: string): Promise<string | null> {
    // This is a placeholder - you would need to implement this based on your data model
    // For example, you might query the product repository to get the product's category
    return null;
  }
}
