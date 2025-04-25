import { Test, TestingModule } from '@nestjs/testing';
import { MerchantRevenueAnalyticsService } from './merchant-revenue-analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

describe('MerchantRevenueAnalyticsService', () => {
  let service: MerchantRevenueAnalyticsService;
  let mockRepository: Partial<Repository<MerchantAnalytics>>;

  beforeEach(async () => {
    // Create mock data for testing
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

    // Create mock repository
    mockRepository = {
      find: jest.fn().mockResolvedValue(mockAnalyticsData),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantRevenueAnalyticsService,
        {
          provide: getRepositoryToken(MerchantAnalytics),
          useValue: mockRepository,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MerchantRevenueAnalyticsService>(MerchantRevenueAnalyticsService);
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
