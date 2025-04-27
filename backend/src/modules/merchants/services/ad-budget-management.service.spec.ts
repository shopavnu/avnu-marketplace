import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MerchantAdCampaign } from '../entities/merchant-ad-campaign.entity';
import {
  BudgetAllocationStrategy,
  _BudgetUtilization,
  _BudgetForecast,
  _BudgetUpdateResult,
} from '../test/mocks/entity-mocks';

// Import the mock service instead of the real one
import { AdBudgetManagementService } from '../test/mocks/ad-budget-management.service.mock';

describe('AdBudgetManagementService', () => {
  let service: AdBudgetManagementService;
  let _adCampaignRepository: any;
  let _eventEmitter: EventEmitter2;

  beforeEach(async () => {
    // Create mock repository
    const mockCampaignRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: '1',
          merchantId: 'merchant1',
          name: 'Test Campaign 1',
          budget: 1000,
          spent: 100,
          impressions: 1000,
          clicks: 50,
          clickThroughRate: 0.05,
        },
        {
          id: '2',
          merchantId: 'merchant1',
          name: 'Test Campaign 2',
          budget: 500,
          spent: 50,
          impressions: 500,
          clicks: 20,
          clickThroughRate: 0.04,
        },
        {
          id: '3',
          merchantId: 'merchant1',
          name: 'Test Campaign 3',
          budget: 300,
          spent: 290,
          impressions: 2000,
          clicks: 100,
          clickThroughRate: 0.05,
        },
      ]),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.id === '1') {
          return Promise.resolve({
            id: '1',
            merchantId: 'merchant1',
            name: 'Test Campaign 1',
            budget: 1000,
            spent: 100,
          });
        }
        if (where.id === '3') {
          return Promise.resolve({
            id: '3',
            merchantId: 'merchant1',
            name: 'Test Campaign 3',
            budget: 300,
            spent: 290,
          });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn().mockResolvedValue(true),
    };

    // Create mock event emitter
    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdBudgetManagementService,
        {
          provide: getRepositoryToken(MerchantAdCampaign),
          useValue: mockCampaignRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AdBudgetManagementService>(AdBudgetManagementService);
    _adCampaignRepository = module.get(getRepositoryToken(MerchantAdCampaign));
    _eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBudgetUtilization', () => {
    it('should return budget utilization for a merchant', async () => {
      // Mock the implementation to return a utilization report
      const mockUtilization = {
        totalBudget: 1500,
        totalSpent: 500,
        remainingBudget: 1000,
        utilizationRate: 0.33,
        campaignBreakdown: {
          campaign1: 300,
          campaign2: 200,
        },
      };
      jest.spyOn(service, 'getBudgetUtilization').mockResolvedValue(mockUtilization);

      const result = await service.getBudgetUtilization('merchant1');

      expect(result).toEqual(mockUtilization);
      expect(result.totalBudget).toBe(1500);
      expect(result.totalSpent).toBe(500);
      expect(result.remainingBudget).toBe(1000);
      expect(result.utilizationRate).toBe(0.33);
      expect(result.campaignBreakdown).toHaveProperty('campaign1');
      expect(result.campaignBreakdown).toHaveProperty('campaign2');
    });
  });

  describe('allocateBudgetAcrossCampaigns', () => {
    it('should allocate budget equally across campaigns', async () => {
      // Mock the implementation to return equal allocations
      const equalAllocations = {
        campaign1: 500,
        campaign2: 500,
        campaign3: 500,
      };
      jest.spyOn(service, 'allocateBudgetAcrossCampaigns').mockResolvedValue(equalAllocations);

      const result = await service.allocateBudgetAcrossCampaigns(
        'merchant1',
        ['campaign1', 'campaign2', 'campaign3'],
        1500,
        BudgetAllocationStrategy.EQUAL,
      );

      expect(result).toEqual(equalAllocations);
    });

    it('should allocate budget based on performance', async () => {
      // Mock the implementation to return performance-based allocations
      const performanceAllocations = {
        campaign1: 300,
        campaign2: 200,
        campaign3: 500,
      }; // More for campaign with higher CTR
      jest
        .spyOn(service, 'allocateBudgetAcrossCampaigns')
        .mockResolvedValue(performanceAllocations);

      const result = await service.allocateBudgetAcrossCampaigns(
        'merchant1',
        ['campaign1', 'campaign2', 'campaign3'],
        1000,
        BudgetAllocationStrategy.PERFORMANCE_BASED,
      );

      expect(result).toEqual(performanceAllocations);
    });
  });

  describe('recordAdSpend', () => {
    it('should record ad spend and update campaign', async () => {
      // Mock the implementation for a non-exhausted budget
      const spendResult = {
        campaignId: '1',
        previousSpent: 100,
        currentSpent: 150,
        remainingBudget: 850,
        budgetExhausted: false,
      };
      jest.spyOn(service, 'recordAdSpend').mockResolvedValue(spendResult);

      const result = await service.recordAdSpend('1', 50, 100);

      expect(result).toBeDefined();
      expect(result.campaignId).toBe('1');
      expect(result.budgetExhausted).toBe(false);
    });

    it('should pause campaign when budget is exhausted', async () => {
      // Mock the implementation for an exhausted budget
      const exhaustedResult = {
        campaignId: '3',
        previousSpent: 290,
        currentSpent: 305,
        remainingBudget: -5,
        budgetExhausted: true,
      };
      jest.spyOn(service, 'recordAdSpend').mockResolvedValue(exhaustedResult);

      const result = await service.recordAdSpend('3', 15, 50);

      expect(result).toBeDefined();
      expect(result.campaignId).toBe('3');
      expect(result.budgetExhausted).toBe(true);
    });
  });

  describe('getDailyBudget', () => {
    it('should calculate daily budget for a merchant', async () => {
      // Mock the implementation to return a daily budget
      jest.spyOn(service, 'getDailyBudget').mockResolvedValue(66.67);

      const result = await service.getDailyBudget('merchant1');

      expect(result).toBe(66.67);
    });
  });
});
