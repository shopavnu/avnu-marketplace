import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
type DemographicFilter = { key: string; values: string[] };

@Injectable()
export class MerchantDemographicAnalyticsService {
  private readonly logger = new Logger(MerchantDemographicAnalyticsService.name);

  constructor(
    @InjectRepository(MerchantAnalytics)
    private readonly analyticsRepository: Repository<MerchantAnalytics>,
  ) {
    // Initialize logger
    this.logger = new Logger(MerchantDemographicAnalyticsService.name);
  }

  /**
   * Get demographic data for a merchant
   * @param merchantId The merchant ID
   * @param timeFrame The time frame for data aggregation
   * @param startDate Optional start date for custom date range
   * @param endDate Optional end date for custom date range
   * @param filters Optional demographic filters
   */
  async getDemographicAnalytics(
    merchantId: string,
    timeFrame: TimeFrame = 'monthly',
    startDate?: Date,
    endDate?: Date,
    filters?: DemographicFilter[],
  ) {
    try {
      // Set default date range if not provided
      if (!startDate) {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6); // Last 6 months by default
      }

      if (!endDate) {
        endDate = new Date();
      }

      // Get analytics data
      const analytics = await this.analyticsRepository.find({
        where: {
          merchantId,
          timeFrame,
          date: Between(startDate, endDate),
          productId: IsNull(),
          categoryId: IsNull(),
        },
        order: { date: 'ASC' },
      });

      // Apply filters if provided
      const filteredAnalytics =
        filters && filters.length > 0
          ? this.applyDemographicFilters(analytics, filters)
          : analytics;

      // Process demographic data
      return {
        ageGroups: this.processAgeGroupData(filteredAnalytics),
        location: this.processLocationData(filteredAnalytics),
        devices: this.processDeviceData(filteredAnalytics),
        gender: this.processGenderData(filteredAnalytics),
        interests: this.processInterestData(filteredAnalytics),
      };
    } catch (error) {
      this.logger.error(`Failed to get demographic analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply demographic filters to analytics data
   * @param analytics Array of analytics records
   * @param filters Array of demographic filters
   */
  private applyDemographicFilters(analytics: MerchantAnalytics[], filters: DemographicFilter[]) {
    return analytics.filter(record => {
      if (!record.demographics || record.demographics.length === 0) {
        return false;
      }

      // Check if record matches all filters
      return filters.every(filter => {
        const demographicValues = this.extractDemographicValues(record.demographics, filter.key);
        return filter.values.some(value => demographicValues.includes(value));
      });
    });
  }

  /**
   * Extract demographic values for a specific key from demographics array
   * @param demographics Array of demographic strings
   * @param key Demographic key to extract
   */
  private extractDemographicValues(demographics: string[], key: string): string[] {
    const prefix = `${key}:`;
    return demographics
      .filter(item => item.startsWith(prefix))
      .map(item => item.substring(prefix.length));
  }

  /**
   * Process age group data from analytics
   * @param analytics Array of analytics records
   */
  private processAgeGroupData(analytics: MerchantAnalytics[]) {
    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0,
    };

    let totalCount = 0;
    let weightedAgeSum = 0;

    // Aggregate age group data
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        if (demo.startsWith('age:')) {
          const ageGroup = demo.substring(4);
          if (ageGroups[ageGroup] !== undefined) {
            ageGroups[ageGroup]++;
            totalCount++;

            // Calculate weighted age for average (using midpoint of range)
            const midpoint = this.getAgeGroupMidpoint(ageGroup);
            weightedAgeSum += midpoint;
          }
        }
      });
    });

    // Convert to data points with percentages
    const distribution = Object.entries(ageGroups).map(([key, value]) => ({
      key,
      value,
      percentage: totalCount > 0 ? (value / totalCount) * 100 : 0,
    }));

    // Find dominant age group
    let dominantAgeGroup = null;
    let maxCount = 0;
    Object.entries(ageGroups).forEach(([group, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantAgeGroup = group;
      }
    });

    return {
      distribution,
      averageAge: totalCount > 0 ? weightedAgeSum / totalCount : null,
      dominantAgeGroup,
    };
  }

  /**
   * Get midpoint age for an age group
   * @param ageGroup Age group string (e.g., '18-24')
   */
  private getAgeGroupMidpoint(ageGroup: string): number {
    if (ageGroup === '65+') return 70; // Estimate for 65+

    const [min, max] = ageGroup.split('-').map(Number);
    return (min + max) / 2;
  }

  /**
   * Process location data from analytics
   * @param analytics Array of analytics records
   */
  private processLocationData(analytics: MerchantAnalytics[]) {
    const countries = {};
    const regions = {};
    const cities = {};

    // Aggregate location data
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        if (demo.startsWith('country:')) {
          const country = demo.substring(8);
          countries[country] = (countries[country] || 0) + 1;
        } else if (demo.startsWith('region:')) {
          const region = demo.substring(7);
          regions[region] = (regions[region] || 0) + 1;
        } else if (demo.startsWith('city:')) {
          const city = demo.substring(5);
          cities[city] = (cities[city] || 0) + 1;
        }
      });
    });

    // Convert to data points with percentages
    const countryTotal = Object.values(countries).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    const regionTotal = Object.values(regions).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    const cityTotal = Object.values(cities).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;

    return {
      countries: this.convertToDataPoints(countries, countryTotal),
      regions: this.convertToDataPoints(regions, regionTotal),
      cities: this.convertToDataPoints(cities, cityTotal),
    };
  }

  /**
   * Process device data from analytics
   * @param analytics Array of analytics records
   */
  private processDeviceData(analytics: MerchantAnalytics[]) {
    const deviceTypes = {};
    const browsers = {};
    const operatingSystems = {};

    // Aggregate device data
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        if (demo.startsWith('device:')) {
          const device = demo.substring(7);
          deviceTypes[device] = (deviceTypes[device] || 0) + 1;
        } else if (demo.startsWith('browser:')) {
          const browser = demo.substring(8);
          browsers[browser] = (browsers[browser] || 0) + 1;
        } else if (demo.startsWith('os:')) {
          const os = demo.substring(3);
          operatingSystems[os] = (operatingSystems[os] || 0) + 1;
        }
      });
    });

    // Convert to data points with percentages
    const deviceTotal = Object.values(deviceTypes).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    const browserTotal = Object.values(browsers).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    const osTotal = Object.values(operatingSystems).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;

    return {
      deviceTypes: this.convertToDataPoints(deviceTypes, deviceTotal),
      browsers: this.convertToDataPoints(browsers, browserTotal),
      operatingSystems: this.convertToDataPoints(operatingSystems, osTotal),
    };
  }

  /**
   * Process gender data from analytics
   * @param analytics Array of analytics records
   */
  private processGenderData(analytics: MerchantAnalytics[]) {
    const genders = {};

    // Aggregate gender data
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        if (demo.startsWith('gender:')) {
          const gender = demo.substring(7);
          genders[gender] = (genders[gender] || 0) + 1;
        }
      });
    });

    // Convert to data points with percentages
    const total = Object.values(genders).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    return this.convertToDataPoints(genders, total);
  }

  /**
   * Process interest data from analytics
   * @param analytics Array of analytics records
   */
  private processInterestData(analytics: MerchantAnalytics[]) {
    const interests = {};

    // Aggregate interest data
    analytics.forEach(record => {
      if (!record.demographics) return;

      record.demographics.forEach(demo => {
        if (demo.startsWith('interest:')) {
          const interest = demo.substring(9);
          interests[interest] = (interests[interest] || 0) + 1;
        }
      });
    });

    // Convert to data points with percentages
    const total = Object.values(interests).reduce(
      (sum: number, val: number) => sum + val,
      0,
    ) as number;
    return this.convertToDataPoints(interests, total);
  }

  /**
   * Convert a count object to an array of data points with percentages
   * @param countObj Object with counts
   * @param total Total count for percentage calculation
   */
  private convertToDataPoints(countObj: Record<string, number>, total: number) {
    return Object.entries(countObj)
      .map(([key, value]) => ({
        key,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }

  /**
   * Record demographic data for a user interaction
   * @param merchantId The merchant ID
   * @param demographics Array of demographic data strings
   */
  async recordDemographicData(merchantId: string, demographics: string[]): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      // Update daily record
      await this.updateDemographicRecord(merchantId, today, 'daily', demographics);

      // Also update weekly, monthly, quarterly, and yearly aggregates
      await this.updateTimeFrameAggregates(merchantId, today, demographics);
    } catch (error) {
      this.logger.error(`Failed to record demographic data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update demographic record for a specific time frame
   * @param merchantId The merchant ID
   * @param date Date for the record
   * @param timeFrame Time frame for the record
   * @param demographics Array of demographic data strings
   */
  private async updateDemographicRecord(
    merchantId: string,
    date: Date,
    timeFrame: TimeFrame,
    demographics: string[],
  ): Promise<void> {
    // Find existing record or create new one
    let record = await this.analyticsRepository.findOne({
      where: {
        merchantId,
        date,
        timeFrame,
        productId: IsNull(),
        categoryId: IsNull(),
      },
    });

    if (!record) {
      record = this.analyticsRepository.create({
        merchantId,
        date,
        timeFrame,
        productId: null,
        categoryId: null,
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

    // Add demographics if provided
    if (demographics && demographics.length > 0) {
      if (!record.demographics) {
        record.demographics = [];
      }
      record.demographics = [...record.demographics, ...demographics];
    }

    await this.analyticsRepository.save(record);
  }

  /**
   * Update time frame aggregates for demographic data
   * @param merchantId The merchant ID
   * @param date Date for the record
   * @param demographics Array of demographic data strings
   */
  private async updateTimeFrameAggregates(
    merchantId: string,
    date: Date,
    demographics: string[],
  ): Promise<void> {
    // Update weekly record
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to start of week (Sunday)
    await this.updateDemographicRecord(merchantId, weekStart, 'weekly', demographics);

    // Update monthly record
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    await this.updateDemographicRecord(merchantId, monthStart, 'monthly', demographics);

    // Update quarterly record
    const quarter = Math.floor(date.getMonth() / 3);
    const quarterStart = new Date(date.getFullYear(), quarter * 3, 1);
    await this.updateDemographicRecord(merchantId, quarterStart, 'quarterly', demographics);

    // Update yearly record
    const yearStart = new Date(date.getFullYear(), 0, 1);
    await this.updateDemographicRecord(merchantId, yearStart, 'yearly', demographics);
  }
}
