import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserPreferenceService, UserPreferences } from './user-preference.service';
import {} from /* Product */ '../../products/entities/product.entity';

/**
 * Service for implementing collaborative filtering to enhance personalization
 * without relying on external data sources.
 */
@Injectable()
export class CollaborativeFilteringService {
  private readonly logger = new Logger(CollaborativeFilteringService.name);
  private readonly similarityThreshold: number;
  private readonly maxSimilarUsers: number;
  private readonly interactionsIndex: string;
  private readonly preferencesIndex: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly userPreferenceService: UserPreferenceService,
  ) {
    this.similarityThreshold = this.configService.get<number>('SIMILARITY_THRESHOLD', 0.3);
    this.maxSimilarUsers = this.configService.get<number>('MAX_SIMILAR_USERS', 10);
    this.interactionsIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_INTERACTIONS_INDEX',
      'user_interactions',
    );
    this.preferencesIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
  }

  /**
   * Find similar users based on preference and interaction data
   *
   * @param userId The user ID to find similar users for
   * @returns Array of similar user IDs with similarity scores
   */
  /**
   * Get related categories based on collaborative filtering
   *
   * @param category The category to find related categories for
   * @returns Array of related categories with similarity scores
   */
  getRelatedCategories(category: string): Array<{ category: string; similarity: number }> {
    try {
      // This is a simplified implementation
      // In a real system, this would use more sophisticated collaborative filtering
      // based on user interactions and category co-occurrences

      // For now, return a hardcoded set of related categories based on common relationships
      const relatedCategoriesMap: Record<
        string,
        Array<{ category: string; similarity: number }>
      > = {
        electronics: [
          { category: 'computers', similarity: 0.8 },
          { category: 'accessories', similarity: 0.7 },
          { category: 'phones', similarity: 0.6 },
        ],
        clothing: [
          { category: 'shoes', similarity: 0.8 },
          { category: 'accessories', similarity: 0.7 },
          { category: 'outerwear', similarity: 0.6 },
        ],
        home: [
          { category: 'furniture', similarity: 0.8 },
          { category: 'kitchen', similarity: 0.7 },
          { category: 'decor', similarity: 0.6 },
        ],
        beauty: [
          { category: 'skincare', similarity: 0.8 },
          { category: 'makeup', similarity: 0.7 },
          { category: 'haircare', similarity: 0.6 },
        ],
      };

      // Return related categories if they exist, otherwise empty array
      return relatedCategoriesMap[category.toLowerCase()] || [];
    } catch (error) {
      this.logger.error(`Error getting related categories: ${error.message}`);
      return [];
    }
  }

  async findSimilarUsers(userId: string): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // Get the user's preferences
      const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!userPreferences) {
        this.logger.debug(`No preferences found for user ${userId}`);
        return [];
      }

      // Extract key preference features for similarity calculation
      const userFeatures = this.extractPreferenceFeatures(userPreferences);

      // Find similar users using Elasticsearch's more_like_this query
      const result = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must_not: [
                { term: { userId } }, // Exclude the current user
              ],
              should: [
                // Find users with similar categories
                ...Object.keys(userPreferences.categories)
                  .filter(category => userPreferences.categories[category] > 1)
                  .map(category => ({
                    match: {
                      [`categories.${category}`]: {
                        query: userPreferences.categories[category],
                        boost: 2.0,
                      },
                    },
                  })),

                // Find users with similar brands
                ...Object.keys(userPreferences.brands)
                  .filter(brand => userPreferences.brands[brand] > 1)
                  .map(brand => ({
                    match: {
                      [`brands.${brand}`]: { query: userPreferences.brands[brand], boost: 1.5 },
                    },
                  })),

                // Find users with similar price ranges
                ...userPreferences.priceRanges.map(range => ({
                  range: {
                    'priceRanges.min': { gte: range.min * 0.8, lte: range.min * 1.2 },
                  },
                })),
                ...userPreferences.priceRanges.map(range => ({
                  range: {
                    'priceRanges.max': { gte: range.max * 0.8, lte: range.max * 1.2 },
                  },
                })),
              ],
              minimum_should_match: 2,
            },
          },
          size: this.maxSimilarUsers * 2, // Get more than we need for filtering
        },
      });

      // Process results
      const similarUsers = [];
      const hits = (result.hits?.hits || []) as any[];

      for (const hit of hits) {
        const similarUserPreferences = hit._source as UserPreferences;
        const similarUserId = similarUserPreferences.userId;

        // Calculate similarity score
        const similarUserFeatures = this.extractPreferenceFeatures(similarUserPreferences);
        const similarity = this.calculateCosineSimilarity(userFeatures, similarUserFeatures);

        if (similarity >= this.similarityThreshold) {
          similarUsers.push({
            userId: similarUserId,
            similarity,
          });
        }
      }

      // Sort by similarity and limit to max number
      return similarUsers
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, this.maxSimilarUsers);
    } catch (error) {
      this.logger.error(`Error finding similar users for ${userId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Enhance user preferences with collaborative filtering
   *
   * @param userId The user ID to enhance preferences for
   * @returns True if preferences were enhanced successfully
   */
  async enhanceUserPreferences(userId: string): Promise<boolean> {
    try {
      // Get the user's current preferences
      const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!userPreferences) {
        this.logger.debug(`No preferences found for user ${userId}`);
        return false;
      }

      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId);
      if (similarUsers.length === 0) {
        this.logger.debug(`No similar users found for user ${userId}`);
        return false;
      }

      // Get preferences of similar users
      const similarUserPreferences = await Promise.all(
        similarUsers.map(async similar => {
          const prefs = await this.userPreferenceService.getUserPreferences(similar.userId);
          return { preferences: prefs, similarity: similar.similarity };
        }),
      );

      // Filter out any null preferences
      const validSimilarPreferences = similarUserPreferences.filter(
        item => item.preferences !== null,
      );

      if (validSimilarPreferences.length === 0) {
        return false;
      }

      // Enhance categories
      this.enhancePreferenceMap(
        userPreferences.categories,
        validSimilarPreferences.map(item => ({
          map: item.preferences.categories,
          weight: item.similarity,
        })),
        0.5, // Lower weight for collaborative suggestions
      );

      // Enhance brands
      this.enhancePreferenceMap(
        userPreferences.brands,
        validSimilarPreferences.map(item => ({
          map: item.preferences.brands,
          weight: item.similarity,
        })),
        0.5,
      );

      // Enhance values/attributes
      this.enhancePreferenceMap(
        userPreferences.values,
        validSimilarPreferences.map(item => ({
          map: item.preferences.values,
          weight: item.similarity,
        })),
        0.4,
      );

      // Add price ranges from similar users
      const existingRanges = new Set(
        userPreferences.priceRanges.map(range => `${range.min}-${range.max}`),
      );

      for (const { preferences, similarity } of validSimilarPreferences) {
        for (const range of preferences.priceRanges) {
          const rangeKey = `${range.min}-${range.max}`;
          if (!existingRanges.has(rangeKey)) {
            userPreferences.priceRanges.push({
              min: range.min,
              max: range.max,
              weight: range.weight * similarity * 0.3, // Lower weight for collaborative price ranges
            });
            existingRanges.add(rangeKey);
          }
        }
      }

      // Sort price ranges by weight
      userPreferences.priceRanges.sort((a, b) => b.weight - a.weight);

      // Keep only top 8 price ranges
      if (userPreferences.priceRanges.length > 8) {
        userPreferences.priceRanges = userPreferences.priceRanges.slice(0, 8);
      }

      // Store collaborative filtering metadata
      if (!userPreferences.additionalData) {
        userPreferences.additionalData = {};
      }

      userPreferences.additionalData.collaborativeFiltering = {
        appliedAt: Date.now(),
        similarUsersCount: validSimilarPreferences.length,
        averageSimilarity:
          validSimilarPreferences.reduce((sum, item) => sum + item.similarity, 0) /
          validSimilarPreferences.length,
      };

      // Save enhanced preferences
      const result = await this.userPreferenceService.saveUserPreferences(userPreferences);

      this.logger.debug(`Enhanced preferences for user ${userId} using collaborative filtering`);
      return result;
    } catch (error) {
      this.logger.error(`Error enhancing preferences for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Find products that similar users have interacted with
   *
   * @param userId The user ID
   * @param limit Maximum number of recommendations to return
   * @returns Array of recommended product IDs with scores
   */
  async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<Array<{ productId: string; score: number }>> {
    try {
      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId);
      if (similarUsers.length === 0) {
        return [];
      }

      // Get recently viewed products by the user to exclude them
      const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
      const viewedProductIds =
        userPreferences?.recentlyViewedProducts.map(item => item.productId) || [];
      const purchasedProductIds =
        userPreferences?.purchaseHistory.map(item => item.productId) || [];
      const excludeProductIds = [...new Set([...viewedProductIds, ...purchasedProductIds])];

      // Query for products that similar users have interacted with
      const result = await this.elasticsearchService.search({
        index: this.interactionsIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  terms: {
                    userId: similarUsers.map(user => user.userId),
                  },
                },
                {
                  terms: {
                    type: ['view_product', 'add_to_cart', 'purchase'],
                  },
                },
              ],
              must_not:
                excludeProductIds.length > 0
                  ? [
                      {
                        terms: {
                          'data.productId': excludeProductIds,
                        },
                      },
                    ]
                  : [],
            },
          },
          aggs: {
            products: {
              terms: {
                field: 'data.productId',
                size: limit * 3,
              },
              aggs: {
                interaction_types: {
                  terms: {
                    field: 'type',
                  },
                },
                users: {
                  terms: {
                    field: 'userId',
                    size: similarUsers.length,
                  },
                },
              },
            },
          },
          size: 0,
        },
      });

      // Process aggregation results
      // Handle Elasticsearch aggregation response which may vary by ES version
      const aggregations = result.aggregations as any;
      const productBuckets = (aggregations?.products?.buckets || []) as any[];
      const recommendations = [];

      for (const bucket of productBuckets) {
        const productId = bucket.key;
        const _interactionCount = bucket.doc_count;

        // Calculate a score based on interaction types and user similarity
        let score = 0;

        // Add score based on interaction types
        const interactionTypes = bucket.interaction_types.buckets;
        for (const type of interactionTypes) {
          switch (type.key) {
            case 'purchase':
              score += type.doc_count * 3;
              break;
            case 'add_to_cart':
              score += type.doc_count * 2;
              break;
            case 'view_product':
              score += type.doc_count * 1;
              break;
          }
        }

        // Adjust score based on user similarity
        const userBuckets = bucket.users.buckets;
        for (const userBucket of userBuckets) {
          const userId = userBucket.key;
          const similarUser = similarUsers.find(u => u.userId === userId);
          if (similarUser) {
            score *= 1 + similarUser.similarity;
          }
        }

        recommendations.push({
          productId,
          score,
        });
      }

      // Sort by score and limit
      return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      this.logger.error(
        `Error getting collaborative recommendations for user ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Apply collaborative filtering boosts to a search query
   *
   * @param query The original Elasticsearch query
   * @param userId The user ID
   * @param boostStrength The strength of the collaborative filtering boost
   * @returns Enhanced query with collaborative filtering boosts
   */
  async applyCollaborativeBoosts(
    query: any,
    userId: string,
    boostStrength: number = 1.0,
  ): Promise<any> {
    try {
      // Get collaborative recommendations
      const recommendations = await this.getCollaborativeRecommendations(userId, 20);
      if (recommendations.length === 0) {
        return query;
      }

      // Create a deep copy of the query
      const enhancedQuery = JSON.parse(JSON.stringify(query));

      // Ensure we have a function_score query
      if (!enhancedQuery.query.function_score) {
        enhancedQuery.query = {
          function_score: {
            query: enhancedQuery.query,
            functions: [],
            score_mode: 'sum',
            boost_mode: 'multiply',
          },
        };
      }

      const functions = enhancedQuery.query.function_score.functions;

      // Add boosts for recommended products
      for (const recommendation of recommendations) {
        const normalizedScore = recommendation.score / recommendations[0].score; // Normalize to 0-1 range

        functions.push({
          filter: {
            term: {
              _id: recommendation.productId,
            },
          },
          weight: normalizedScore * boostStrength,
        });
      }

      // Add metadata about collaborative filtering
      if (!enhancedQuery.ext) {
        enhancedQuery.ext = {};
      }

      enhancedQuery.ext.collaborative_filtering = {
        applied: true,
        recommendations_count: recommendations.length,
        boost_strength: boostStrength,
      };

      return enhancedQuery;
    } catch (error) {
      this.logger.error(`Error applying collaborative boosts for user ${userId}: ${error.message}`);
      return query;
    }
  }

  /**
   * Extract numerical features from user preferences for similarity calculation
   */
  private extractPreferenceFeatures(preferences: UserPreferences): number[] {
    const features = [];

    // Add category weights
    const categoryValues = Object.values(preferences.categories);
    const maxCategoryWeight = Math.max(...categoryValues, 1);
    for (let i = 0; i < 10; i++) {
      features.push(i < categoryValues.length ? categoryValues[i] / maxCategoryWeight : 0);
    }

    // Add brand weights
    const brandValues = Object.values(preferences.brands);
    const maxBrandWeight = Math.max(...brandValues, 1);
    for (let i = 0; i < 10; i++) {
      features.push(i < brandValues.length ? brandValues[i] / maxBrandWeight : 0);
    }

    // Add price range features
    if (preferences.priceRanges.length > 0) {
      const avgMin =
        preferences.priceRanges.reduce((sum, range) => sum + range.min, 0) /
        preferences.priceRanges.length;
      const avgMax =
        preferences.priceRanges.reduce((sum, range) => sum + range.max, 0) /
        preferences.priceRanges.length;
      features.push(avgMin / 1000); // Normalize to 0-1 range
      features.push(avgMax / 1000);
    } else {
      features.push(0);
      features.push(0);
    }

    return features;
  }

  /**
   * Calculate cosine similarity between two feature vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Enhance a preference map with values from similar users
   */
  private enhancePreferenceMap(
    targetMap: Record<string, number>,
    sourceMaps: Array<{ map: Record<string, number>; weight: number }>,
    enhancementFactor: number,
  ): void {
    // Create a set of existing keys
    const existingKeys = new Set(Object.keys(targetMap));

    // Process each source map
    for (const { map, weight } of sourceMaps) {
      for (const [key, value] of Object.entries(map)) {
        if (existingKeys.has(key)) {
          // If the key already exists, slightly enhance its weight
          targetMap[key] += value * weight * enhancementFactor * 0.2;
        } else {
          // If the key doesn't exist, add it with a reduced weight
          targetMap[key] = value * weight * enhancementFactor;
          existingKeys.add(key);
        }
      }
    }
  }
}
