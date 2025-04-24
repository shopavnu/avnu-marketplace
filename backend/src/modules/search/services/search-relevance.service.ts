import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPreferenceService, UserPreferences } from './user-preference.service';
import { CollaborativeFilteringService } from './collaborative-filtering.service';
import { PreferenceDecayService } from './preference-decay.service';
import { User } from '../../users/entities/user.entity';

/**
 * Types of search relevance algorithms that can be tested
 */
export enum RelevanceAlgorithm {
  STANDARD = 'standard', // Default Elasticsearch BM25 algorithm
  INTENT_BOOSTED = 'intent', // Intent-based boosting
  USER_PREFERENCE = 'preference', // User preference-based boosting
  HYBRID = 'hybrid', // Combination of multiple approaches
  SEMANTIC = 'semantic', // Semantic similarity-based
}

/**
 * Scoring profile for search relevance
 */
export interface ScoringProfile {
  name: string;
  boostFactors: {
    [field: string]: number;
  };
  functions: Array<{
    type: 'field_value_factor' | 'decay' | 'script_score';
    field?: string;
    factor?: number;
    modifier?:
      | 'none'
      | 'log'
      | 'log1p'
      | 'log2p'
      | 'ln'
      | 'ln1p'
      | 'ln2p'
      | 'square'
      | 'sqrt'
      | 'reciprocal';
    weight?: number;
    params?: Record<string, any>;
    script?: string;
  }>;
  scoreMode: 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min';
  boostMode: 'multiply' | 'replace' | 'sum' | 'avg' | 'max' | 'min';
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    algorithm: RelevanceAlgorithm;
    weight: number; // Percentage of traffic (0-100)
    params?: Record<string, any>;
  }[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  analyticsEventName: string;
}

/**
 * Service for enhancing search relevance with advanced scoring,
 * user preference-based boosting, and A/B testing capabilities
 */
