declare class MerchantAnalytics {
  id: string;
  merchantId: string;
  date: Date;
  timeFrame: string;
  productId: string | null;
  categoryId: string | null;
  revenue: number;
  orders: number;
  productViews: number;
  organicImpressions: number;
  paidImpressions: number;
  clicks: number;
  addToCarts: number;
  abandonedCarts: number;
  conversionRate: number;
  clickThroughRate: number;
  demographics: string[];
}
declare class MockRepository<T> {
  private data;
  constructor(initialData?: T[]);
  find(options?: any): Promise<T[]>;
}
declare function Between(
  start: Date,
  end: Date,
): {
  constructor: {
    name: string;
  };
  value: Date[];
};
declare class RevenueAnalyticsService {
  private analyticsRepository;
  constructor(analyticsRepository: MockRepository<MerchantAnalytics>);
  getRevenueByTimeFrame(
    merchantId: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      value: number;
    }[]
  >;
  getImpressionsBySourceOverTime(
    merchantId: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      organic: number;
      paid: number;
      total: number;
    }[]
  >;
}
declare class DemographicAnalyticsService {
  private analyticsRepository;
  constructor(analyticsRepository: MockRepository<MerchantAnalytics>);
  getDemographicAnalytics(
    merchantId: string,
    timeFrame?: string,
    startDate?: Date,
    endDate?: Date,
    filters?: any[],
  ): Promise<{
    ageGroups: {
      data: {
        label: string;
        value: number;
      }[];
    };
    location: {
      data: {
        label: string;
        value: number;
      }[];
    };
    devices: {
      data: {
        label: string;
        value: number;
      }[];
    };
    gender: {
      label: string;
      value: number;
    }[];
    interests: {
      label: string;
      value: number;
    }[];
  }>;
}
declare function createTestData(): MerchantAnalytics[];
declare function runAnalyticsTests(): Promise<void>;
