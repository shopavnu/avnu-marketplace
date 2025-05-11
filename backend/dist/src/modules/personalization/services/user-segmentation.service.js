'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserSegmentationService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const session_entity_1 = require('../entities/session.entity');
const session_interaction_entity_1 = require('../entities/session-interaction.entity');
const products_service_1 = require('../../products/products.service');
const category_service_1 = require('../../products/services/category.service');
const merchant_service_1 = require('../../merchants/services/merchant.service');
let UserSegmentationService = class UserSegmentationService {
  constructor(
    sessionRepository,
    interactionRepository,
    productsService,
    categoryService,
    merchantService,
  ) {
    this.sessionRepository = sessionRepository;
    this.interactionRepository = interactionRepository;
    this.productsService = productsService;
    this.categoryService = categoryService;
    this.merchantService = merchantService;
    this.segmentColors = ['#638C6B', '#7EA476', '#9ABD82', '#B7D68E', '#D4EE9A'];
  }
  async getUserSegmentationData(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const sessions = await this.sessionRepository.find({
      where: {
        createdAt: (0, typeorm_2.Between)(startDate, new Date()),
      },
      relations: ['interactions'],
    });
    const interactions = await this.interactionRepository.find({
      where: {
        createdAt: (0, typeorm_2.Between)(startDate, new Date()),
      },
      relations: ['session'],
    });
    const segments = await this.generateUserSegments(sessions, interactions);
    const pageHeatmapData = await this.generatePageHeatmap(interactions);
    const funnelData = await this.generateFunnelData(sessions, interactions);
    return {
      segments,
      pageHeatmapData,
      funnelData,
    };
  }
  async generateUserSegments(sessions, interactions) {
    const userSessions = new Map();
    sessions.forEach(session => {
      if (!session.anonymousUserId) return;
      if (!userSessions.has(session.anonymousUserId)) {
        userSessions.set(session.anonymousUserId, []);
      }
      userSessions.get(session.anonymousUserId).push(session);
    });
    const userInteractions = new Map();
    interactions.forEach(interaction => {
      if (!interaction.session?.anonymousUserId) return;
      const userId = interaction.session.anonymousUserId;
      if (!userInteractions.has(userId)) {
        userInteractions.set(userId, []);
      }
      userInteractions.get(userId).push(interaction);
    });
    const totalUsers = userSessions.size;
    const browsers = this.identifyBrowsers(userSessions, userInteractions);
    const researchers = this.identifyResearchers(userSessions, userInteractions);
    const shoppers = this.identifyShoppers(userSessions, userInteractions);
    const returners = this.identifyReturners(userSessions, userInteractions);
    const segments = [
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
        conversionRate: 0.02,
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
        conversionRate: 0.15,
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
        conversionRate: 0.35,
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
        conversionRate: 0.28,
      },
    ];
    return segments;
  }
  async generatePageHeatmap(interactions) {
    const clickInteractions = interactions.filter(
      interaction =>
        interaction.type === 'CLICK' &&
        interaction.data &&
        interaction.data.x !== undefined &&
        interaction.data.y !== undefined,
    );
    const gridSize = 50;
    const grid = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0));
    clickInteractions.forEach(interaction => {
      const { x, y } = interaction.data;
      const gridX = Math.floor((x / 100) * gridSize);
      const gridY = Math.floor((y / 100) * gridSize);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        grid[gridY][gridX]++;
      }
    });
    const heatmapData = [];
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
  async generateFunnelData(sessions, interactions) {
    const uniqueVisitors = new Set(sessions.map(session => session.anonymousUserId).filter(Boolean))
      .size;
    const productViewers = new Set(
      interactions
        .filter(interaction => interaction.type === 'PRODUCT_VIEW')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;
    const searchers = new Set(
      interactions
        .filter(interaction => interaction.type === 'SEARCH')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;
    const addToCartUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'ADD_TO_CART')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;
    const checkoutUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'CHECKOUT_START')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;
    const purchaseUsers = new Set(
      interactions
        .filter(interaction => interaction.type === 'PURCHASE')
        .map(interaction => interaction.session?.anonymousUserId)
        .filter(Boolean),
    ).size;
    const funnelData = [
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
  identifyBrowsers(userSessions, userInteractions) {
    const browsers = new Set();
    userInteractions.forEach((interactions, userId) => {
      const viewCount = interactions.filter(i => i.type === 'PRODUCT_VIEW').length;
      const cartCount = interactions.filter(i => i.type === 'ADD_TO_CART').length;
      if (viewCount > 5 && cartCount < 2) {
        browsers.add(userId);
      }
    });
    return browsers;
  }
  identifyResearchers(userSessions, userInteractions) {
    const researchers = new Set();
    userInteractions.forEach((interactions, userId) => {
      const searchCount = interactions.filter(i => i.type === 'SEARCH').length;
      const filterCount = interactions.filter(i => i.type === 'FILTER').length;
      if (searchCount > 3 || filterCount > 2) {
        researchers.add(userId);
      }
    });
    return researchers;
  }
  identifyShoppers(userSessions, userInteractions) {
    const shoppers = new Set();
    userInteractions.forEach((interactions, userId) => {
      const cartCount = interactions.filter(i => i.type === 'ADD_TO_CART').length;
      const checkoutCount = interactions.filter(i => i.type === 'CHECKOUT_START').length;
      if (cartCount > 0 || checkoutCount > 0) {
        shoppers.add(userId);
      }
    });
    return shoppers;
  }
  identifyReturners(userSessions, _userInteractions) {
    const returners = new Set();
    userSessions.forEach((sessions, userId) => {
      if (sessions.length > 1) {
        returners.add(userId);
      }
    });
    return returners;
  }
  async getTopCategoriesForSegment(userIds, userInteractions) {
    const categoryCounts = new Map();
    userIds.forEach(userId => {
      const interactions = userInteractions.get(userId) || [];
      interactions.forEach(interaction => {
        if (interaction.type === 'PRODUCT_VIEW' && interaction.data?.categoryId) {
          const categoryId = interaction.data.categoryId;
          categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
        }
      });
    });
    const sortedCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId]) => categoryId);
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
  async getTopBrandsForSegment(userIds, userInteractions) {
    const brandCounts = new Map();
    userIds.forEach(userId => {
      const interactions = userInteractions.get(userId) || [];
      interactions.forEach(interaction => {
        if (interaction.type === 'PRODUCT_VIEW' && interaction.data?.merchantId) {
          const merchantId = interaction.data.merchantId;
          brandCounts.set(merchantId, (brandCounts.get(merchantId) || 0) + 1);
        }
      });
    });
    const sortedBrands = [...brandCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([merchantId]) => merchantId);
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
  getAvgSessionDuration(userIds, userSessions) {
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
};
exports.UserSegmentationService = UserSegmentationService;
exports.UserSegmentationService = UserSegmentationService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(
      1,
      (0, typeorm_1.InjectRepository)(session_interaction_entity_1.SessionInteractionEntity),
    ),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      typeorm_2.Repository,
      products_service_1.ProductsService,
      category_service_1.CategoryService,
      merchant_service_1.MerchantService,
    ]),
  ],
  UserSegmentationService,
);
//# sourceMappingURL=user-segmentation.service.js.map
