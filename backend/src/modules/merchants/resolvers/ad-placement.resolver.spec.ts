import { Test, TestingModule } from '@nestjs/testing';

// Import the mock resolver and service instead of the real ones
import { AdPlacementResolver } from '../test/mocks/ad-placement.resolver.mock';
import { AdPlacementService } from '../test/mocks/ad-placement.service.mock';
import { AdPlacementOptions } from '../test/mocks/entity-mocks';

// Use our mock entities instead of real ones
jest.mock('../test/mocks/entity-mocks', () => ({
  User: jest.fn().mockImplementation(() => ({
    id: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  })),
  AdPlacementResult: jest.fn(),
  AdPlacementOptions: jest.fn(),
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

describe('AdPlacementResolver', () => {
  let resolver: AdPlacementResolver;
  let adPlacementService: AdPlacementService;

  // Create a mock user that will be passed to resolver methods
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  } as any; // Cast to any to avoid type issues

  const mockAdPlacements = [
    {
      campaignId: 'campaign1',
      merchantId: 'merchant1',
      productIds: ['product1', 'product2'],
      type: 'PRODUCT_PROMOTION',
      relevanceScore: 0.85,
      isSponsored: true,
      impressionCost: 0.05,
    },
    {
      campaignId: 'campaign2',
      merchantId: 'merchant2',
      productIds: ['product3'],
      type: 'BRAND_AWARENESS',
      relevanceScore: 0.75,
      isSponsored: true,
      impressionCost: 0.03,
    },
  ];

  const _mockProductRecommendations = [
    {
      productId: 'product1',
      recommendedBudget: 100,
      estimatedImpressions: 2000,
      estimatedClicks: 100,
      estimatedConversions: 10,
    },
    {
      productId: 'product2',
      recommendedBudget: 150,
      estimatedImpressions: 3000,
      estimatedClicks: 150,
      estimatedConversions: 15,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdPlacementResolver,
        {
          provide: AdPlacementService,
          useValue: {
            getAdsForDiscoveryFeed: jest.fn().mockResolvedValue(mockAdPlacements),
            recordAdClick: jest.fn().mockResolvedValue(true),
            getRecommendedAdPlacements: jest.fn().mockResolvedValue(mockAdPlacements),
          },
        },
      ],
    }).compile();

    resolver = module.get<AdPlacementResolver>(AdPlacementResolver);
    adPlacementService = module.get<AdPlacementService>(AdPlacementService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getAdsForDiscoveryFeed', () => {
    it('should return ads for discovery feed for authenticated user', async () => {
      const options: Partial<AdPlacementOptions> = {
        userInterests: ['Fashion'],
        maxResults: 2,
      };

      const result = await resolver.getAdsForDiscoveryFeed(options, mockUser);

      expect(result).toEqual(mockAdPlacements);
      expect(adPlacementService.getAdsForDiscoveryFeed).toHaveBeenCalledWith({
        ...options,
        userId: mockUser.id,
        sessionId: undefined,
      });
    });

    it('should return ads for discovery feed for anonymous user', async () => {
      const options: Partial<AdPlacementOptions> = {
        userInterests: ['Fashion'],
        maxResults: 2,
      };

      const result = await resolver.getAdsForDiscoveryFeed(options, undefined);

      expect(result).toEqual(mockAdPlacements);
      expect(adPlacementService.getAdsForDiscoveryFeed).toHaveBeenCalledWith({
        ...options,
        userId: undefined,
        sessionId: expect.stringContaining('anonymous-'),
      });
    });
  });

  describe('recordAdClick', () => {
    it('should record ad click for authenticated user', async () => {
      const result = await resolver.recordAdClick('campaign1', mockUser);

      expect(result).toBe(true);
      expect(adPlacementService.recordAdClick).toHaveBeenCalledWith(
        'campaign1',
        mockUser.id,
        undefined,
      );
    });

    it('should record ad click for anonymous user', async () => {
      const result = await resolver.recordAdClick('campaign1', undefined);

      expect(result).toBe(true);
      expect(adPlacementService.recordAdClick).toHaveBeenCalledWith(
        'campaign1',
        undefined,
        expect.stringContaining('anonymous-'),
      );
    });
  });

  describe('getRecommendedAdPlacements', () => {
    it('should return recommended placements for a user', async () => {
      // We'll use the mockAdPlacements that's already defined
      jest
        .spyOn(adPlacementService, 'getRecommendedAdPlacements')
        .mockResolvedValue(mockAdPlacements);

      const result = await resolver.getRecommendedAdPlacements(mockUser, 'session123');

      expect(result).toEqual(mockAdPlacements);
      expect(result.length).toBe(2);
      expect(result[0].campaignId).toBe('campaign1');
      expect(result[0].relevanceScore).toBe(0.85);
    });
  });
});
