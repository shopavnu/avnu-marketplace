import { Repository } from 'typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
type DemographicFilter = {
  key: string;
  values: string[];
};
export declare class MerchantDemographicAnalyticsService {
  private readonly analyticsRepository;
  private readonly logger;
  constructor(analyticsRepository: Repository<MerchantAnalytics>);
  getDemographicAnalytics(
    merchantId: string,
    timeFrame?: TimeFrame,
    startDate?: Date,
    endDate?: Date,
    filters?: DemographicFilter[],
  ): Promise<{
    ageGroups: {
      distribution: {
        key: string;
        value: number;
        percentage: number;
      }[];
      averageAge: number;
      dominantAgeGroup: any;
    };
    location: {
      countries: {
        key: string;
        value: number;
        percentage: number;
      }[];
      regions: {
        key: string;
        value: number;
        percentage: number;
      }[];
      cities: {
        key: string;
        value: number;
        percentage: number;
      }[];
    };
    devices: {
      deviceTypes: {
        key: string;
        value: number;
        percentage: number;
      }[];
      browsers: {
        key: string;
        value: number;
        percentage: number;
      }[];
      operatingSystems: {
        key: string;
        value: number;
        percentage: number;
      }[];
    };
    gender: {
      key: string;
      value: number;
      percentage: number;
    }[];
    interests: {
      key: string;
      value: number;
      percentage: number;
    }[];
  }>;
  private applyDemographicFilters;
  private extractDemographicValues;
  private processAgeGroupData;
  private getAgeGroupMidpoint;
  private processLocationData;
  private processDeviceData;
  private processGenderData;
  private processInterestData;
  private convertToDataPoints;
  recordDemographicData(merchantId: string, demographics: string[]): Promise<void>;
  private updateDemographicRecord;
  private updateTimeFrameAggregates;
}
export {};
