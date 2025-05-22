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
var SessionService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SessionService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const session_entity_1 = require('../entities/session.entity');
const session_interaction_entity_1 = require('../entities/session-interaction.entity');
const session_interaction_type_enum_1 = require('../enums/session-interaction-type.enum');
let SessionService = (SessionService_1 = class SessionService {
  constructor(sessionRepository, interactionRepository) {
    this.sessionRepository = sessionRepository;
    this.interactionRepository = interactionRepository;
    this.logger = new common_1.Logger(SessionService_1.name);
  }
  async getOrCreateSession(sessionId) {
    try {
      let session = await this.sessionRepository.findOne({
        where: { sessionId },
        relations: ['interactions'],
      });
      if (!session) {
        session = this.sessionRepository.create({
          sessionId,
          startTime: new Date(),
          lastActivityTime: new Date(),
        });
        await this.sessionRepository.save(session);
      }
      return session;
    } catch (error) {
      this.logger.error(`Failed to get or create session: ${error.message}`);
      throw error;
    }
  }
  async trackInteraction(sessionId, type, data, durationMs) {
    try {
      const session = await this.getOrCreateSession(sessionId);
      const interaction = this.interactionRepository.create({
        session,
        type,
        data,
        durationMs,
        timestamp: new Date(),
      });
      await this.interactionRepository.save(interaction);
      session.lastActivityTime = new Date();
      await this.sessionRepository.save(session);
    } catch (error) {
      this.logger.error(`Failed to track interaction: ${error.message}`);
    }
  }
  async getRecentInteractions(sessionId, type, limit = 20) {
    try {
      const queryBuilder = this.interactionRepository
        .createQueryBuilder('interaction')
        .innerJoin('interaction.session', 'session')
        .where('session.sessionId = :sessionId', { sessionId })
        .orderBy('interaction.timestamp', 'DESC')
        .take(limit);
      if (type) {
        queryBuilder.andWhere('interaction.type = :type', { type });
      }
      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Failed to get recent interactions: ${error.message}`);
      return [];
    }
  }
  async getInteractionsByType(type, limit = 100) {
    try {
      return this.interactionRepository.find({
        where: { type },
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Failed to get interactions by type: ${error.message}`);
      return [];
    }
  }
  async calculateSessionWeights(sessionId) {
    try {
      const session = await this.getOrCreateSession(sessionId);
      const interactions = await this.interactionRepository.find({
        where: { session: { id: session.id } },
        order: { timestamp: 'DESC' },
      });
      const weights = {
        entities: {},
        categories: {},
        brands: {},
        queries: {},
        filters: {},
        scrollDepth: {},
        productViews: {},
        viewTime: {},
      };
      interactions.forEach(interaction => {
        const { type, data, durationMs } = interaction;
        const timestamp = new Date(interaction.timestamp).getTime();
        const now = Date.now();
        const hoursSinceInteraction = (now - timestamp) / (1000 * 60 * 60);
        const recencyWeight = Math.max(0, 1 - hoursSinceInteraction / 24);
        let interactionWeight = 0;
        switch (type) {
          case session_interaction_type_enum_1.SessionInteractionType.CLICK:
            interactionWeight = 0.8;
            if (data.resultId) {
              weights.entities[data.resultId] =
                (weights.entities[data.resultId] || 0) + interactionWeight * recencyWeight;
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.DWELL:
            const dwellTimeMinutes = (durationMs || 0) / (1000 * 60);
            interactionWeight = Math.min(1.0, dwellTimeMinutes / 2);
            if (data.resultId) {
              weights.entities[data.resultId] =
                (weights.entities[data.resultId] || 0) + interactionWeight * recencyWeight;
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.IMPRESSION:
            interactionWeight = 0.1;
            if (data.resultIds && Array.isArray(data.resultIds)) {
              data.resultIds.forEach(resultId => {
                weights.entities[resultId] =
                  (weights.entities[resultId] || 0) + interactionWeight * recencyWeight;
              });
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.SEARCH:
            interactionWeight = 0.7;
            if (data.query) {
              weights.queries[data.query] =
                (weights.queries[data.query] || 0) + interactionWeight * recencyWeight;
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.FILTER:
            interactionWeight = 0.6;
            if (data.filterType && data.filterValue) {
              const filterKey = `${data.filterType}:${data.filterValue}`;
              weights.filters[filterKey] =
                (weights.filters[filterKey] || 0) + interactionWeight * recencyWeight;
              if (data.filterType === 'category') {
                weights.categories[data.filterValue] =
                  (weights.categories[data.filterValue] || 0) + interactionWeight * recencyWeight;
              } else if (data.filterType === 'brand') {
                weights.brands[data.filterValue] =
                  (weights.brands[data.filterValue] || 0) + interactionWeight * recencyWeight;
              }
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.VIEW:
            interactionWeight = 0.5;
            if (data.type === 'category' && data.categoryId) {
              weights.categories[data.categoryId] =
                (weights.categories[data.categoryId] || 0) + interactionWeight * recencyWeight;
            } else if (data.type === 'brand' && data.brandId) {
              weights.brands[data.brandId] =
                (weights.brands[data.brandId] || 0) + interactionWeight * recencyWeight;
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.SCROLL_DEPTH:
            const scrollPercentage = data.scrollPercentage || 0;
            interactionWeight = 0.1 + (scrollPercentage / 100) * 0.7;
            if (data.pageType) {
              weights.scrollDepth[data.pageType] = Math.max(
                weights.scrollDepth[data.pageType] || 0,
                scrollPercentage,
              );
            }
            if (data.visibleProductIds && Array.isArray(data.visibleProductIds)) {
              data.visibleProductIds.forEach(productId => {
                weights.entities[productId] =
                  (weights.entities[productId] || 0) + interactionWeight * recencyWeight * 0.3;
              });
            }
            break;
          case session_interaction_type_enum_1.SessionInteractionType.PRODUCT_VIEW:
            const viewTimeSeconds = (data.viewTimeMs || 0) / 1000;
            interactionWeight = Math.min(1.0, viewTimeSeconds / 60) * 0.9;
            if (data.productId) {
              weights.productViews[data.productId] = {
                count: (weights.productViews[data.productId]?.count || 0) + 1,
                totalTime: (weights.productViews[data.productId]?.totalTime || 0) + viewTimeSeconds,
                lastViewed: Date.now(),
              };
              weights.entities[data.productId] =
                (weights.entities[data.productId] || 0) + interactionWeight * recencyWeight;
              weights.viewTime[data.productId] =
                (weights.viewTime[data.productId] || 0) + viewTimeSeconds;
              if (data.categoryId) {
                weights.categories[data.categoryId] =
                  (weights.categories[data.categoryId] || 0) +
                  interactionWeight * recencyWeight * 0.5;
              }
              if (data.brandId) {
                weights.brands[data.brandId] =
                  (weights.brands[data.brandId] || 0) + interactionWeight * recencyWeight * 0.5;
              }
            }
            break;
        }
      });
      return weights;
    } catch (error) {
      this.logger.error(`Failed to calculate session weights: ${error.message}`);
      return {
        entities: {},
        categories: {},
        brands: {},
        queries: {},
        filters: {},
        scrollDepth: {},
        productViews: {},
        viewTime: {},
      };
    }
  }
});
exports.SessionService = SessionService;
exports.SessionService =
  SessionService =
  SessionService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
        __param(
          1,
          (0, typeorm_1.InjectRepository)(session_interaction_entity_1.SessionInteractionEntity),
        ),
        __metadata('design:paramtypes', [typeorm_2.Repository, typeorm_2.Repository]),
      ],
      SessionService,
    );
//# sourceMappingURL=session.service.js.map
