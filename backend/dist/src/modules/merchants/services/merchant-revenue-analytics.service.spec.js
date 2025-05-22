'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const merchant_revenue_analytics_service_1 = require('./merchant-revenue-analytics.service');
const typeorm_1 = require('@nestjs/typeorm');
const merchant_analytics_entity_1 = require('../entities/merchant-analytics.entity');
const common_1 = require('@nestjs/common');
describe('MerchantRevenueAnalyticsService', () => {
  let service;
  let mockRepository;
  beforeEach(async () => {
    const mockAnalyticsData = [
      {
        date: new Date('2025-01-01'),
        revenue: 1000,
        organicImpressions: 500,
        paidImpressions: 300,
      },
      {
        date: new Date('2025-02-01'),
        revenue: 1500,
        organicImpressions: 700,
        paidImpressions: 400,
      },
    ];
    mockRepository = {
      find: jest.fn().mockResolvedValue(mockAnalyticsData),
    };
    const module = await testing_1.Test.createTestingModule({
      providers: [
        merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService,
        {
          provide: (0, typeorm_1.getRepositoryToken)(merchant_analytics_entity_1.MerchantAnalytics),
          useValue: mockRepository,
        },
        {
          provide: common_1.Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getRevenueByTimeFrame', () => {
    it('should return revenue data by time frame', async () => {
      const result = await service.getRevenueByTimeFrame('123', 'monthly');
      expect(result).toHaveLength(2);
      expect(result[0].date).toEqual(new Date('2025-01-01'));
      expect(result[0].value).toEqual(1000);
      expect(result[1].date).toEqual(new Date('2025-02-01'));
      expect(result[1].value).toEqual(1500);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
  describe('getImpressionsBySourceOverTime', () => {
    it('should return impressions data by source', async () => {
      const result = await service.getImpressionsBySourceOverTime('123', 'monthly');
      expect(result).toHaveLength(2);
      expect(result[0].organic).toEqual(500);
      expect(result[0].paid).toEqual(300);
      expect(result[0].total).toEqual(800);
      expect(result[1].organic).toEqual(700);
      expect(result[1].paid).toEqual(400);
      expect(result[1].total).toEqual(1100);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
//# sourceMappingURL=merchant-revenue-analytics.service.spec.js.map