@Injectable()
export class SearchRelevanceService {
  private readonly logger = new Logger(SearchRelevanceService.name);
  private readonly scoringProfiles: Map<string, ScoringProfile> = new Map();
  private readonly activeABTests: ABTestConfig[] = [];
  private readonly userPreferencesCache: Map<string, UserPreferences> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly collaborativeFilteringService: CollaborativeFilteringService,
    private readonly preferenceDecayService: PreferenceDecayService,
  ) {
    this.initializeScoringProfiles();
    this.loadActiveABTests();
  }

  /**
   * Initialize default scoring profiles
   */
  private initializeScoringProfiles(): void {
    // Standard profile - basic BM25 with field boosts
    this.scoringProfiles.set('standard', {
      name: 'standard',
      boostFactors: {
        name: 3.0,
        description: 1.0,
        categories: 2.0,
        brand: 1.5,
        tags: 1.2,
      },
      functions: [],
      scoreMode: 'multiply',
      boostMode: 'multiply',
    });

    // Popularity profile - incorporates view count and rating
    this.scoringProfiles.set('popularity', {
      name: 'popularity',
      boostFactors: {
        name: 2.0,
        description: 0.8,
        categories: 1.5,
        brand: 1.2,
      },
      functions: [
        {
          type: 'field_value_factor',
          field: 'viewCount',
          factor: 0.1,
          modifier: 'log1p',
          weight: 1.0,
        },
        {
          type: 'field_value_factor',
          field: 'rating',
          factor: 1.0,
          modifier: 'sqrt',
          weight: 2.0,
        },
      ],
      scoreMode: 'sum',
      boostMode: 'multiply',
    });

    // Recency profile - boosts newer products
    this.scoringProfiles.set('recency', {
      name: 'recency',
      boostFactors: {
        name: 2.0,
        description: 1.0,
        categories: 1.5,
      },
      functions: [
        {
          type: 'decay',
          field: 'createdAt',
          params: {
            scale: '30d',
            offset: '1d',
            decay: 0.5,
          },
          weight: 2.0,
        },
      ],
      scoreMode: 'multiply',
      boostMode: 'multiply',
    });

    // User preference profile - will be customized per user
    this.scoringProfiles.set('preference', {
      name: 'preference',
      boostFactors: {
        name: 2.0,
        description: 0.8,
      },
      functions: [],
      scoreMode: 'sum',
      boostMode: 'multiply',
    });

    // Intent-based profile - will be customized based on query intent
    this.scoringProfiles.set('intent', {
      name: 'intent',
      boostFactors: {
        name: 2.0,
        description: 0.8,
      },
      functions: [],
      scoreMode: 'sum',
      boostMode: 'multiply',
    });

    // Hybrid profile - combines multiple approaches
    this.scoringProfiles.set('hybrid', {
      name: 'hybrid',
      boostFactors: {
        name: 2.0,
        description: 0.8,
        categories: 1.5,
        brand: 1.2,
      },
      functions: [
        {
          type: 'field_value_factor',
          field: 'rating',
          factor: 0.5,
          modifier: 'sqrt',
          weight: 1.0,
        },
        {
          type: 'decay',
          field: 'createdAt',
          params: {
            scale: '60d',
            offset: '1d',
            decay: 0.5,
          },
          weight: 1.0,
        },
      ],
      scoreMode: 'sum',
      boostMode: 'multiply',
    });

    this.logger.log(`Initialized ${this.scoringProfiles.size} scoring profiles`);
  }

  /**
   * Load active A/B tests from configuration
   */
  private loadActiveABTests(): void {
    // In a real implementation, this would load from a database or config service
    // For now, we'll create a sample A/B test
    const sampleTest: ABTestConfig = {
      id: 'search_relevance_test_1',
      name: 'Search Relevance Algorithm Comparison',
      description: 'Testing different search relevance algorithms',
      variants: [
        {
          id: 'control',
          algorithm: RelevanceAlgorithm.STANDARD,
          weight: 33,
        },
        {
          id: 'preference_based',
          algorithm: RelevanceAlgorithm.USER_PREFERENCE,
          weight: 33,
        },
        {
          id: 'hybrid',
          algorithm: RelevanceAlgorithm.HYBRID,
          weight: 34,
        },
      ],
      startDate: new Date(),
      isActive: true,
      analyticsEventName: 'search_relevance_test',
    };

    this.activeABTests.push(sampleTest);
    this.logger.log(`Loaded ${this.activeABTests.length} active A/B tests`);
  }

  /**
   * Get user preferences for personalization
   * In a real implementation, this would fetch from a database or user service
   * @param userId The user ID to get preferences for
   * @param sessionId Optional session ID for session-based personalization
   */
  async getUserPreferences(userId: string, sessionId?: string): Promise<UserPreferences | null> {
    try {
      // If we have a sessionId, don't use cache as we want real-time session data
      if (!sessionId && this.userPreferencesCache.has(userId)) {
        return this.userPreferencesCache.get(userId)!;
      }

      // Get from service
      const preferences = await this.userPreferenceService.getUserPreferences(userId);

      if (preferences && !sessionId) {
        // Only cache if not using session-based personalization
        this.userPreferencesCache.set(userId, preferences);
      }

      return preferences;
    } catch (error) {
      this.logger.error(`Error getting user preferences: ${error.message}`);
      return null;
    }
  }

  /**
   * Determine if preferences need decay based on last decay timestamp
   *
   * @param preferences The user preferences
   * @returns True if preferences should be decayed
   */
  private shouldApplyDecay(preferences: UserPreferences): boolean {
    if (!preferences.lastUpdated) {
      return true;
    }

    const now = Date.now();
    const lastUpdate = preferences.lastUpdated;
    const decayIntervalMs =
      this.configService.get<number>('PREFERENCE_DECAY_INTERVAL_HOURS', 24) * 60 * 60 * 1000;

    return now - lastUpdate > decayIntervalMs;
  }

  /**
   * Apply scoring profile to Elasticsearch query
   */
  applyScoringProfile(
    query: any,
    profileName: string,
    user?: User,
    intent?: string,
    entities?: Array<{ type: string; value: string; confidence: number }>,
  ): any {
    const profile = this.scoringProfiles.get(profileName);
    if (!profile) {
      this.logger.warn(`Scoring profile ${profileName} not found, using standard`);
      return query;
    }

    // Create a function score query
    const scoredQuery = {
      function_score: {
        query: query,
        functions: [],
        score_mode: profile.scoreMode,
        boost_mode: profile.boostMode,
      },
    };

    const functionScoreQuery = scoredQuery.function_score;

    // Add field boosts
    for (const [field, boost] of Object.entries(profile.boostFactors)) {
      functionScoreQuery.functions.push({
        filter: {
          exists: { field },
        },
        weight: boost,
      });
    }

    // Add predefined functions
    for (const func of profile.functions) {
      functionScoreQuery.functions.push(func);
    }

    // Apply user preference boosting if user is provided
    if (user && profileName === 'preference') {
      this.applyUserPreferenceBoosts(functionScoreQuery, user);
    }

    // Apply intent-based boosting if intent is provided
    if (intent && profileName === 'intent') {
      this.applyIntentBasedBoosts(functionScoreQuery, intent, entities);
    }

    scoredQuery.function_score.query = query;
    return scoredQuery;
  }

  /**
   * Apply user preference-based boosts to the query
   */
  private async applyUserPreferenceBoosts(query: any, user: User): Promise<void> {
    try {
      // Get user preferences
      let preferences = await this.getUserPreferences(user.id);

      if (!preferences) {
        this.logger.log(`No preferences found for user ${user.id}`);
        return;
      }

      // Check if preferences need decay
      if (this.shouldApplyDecay(preferences)) {
        this.logger.log(`Applying preference decay for user ${user.id}`);
        // Use applyDecayToUser instead of the non-existent applyDecay method
        const decayApplied = await this.preferenceDecayService.applyDecayToUser(user.id);
        if (decayApplied) {
          // Reload preferences after decay
          preferences = await this.userPreferenceService.getUserPreferences(user.id);
        }
      }

      const functions = query.functions;

      // Get top categories and brands for enhanced boosting
      const topCategories = this.getTopItems(preferences.categories, 5);
      const topBrands = this.getTopItems(preferences.brands, 5);

      // Add progressive category boosts (higher boost for top categories)
      if (topCategories.length > 0) {
        this.logger.log(`Applying category boosting for user ${user.id}`);

        // Apply higher boosts to top categories (progressive boosting)
        topCategories.forEach(([category, weight], index) => {
          // Calculate a boost factor that decreases with position
          // First item gets highest boost, last gets lowest
          const positionBoost = 1 + (topCategories.length - index) / topCategories.length;

          functions.push({
            filter: {
              match: {
                categories: category,
              },
            },
            weight: Number(weight) * 2.0 * positionBoost, // Enhanced category boost with position factor
          });

          // Add related category boosts based on collaborative filtering
          this.addRelatedCategoryBoosts(functions, category, Number(weight));
        });
      }

      // Add progressive brand boosts (higher boost for top brands)
      if (topBrands.length > 0) {
        this.logger.log(`Applying brand boosting for user ${user.id}`);

        // Apply higher boosts to top brands (progressive boosting)
        topBrands.forEach(([brand, weight], index) => {
          // Calculate a boost factor that decreases with position
          // First item gets highest boost, last gets lowest
          const positionBoost = 1 + (topBrands.length - index) / topBrands.length;

          functions.push({
            filter: {
              match: {
                brand: brand,
              },
            },
            weight: Number(weight) * 1.5 * positionBoost, // Enhanced brand boost with position factor
          });
        });
      }

      // Add price range boosts if available
      if (preferences.priceRanges && preferences.priceRanges.length > 0) {
        preferences.priceRanges.forEach(range => {
          functions.push({
            filter: {
              range: {
                price: {
                  gte: range.min,
                  lte: range.max,
                },
              },
            },
            weight: range.weight * 1.2,
          });
        });
      }

      this.logger.log(`Applied enhanced user preference boosts for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Error applying user preference boosts: ${error.message}`);
    }
  }

  /**
   * Add boosts for related categories based on collaborative filtering
   */
  private addRelatedCategoryBoosts(functions: any[], category: string, weight: number): void {
    try {
      const relatedCategories = this.collaborativeFilteringService.getRelatedCategories(category);
      if (relatedCategories && relatedCategories.length > 0) {
        // Add boosts for related categories with reduced weight
        relatedCategories.forEach(relatedCategory => {
          functions.push({
            filter: {
              match: {
                categories: relatedCategory.category,
              },
            },
            weight: weight * 0.5 * relatedCategory.similarity, // Reduced weight based on similarity
          });
        });
      }
    } catch (error) {
      this.logger.error(`Error adding related category boosts: ${error.message}`);
    }
  }

  /**
   * Get top N items from a preference map, sorted by weight
   */
  private getTopItems(preferenceMap: Record<string, number>, count: number): [string, number][] {
    if (!preferenceMap) return [];

    return Object.entries(preferenceMap)
      .filter(([_, weight]) => Number(weight) > 0)
      .sort(([_, weightA], [__, weightB]) => Number(weightB) - Number(weightA))
      .slice(0, count);
  }

  /**
   * Apply intent-based boosts to the query
   */
  private applyIntentBasedBoosts(
    query: any,
    intent: string,
    entities?: Array<{ type: string; value: string; confidence: number }>,
  ): void {
    const functions = query.functions;

    // Adjust boosts based on intent
    switch (intent) {
      case 'product_search':
        // Standard product search - already covered by default boosts
        break;

      case 'category_browse':
        // Boost category matches
        functions.push({
          filter: { exists: { field: 'categories' } },
          weight: 3.0,
        });
        break;

      case 'brand_specific':
        // Boost brand matches
        functions.push({
          filter: { exists: { field: 'brand' } },
          weight: 3.0,
        });
        break;

      case 'value_driven':
        // Boost value-related fields
        functions.push({
          filter: { exists: { field: 'values' } },
          weight: 3.0,
        });
        break;

      case 'comparison':
        // For comparison, ensure both items appear
        // This is handled at the query level, not in scoring
        break;

      case 'recommendation':
        // Sort by rating for recommendations
        functions.push({
          field_value_factor: {
            field: 'rating',
            factor: 2.0,
            modifier: 'sqrt',
            missing: 1,
          },
        });
        functions.push({
          field_value_factor: {
            field: 'reviewCount',
            factor: 0.1,
            modifier: 'log1p',
            missing: 1,
          },
        });
        break;

      case 'sort':
        // Sorting is handled separately, not in scoring
        break;
    }

    // Apply entity-specific boosts
    if (entities) {
      for (const entity of entities) {
        if (entity.confidence < 0.5) continue; // Skip low confidence entities

        switch (entity.type) {
          case 'category':
            functions.push({
              filter: {
                match: {
                  categories: entity.value,
                },
              },
              weight: entity.confidence * 2.0,
            });
            break;

          case 'brand':
            functions.push({
              filter: {
                match: {
                  brand: entity.value,
                },
              },
              weight: entity.confidence * 2.0,
            });
            break;

          case 'value':
            functions.push({
              filter: {
                match: {
                  values: entity.value,
                },
              },
              weight: entity.confidence * 1.5,
            });
            break;

          case 'color':
            functions.push({
              filter: {
                match: {
                  'attributes.color': entity.value,
                },
              },
              weight: entity.confidence * 1.5,
            });
            break;

          case 'material':
            functions.push({
              filter: {
                match: {
                  'attributes.material': entity.value,
                },
              },
              weight: entity.confidence * 1.3,
            });
            break;
        }
      }
    }
  }

  /**
   * Select an A/B test variant for a user
   * @param testId The A/B test ID
   * @param userId The user ID (for consistent variant assignment)
   * @returns The selected variant or null if test not found
   */
  selectABTestVariant(
    testId: string,
    userId: string,
  ): {
    testId: string;
    variantId: string;
    algorithm: RelevanceAlgorithm;
    params?: Record<string, any>;
    analyticsEventName: string;
  } | null {
    const test = this.activeABTests.find(t => t.id === testId && t.isActive);
    if (!test) return null;

    // Use a hash of the user ID and test ID to consistently assign the same variant
    // to the same user for the duration of the test
    const hash = this.hashString(`${userId}-${testId}`);
    const normalizedHash = hash % 100; // 0-99

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return {
          testId: test.id,
          variantId: variant.id,
          algorithm: variant.algorithm,
          params: variant.params,
          analyticsEventName: test.analyticsEventName,
        };
      }
    }

    // Fallback to first variant if weights don't add up to 100
    return {
      testId: test.id,
      variantId: test.variants[0].id,
      algorithm: test.variants[0].algorithm,
      params: test.variants[0].params,
      analyticsEventName: test.analyticsEventName,
    };
  }

  /**
   * Generate Google Analytics event data for A/B test tracking
   */
  generateAnalyticsData(
    testInfo: {
      testId: string;
      variantId: string;
      analyticsEventName: string;
    },
    searchQuery: string,
    resultCount: number,
  ): Record<string, any> {
    return {
      event: testInfo.analyticsEventName,
      event_category: 'search',
      event_label: searchQuery,
      ab_test_id: testInfo.testId,
      variant_id: testInfo.variantId,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simple string hash function for consistent variant assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all available scoring profiles
   */
  getScoringProfiles(): string[] {
    return Array.from(this.scoringProfiles.keys());
  }

  /**
   * Get all active A/B tests
   */
  getActiveABTests(): ABTestConfig[] {
    return this.activeABTests.filter(test => test.isActive);
  }
}
