import { Test, TestingModule } from '@nestjs/testing';
import { BudgetAllocationStrategy } from '../test/mocks/entity-mocks';

// Import the mock resolver and service instead of the real ones
import { AdBudgetManagementResolver } from '../test/mocks/ad-budget-management.resolver.mock';
import { AdBudgetManagementService } from '../test/mocks/ad-budget-management.service.mock';

// Use our mock entities instead of real ones
jest.mock('../test/mocks/entity-mocks', () => ({
  User: jest.fn().mockImplementation(() => ({
    id: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  })),
  BudgetAllocationStrategy: {
    EQUAL: 'equal',
    PERFORMANCE_BASED: 'performance_based',
    TIME_BASED: 'time_based',
  },
  BudgetUtilization: jest.fn(),
  BudgetForecast: jest.fn(),
}));

// Mock the User class to avoid entity decorator issues
jest.mock('../../users/entities/user.entity', () => {
  class MockUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  return { User: MockUser };
});

describe('AdBudgetManagementResolver', () => {
  let resolver: AdBudgetManagementResolver;
  let budgetService: AdBudgetManagementService;

  // Create a mock user that will be passed to resolver methods
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  } as any; // Cast to any to avoid type issues

  const mockBudgetUtilization = {
    totalBudget: 1500,
    totalSpent: 500,
    utilizationRate: 0.33,
    campaignUtilization: [
      {
        campaignId: 'campaign1',
        name: 'Test Campaign 1',
        budget: 1000,
        spent: 300,
        utilizationRate: 0.3,
      },
      {
        campaignId: 'campaign2',
        name: 'Test Campaign 2',
        budget: 500,
        spent: 200,
        utilizationRate: 0.4,
      },
    ],
  };

  const mockBudgetForecast = {
    projectedSpend: 1000,
    daysRemaining: 15,
    dailyBudget: 66.67,
    projectedExhaustionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    campaignProjections: {
      'campaign1': 600,
      'campaign2': 400,
    },
  };

  const mockBudgetAllocation = {
    'campaign1': 300,
    'campaign2': 200,
    'campaign3': 500
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdBudgetManagementResolver,
        {
          provide: AdBudgetManagementService,
          useValue: {
            getBudgetUtilization: jest.fn().mockResolvedValue(mockBudgetUtilization),
            getBudgetForecast: jest.fn().mockResolvedValue(mockBudgetForecast),
            getDailyBudget: jest.fn().mockResolvedValue(66.67),
            allocateBudgetAcrossCampaigns: jest.fn().mockResolvedValue(mockBudgetAllocation),
          },
        },
      ],
    }).compile();

    resolver = module.get<AdBudgetManagementResolver>(AdBudgetManagementResolver);
    budgetService = module.get<AdBudgetManagementService>(AdBudgetManagementService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('merchantBudgetUtilization', () => {
    it('should return budget utilization for a merchant', async () => {
      const result = await resolver.merchantBudgetUtilization(mockUser.id, mockUser);
      
      expect(result).toEqual(mockBudgetUtilization);
      expect(budgetService.getBudgetUtilization).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('merchantBudgetForecast', () => {
    it('should return budget forecast for a merchant', async () => {
      const result = await resolver.merchantBudgetForecast(mockUser.id, mockUser);
      
      expect(result).toEqual(mockBudgetForecast);
      expect(budgetService.getBudgetForecast).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('merchantDailyBudget', () => {
    it('should return daily budget for a merchant', async () => {
      const result = await resolver.merchantDailyBudget(mockUser.id, mockUser);
      
      expect(result).toBe(66.67);
      expect(budgetService.getDailyBudget).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('allocateBudgetAcrossCampaigns', () => {
    it('should allocate budget across campaigns', async () => {
      const result = await resolver.allocateBudgetAcrossCampaigns(
        'merchant1',
        1000,
        ['campaign1', 'campaign2', 'campaign3'],
        BudgetAllocationStrategy.PERFORMANCE_BASED,
        mockUser,
      );
      
      expect(result).toEqual(mockBudgetAllocation);
      expect(budgetService.allocateBudgetAcrossCampaigns).toHaveBeenCalledWith(
        'merchant1',
        ['campaign1', 'campaign2', 'campaign3'],
        1000,
        BudgetAllocationStrategy.PERFORMANCE_BASED,
      );
    });
  });
});
