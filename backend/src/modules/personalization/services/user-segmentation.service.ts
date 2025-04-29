import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import {
  UserSegmentDto,
  PageHeatmapDataDto,
  FunnelStepDto,
  UserSegmentationDataDto,
} from '../dto/user-segmentation.dto';
import { ProductsService } from '../../products/products.service';
import { CategoryService } from '../../products/services/category.service';
import { MerchantService } from '../../merchants/services/merchant.service';

@Injectable()
export class UserSegmentationService {
  private readonly segmentColors = ['#638C6B', '#7EA476', '#9ABD82', '#B7D68E', '#D4EE9A'];

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionInteractionEntity)
    private readonly interactionRepository: Repository<SessionInteractionEntity>,
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly merchantService: MerchantService,
  ) {}

  /**
   * Get user segmentation data for the admin dashboard
   * @param days Number of days to analyze
   * @returns UserSegmentationDataDto with segments, heatmap, and funnel data
   */
  async getUserSegmentationData(days: number = 30): Promise<UserSegmentationDataDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all sessions and interactions within the time period
    const sessions = await this.sessionRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      relations: ['interactions'],
    });

    // Get all interactions within the time period
    const interactions = await this.interactionRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      relations: ['session'],
    });

    // Generate the data for each component
    const segments = await this.generateUserSegments(sessions, interactions);
    const pageHeatmapData = await this.generatePageHeatmap(interactions);
    const funnelData = await this.generateFunnelData(sessions, interactions);

    return {
      segments,
      pageHeatmapData,
      funnelData,
    };
  }

  /**
   * Generate user segments based on interaction patterns
   * @param sessions All sessions in the time period
   * @param interactions All interactions in the time period
   * @returns Array of user segments
   */
  private async generateUserSegments(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
  ): Promise<UserSegmentDto[]> {
    // Group sessions by anonymous user ID
    const userSessions = new Map<string, SessionEntity[]>();
    sessions.forEach(session => {
      if (!session.anonymousUserId) return;

      if (!userSessions.has(session.anonymousUserId)) {
        userSessions.set(session.anonymousUserId, []);
      }
      userSessions.get(session.anonymousUserId).push(session);
    });

    // Group interactions by anonymous user ID
    const userInteractions = new Map<string, SessionInteractionEntity[]>();
    interactions.forEach(interaction => {
      if (!interaction.session?.anonymousUserId) return;

      const userId = interaction.session.anonymousUserId;
      if (!userInteractions.has(userId)) {
        userInteractions.set(userId, []);
      }
      userInteractions.get(userId).push(interaction);
    });

    // Calculate total number of users
    const totalUsers = userSessions.size;

    // Segment 1: Browsers - Users who view products but rarely add to cart
    const browsers = this.identifyBrowsers(userSessions, userInteractions);

    // Segment 2: Researchers - Users who search and filter extensively
    const researchers = this.identifyResearchers(userSessions, userInteractions);

    // Segment 3: Shoppers - Users who add to cart and have high purchase intent
    const shoppers = this.identifyShoppers(userSessions, userInteractions);

    // Segment 4: Returners - Users who visit multiple times
    const returners = this.identifyReturners(userSessions, userInteractions);

    // Calculate percentages
    const segments: UserSegmentDto[] = [
      {
        id: 'browsers',
        name: 'Browsers',
        description: 'Users who browse products but rarely add to cart or purchase',
        count: browsers.size,
        percentage: (browsers.size / totalUsers) * 100,
        color: this.segmentColors[0],
        characteristics: [
          'Multiple product views',
          'Low cart additions',
          'Short session duration',
          'Often first-time visitors',
        ],
        topCategories: await this.getTopCategoriesForSegment(browsers, userInteractions),
        topBrands: await this.getTopBrandsForSegment(browsers, userInteractions),
        avgSessionDuration: this.getAvgSessionDuration(browsers, userSessions),
        conversionRate: 0.02, // Estimated conversion rate
      },
      {
        id: 'researchers',
        name: 'Researchers',
        description:
          'Users who spend significant time researching products before making decisions',
        count: researchers.size,
        percentage: (researchers.size / totalUsers) * 100,
        color: this.segmentColors[1],
        characteristics: [
          'Multiple search queries',
          'Filter usage',
          'Long session duration',
          'Product comparisons',
        ],
        topCategories: await this.getTopCategoriesForSegment(researchers, userInteractions),
        topBrands: await this.getTopBrandsForSegment(researchers, userInteractions),
        avgSessionDuration: this.getAvgSessionDuration(researchers, userSessions),
        conversionRate: 0.15, // Estimated conversion rate
      },
      {
        id: 'shoppers',
        name: 'Shoppers',
        description: 'Users who actively add items to cart and have high purchase intent',
        count: shoppers.size,
        percentage: (shoppers.size / totalUsers) * 100,
        color: this.segmentColors[2],
        characteristics: [
          'Add to cart actions',
          'Checkout page views',
          'Price comparison',
          'Coupon searches',
        ],
        topCategories: await this.getTopCategoriesForSegment(shoppers, userInteractions),
        topBrands: await this.getTopBrandsForSegment(shoppers, userInteractions),
        avgSessionDuration: this.getAvgSessionDuration(shoppers, userSessions),
        conversionRate: 0.35, // Estimated conversion rate
      },
      {
        id: 'returners',
        name: 'Returners',
        description: 'Users who visit the site multiple times before converting',
        count: returners.size,
        percentage: (returners.size / totalUsers) * 100,
        color: this.segmentColors[3],
        characteristics: [
          'Multiple sessions',
          'Returning visits',
          'Saved items',
          'Consistent browsing patterns',
        ],
        topCategories: await this.getTopCategoriesForSegment(returners, userInteractions),
        topBrands: await this.getTopBrandsForSegment(returners, userInteractions),
        avgSessionDuration: this.getAvgSessionDuration(returners, userSessions),
        conversionRate: 0.28, // Estimated conversion rate
      },
    ];

    return segments;
  }

  /**
   * Generate page heatmap data based on click interactions
   * @param interactions All interactions in the time period
   * @returns Array of heatmap data points
   */
  private async generatePageHeatmap(
    interactions: SessionInteractionEntity[],
  ): Promise<PageHeatmapDataDto[]> {
    // Filter for click interactions with coordinates
    const clickInteractions = interactions.filter(
      interaction =>
        interaction.type === 'CLICK' &&
        interaction.data &&
        interaction.data.x !== undefined &&
        interaction.data.y !== undefined,
    );

    // Create a grid (e.g., 50x50) to aggregate clicks
    const gridSize = 50;
    const grid: number[][] = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0));

    // Aggregate clicks into grid cells
    clickInteractions.forEach(interaction => {
      const { x, y } = interaction.data;

      // Normalize coordinates to grid size (assuming x and y are percentages)
      const gridX = Math.floor((x / 100) * gridSize);
      const gridY = Math.floor((y / 100) * gridSize);

      // Increment the count for this grid cell
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        grid[gridY][gridX]++;
      }
    });

    // Convert grid to heatmap data points
    const heatmapData: PageHeatmapDataDto[] = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x] > 0) {
          heatmapData.push({
            x,
            y,
            value: grid[y][x],
          });
        }
      }
    }

    return heatmapData;
  }

  /**
   * Generate funnel data based on user journey steps
   * @param sessions All sessions in the time period
   * @param interactions All interactions in the time period
   * @returns Array of funnel steps
   */
  private async generateFunnelData(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
  ): Promise<FunnelStepDto[]> {
    // Count unique anonymous users who performed each step
    const uniqueVisitors = new Set(sessions.map(session => session.anonymousUserId).filter(Boolean))
      .size;

    // Count users who viewed at least one product
    const productViewers = new Set(
      interactions
        .filter(interaction => interaction.type === 'PRODUCT_VIEW')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;

    // Count users who searched for products
    const searchers = new Set(
      interactions
        .filter(interaction => interaction.type === 'SEARCH')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;

    // Count users who added to cart
    const addToCartUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'ADD_TO_CART')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;

    // Count users who reached checkout
    const checkoutUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'CHECKOUT_START')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;

    // Count users who completed purchase
    const purchaseUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'PURCHASE')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;

    // Create funnel steps
    const funnelData: FunnelStepDto[] = [
      {
        name: 'Site Visitors',
        value: uniqueVisitors,
      },
      {
        name: 'Product Viewers',
        value: productViewers,
      },
      {
        name: 'Searchers',
        value: searchers,
      },
      {
        name: 'Added to Cart',
        value: addToCartUsers,
      },
      {
        name: 'Reached Checkout',
        value: checkoutUsers,
      },
      {
        name: 'Completed Purchase',
        value: purchaseUsers,
      },
    ];

    return funnelData;
  }

  /**
   * Identify users who primarily browse products but rarely add to cart
   */
  private identifyBrowsers(
    userSessions: Map<string, SessionEntity[]>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Set<string> {
    const browsers = new Set<string>();

    userInteractions.forEach((interactions, userId) => {
      const viewCount = interactions.filter(i => i.type === 'PRODUCT_VIEW').length;
      const cartCount = interactions.filter(i => i.type === 'ADD_TO_CART').length;

      // If user has viewed products but rarely adds to cart
      if (viewCount > 5 && cartCount < 2) {
        browsers.add(userId);
      }
    });

    return browsers;
  }

  /**
   * Identify users who search and filter extensively
   */
  private identifyResearchers(
    userSessions: Map<string, SessionEntity[]>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Set<string> {
    const researchers = new Set<string>();

    userInteractions.forEach((interactions, userId) => {
      const searchCount = interactions.filter(i => i.type === 'SEARCH').length;
      const filterCount = interactions.filter(i => i.type === 'FILTER').length;

      // If user has many searches or filter uses
      if (searchCount > 3 || filterCount > 2) {
        researchers.add(userId);
      }
    });

    return researchers;
  }

  /**
   * Identify users who add to cart and have high purchase intent
   */
  private identifyShoppers(
    userSessions: Map<string, SessionEntity[]>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Set<string> {
    const shoppers = new Set<string>();

    userInteractions.forEach((interactions, userId) => {
      const cartCount = interactions.filter(i => i.type === 'ADD_TO_CART').length;
      const checkoutCount = interactions.filter(i => i.type === 'CHECKOUT_START').length;

      // If user adds items to cart or reaches checkout
      if (cartCount > 0 || checkoutCount > 0) {
        shoppers.add(userId);
      }
    });

    return shoppers;
  }

  /**
   * Identify users who visit multiple times
   */
  private identifyReturners(
    userSessions: Map<string, SessionEntity[]>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Set<string> {
    const returners = new Set<string>();

    userSessions.forEach((sessions, userId) => {
      // If user has multiple sessions
      if (sessions.length > 1) {
        returners.add(userId);
      }
    });

    return returners;
  }

  /**
   * Get top categories for a segment
   */
  private async getTopCategoriesForSegment(
    userIds: Set<string>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Promise<string[]> {
    // Count category views for the segment
    const categoryCounts = new Map<string, number>();

    userIds.forEach(userId => {
      const interactions = userInteractions.get(userId) || [];

      interactions.forEach(interaction => {
        if (interaction.type === 'PRODUCT_VIEW' && interaction.data?.categoryId) {
          const categoryId = interaction.data.categoryId;
          categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
        }
      });
    });

    // Sort categories by count
    const sortedCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId]) => categoryId);

    // Get category names
    const categoryNames = await Promise.all(
      sortedCategories.map(async categoryId => {
        try {
          const category = await this.categoryService.findOne(categoryId);
          return category?.name || 'Unknown Category';
        } catch (error) {
          return 'Unknown Category';
        }
      }),
    );

    return categoryNames;
  }

  /**
   * Get top brands for a segment
   */
  private async getTopBrandsForSegment(
    userIds: Set<string>,
    userInteractions: Map<string, SessionInteractionEntity[]>,
  ): Promise<string[]> {
    // Count brand views for the segment
    const brandCounts = new Map<string, number>();

    userIds.forEach(userId => {
      const interactions = userInteractions.get(userId) || [];

      interactions.forEach(interaction => {
        if (interaction.type === 'PRODUCT_VIEW' && interaction.data?.merchantId) {
          const merchantId = interaction.data.merchantId;
          brandCounts.set(merchantId, (brandCounts.get(merchantId) || 0) + 1);
        }
      });
    });

    // Sort brands by count
    const sortedBrands = [...brandCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([merchantId]) => merchantId);

    // Get brand names
    const brandNames = await Promise.all(
      sortedBrands.map(async merchantId => {
        try {
          const merchant = await this.merchantService.findOne(merchantId);
          return merchant?.name || 'Unknown Brand';
        } catch (error) {
          return 'Unknown Brand';
        }
      }),
    );

    return brandNames;
  }

  /**
   * Calculate average session duration for a segment
   */
  private getAvgSessionDuration(
    userIds: Set<string>,
    userSessions: Map<string, SessionEntity[]>,
  ): number {
    let totalDuration = 0;
    let sessionCount = 0;

    userIds.forEach(userId => {
      const sessions = userSessions.get(userId) || [];

      sessions.forEach(session => {
        if (session.duration) {
          totalDuration += session.duration;
          sessionCount++;
        }
      });
    });

    return sessionCount > 0 ? totalDuration / sessionCount : 0;
  }
}
