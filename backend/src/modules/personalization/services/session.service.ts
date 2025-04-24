import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';

/**
 * Session interaction types for tracking user behavior within a session
 */
export enum SessionInteractionType {
  SEARCH = 'search',
  CLICK = 'click',
  VIEW = 'view',
  FILTER = 'filter',
  SORT = 'sort',
  IMPRESSION = 'impression',
  DWELL = 'dwell',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
}

/**
 * Session service for managing and tracking user sessions
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionInteractionEntity)
    private readonly interactionRepository: Repository<SessionInteractionEntity>,
  ) {}

  /**
   * Get session by ID or create a new one
   * @param sessionId Session ID
   */
  async getOrCreateSession(sessionId: string): Promise<SessionEntity> {
    try {
      // Try to find existing session
      let session = await this.sessionRepository.findOne({
        where: { sessionId },
        relations: ['interactions'],
      });

      // Create new session if not found
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

  /**
   * Track a user interaction within a session
   * @param sessionId Session ID
   * @param type Interaction type
   * @param data Interaction data
   * @param durationMs Optional duration in milliseconds
   */
  async trackInteraction(
    sessionId: string,
    type: SessionInteractionType,
    data: Record<string, any>,
    durationMs?: number,
  ): Promise<void> {
    try {
      // Get or create session
      const session = await this.getOrCreateSession(sessionId);

      // Create interaction
      const interaction = this.interactionRepository.create({
        session,
        type,
        data,
        durationMs,
        timestamp: new Date(),
      });

      // Save interaction
      await this.interactionRepository.save(interaction);

      // Update session last activity time
      session.lastActivityTime = new Date();
      await this.sessionRepository.save(session);
    } catch (error) {
      this.logger.error(`Failed to track interaction: ${error.message}`);
      // Don't throw error to prevent disrupting user experience
    }
  }

  /**
   * Get recent interactions for a session
   * @param sessionId Session ID
   * @param type Optional interaction type filter
   * @param limit Maximum number of interactions to return
   */
  async getRecentInteractions(
    sessionId: string,
    type?: SessionInteractionType,
    limit: number = 20,
  ): Promise<SessionInteractionEntity[]> {
    try {
      const queryBuilder = this.interactionRepository
        .createQueryBuilder('interaction')
        .innerJoin('interaction.session', 'session')
        .where('session.sessionId = :sessionId', { sessionId })
        .orderBy('interaction.timestamp', 'DESC')
        .take(limit);

      // Add type filter if provided
      if (type) {
        queryBuilder.andWhere('interaction.type = :type', { type });
      }

      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Failed to get recent interactions: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate session-based personalization weights
   * @param sessionId Session ID
   */
  async calculateSessionWeights(sessionId: string): Promise<Record<string, any>> {
    try {
      // Get session
      const session = await this.getOrCreateSession(sessionId);

      // Get all interactions for the session
      const interactions = await this.interactionRepository.find({
        where: { session: { id: session.id } },
        order: { timestamp: 'DESC' },
      });

      // Initialize weights
      const weights: Record<string, any> = {
        entities: {},
        categories: {},
        brands: {},
        queries: {},
        filters: {},
      };

      // Process interactions to calculate weights
      interactions.forEach(interaction => {
        const { type, data, durationMs } = interaction;

        // Calculate base weight based on recency
        // More recent interactions have higher weight
        const timestamp = new Date(interaction.timestamp).getTime();
        const now = Date.now();
        const hoursSinceInteraction = (now - timestamp) / (1000 * 60 * 60);
        const recencyWeight = Math.max(0, 1 - hoursSinceInteraction / 24); // Decay over 24 hours

        // Calculate interaction-specific weight
        let interactionWeight = 0;

        switch (type) {
          case SessionInteractionType.CLICK:
            interactionWeight = 0.8; // High weight for clicks

            // Add entity weight
            if (data.resultId) {
              weights.entities[data.resultId] =
                (weights.entities[data.resultId] || 0) + interactionWeight * recencyWeight;
            }
            break;

          case SessionInteractionType.DWELL:
            // Calculate dwell time weight (capped at 1.0)
            const dwellTimeMinutes = (durationMs || 0) / (1000 * 60);
            interactionWeight = Math.min(1.0, dwellTimeMinutes / 2); // Cap at 2 minutes

            // Add entity weight
            if (data.resultId) {
              weights.entities[data.resultId] =
                (weights.entities[data.resultId] || 0) + interactionWeight * recencyWeight;
            }
            break;

          case SessionInteractionType.IMPRESSION:
            interactionWeight = 0.1; // Low weight for impressions

            // Add entity weights for all impressed results
            if (data.resultIds && Array.isArray(data.resultIds)) {
              data.resultIds.forEach((resultId: string) => {
                weights.entities[resultId] =
                  (weights.entities[resultId] || 0) + interactionWeight * recencyWeight;
              });
            }
            break;

          case SessionInteractionType.SEARCH:
            interactionWeight = 0.7; // High weight for searches

            // Add query weight
            if (data.query) {
              weights.queries[data.query] =
                (weights.queries[data.query] || 0) + interactionWeight * recencyWeight;
            }
            break;

          case SessionInteractionType.FILTER:
            interactionWeight = 0.6; // Medium-high weight for filters

            // Add filter weight
            if (data.filterType && data.filterValue) {
              const filterKey = `${data.filterType}:${data.filterValue}`;
              weights.filters[filterKey] =
                (weights.filters[filterKey] || 0) + interactionWeight * recencyWeight;

              // If filtering by category or brand, add to those weights too
              if (data.filterType === 'category') {
                weights.categories[data.filterValue] =
                  (weights.categories[data.filterValue] || 0) + interactionWeight * recencyWeight;
              } else if (data.filterType === 'brand') {
                weights.brands[data.filterValue] =
                  (weights.brands[data.filterValue] || 0) + interactionWeight * recencyWeight;
              }
            }
            break;

          case SessionInteractionType.VIEW:
            interactionWeight = 0.5; // Medium weight for views

            // Add category or brand weight if applicable
            if (data.type === 'category' && data.categoryId) {
              weights.categories[data.categoryId] =
                (weights.categories[data.categoryId] || 0) + interactionWeight * recencyWeight;
            } else if (data.type === 'brand' && data.brandId) {
              weights.brands[data.brandId] =
                (weights.brands[data.brandId] || 0) + interactionWeight * recencyWeight;
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
      };
    }
  }
}
