import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';

/**
 * User preference data for personalization
 */
export interface UserPreferences {
  userId: string;
  categories: { [category: string]: number };
  brands: { [brand: string]: number };
  priceRanges: { min: number; max: number; weight: number }[];
  values: { [value: string]: number };
  recentSearches: { term: string; timestamp: number }[];
  recentlyViewedProducts: { productId: string; timestamp: number }[];
  purchaseHistory: { productId: string; timestamp: number }[];
  lastUpdated: number;
  additionalData?: Record<string, any>;
}

/**
 * User interaction event types for preference learning
 */
export enum UserInteractionType {
  SEARCH = 'search',
  VIEW_PRODUCT = 'view_product',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  FILTER_APPLY = 'filter_apply',
  SORT_APPLY = 'sort_apply',
  CLICK_CATEGORY = 'click_category',
  CLICK_BRAND = 'click_brand',
  SEARCH_RESULT_IMPRESSION = 'search_result_impression',
  SEARCH_RESULT_DWELL_TIME = 'search_result_dwell_time',
}

/**
 * User interaction event data
 */
export interface UserInteraction {
  userId: string;
  type: UserInteractionType;
  timestamp: number;
  sessionId?: string;
  sessionDuration?: number;
  data: Record<string, any>;
}

/**
 * Service for managing and applying user preferences in search
 */
@Injectable()
export class UserPreferenceService {
  private readonly logger = new Logger(UserPreferenceService.name);
  private readonly preferencesCache: Map<string, UserPreferences> = new Map();
  private readonly preferencesIndex: string;
  private readonly interactionsIndex: string;
  private readonly cacheTimeMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    this.preferencesIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.interactionsIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_INTERACTIONS_INDEX',
      'user_interactions',
    );
    this.cacheTimeMs = this.configService.get<number>(
      'USER_PREFERENCES_CACHE_TIME_MS',
      30 * 60 * 1000,
    ); // 30 minutes

    this.initializeIndices();
  }

  /**
   * Initialize Elasticsearch indices for user preferences and interactions
   */
  private async initializeIndices(): Promise<void> {
    try {
      // Check if preferences index exists
      const preferencesExists = await this.indexExists(this.preferencesIndex);
      if (!preferencesExists) {
        await this.createPreferencesIndex();
      }

      // Check if interactions index exists
      const interactionsExists = await this.indexExists(this.interactionsIndex);
      if (!interactionsExists) {
        await this.createInteractionsIndex();
      }

      this.logger.log('User preference indices initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize user preference indices: ${error.message}`);
    }
  }

  /**
   * Check if an index exists in Elasticsearch
   */
  private async indexExists(indexName: string): Promise<boolean> {
    try {
      const response = await this.elasticsearchService.indices.exists({
        index: indexName,
      });

      // Handle both Elasticsearch 7.x and 8.x response formats
      if (typeof response === 'boolean') {
        return response;
      }

      // Using any type to safely access statusCode
      return (response as any)?.statusCode === 200;
    } catch (error) {
      this.logger.error(`Error checking if index ${indexName} exists: ${error.message}`);
      return false;
    }
  }

  /**
   * Create the preferences index with appropriate mappings
   */
  private async createPreferencesIndex(): Promise<void> {
    try {
      await this.elasticsearchService.indices.create({
        index: this.preferencesIndex,
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              categories: { type: 'object' },
              brands: { type: 'object' },
              priceRanges: {
                type: 'nested',
                properties: {
                  min: { type: 'float' },
                  max: { type: 'float' },
                  weight: { type: 'float' },
                },
              },
              values: { type: 'object' },
              recentSearches: {
                type: 'nested',
                properties: {
                  term: { type: 'text' },
                  timestamp: { type: 'long' },
                },
              },
              recentlyViewedProducts: {
                type: 'nested',
                properties: {
                  productId: { type: 'keyword' },
                  timestamp: { type: 'long' },
                },
              },
              purchaseHistory: {
                type: 'nested',
                properties: {
                  productId: { type: 'keyword' },
                  timestamp: { type: 'long' },
                },
              },
              lastUpdated: { type: 'long' },
            },
          },
        },
      });

      this.logger.log(`Created preferences index: ${this.preferencesIndex}`);
    } catch (error) {
      this.logger.error(`Failed to create preferences index: ${error.message}`);
    }
  }

  /**
   * Create the interactions index with appropriate mappings
   */
  private async createInteractionsIndex(): Promise<void> {
    try {
      await this.elasticsearchService.indices.create({
        index: this.interactionsIndex,
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              type: { type: 'keyword' },
              timestamp: { type: 'long' },
              data: { type: 'object' },
            },
          },
        },
      });

      this.logger.log(`Created interactions index: ${this.interactionsIndex}`);
    } catch (error) {
      this.logger.error(`Failed to create interactions index: ${error.message}`);
    }
  }

  /**
   * Get user preferences for a specific user
   * @param userId The user ID
   * @returns The user preferences or null if not found
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Check cache first
    const cachedPreferences = this.preferencesCache.get(userId);
    const now = Date.now();

    if (cachedPreferences && now - cachedPreferences.lastUpdated < this.cacheTimeMs) {
      return cachedPreferences;
    }

    try {
      // Fetch from Elasticsearch
      const response = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          query: {
            term: {
              userId: userId,
            },
          },
        },
      });

      // Handle both Elasticsearch 7.x and 8.x response formats
      let hits;
      if ('hits' in response) {
        hits = response.hits;
      } else {
        const anyResponse = response as any;
        hits = anyResponse.body?.hits;
      }

      if (hits?.hits?.length > 0) {
        const preferences = hits.hits[0]._source as UserPreferences;
        this.preferencesCache.set(userId, preferences);
        return preferences;
      }

      // Create default preferences if not found
      const defaultPreferences = this.createDefaultPreferences(userId);
      await this.saveUserPreferences(defaultPreferences);
      this.preferencesCache.set(userId, defaultPreferences);

      return defaultPreferences;
    } catch (error) {
      this.logger.error(`Failed to get user preferences for ${userId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Create default preferences for a new user
   */
  private createDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      categories: {},
      brands: {},
      priceRanges: [],
      values: {},
      recentSearches: [],
      recentlyViewedProducts: [],
      purchaseHistory: [],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Save user preferences to Elasticsearch
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      // Update lastUpdated timestamp
      preferences.lastUpdated = Date.now();

      // Check if document exists
      const exists = await this.userPreferencesExist(preferences.userId);

      if (exists) {
        // Update existing document
        await this.elasticsearchService.update({
          index: this.preferencesIndex,
          id: preferences.userId,
          body: {
            doc: preferences,
          },
        });
      } else {
        // Create new document
        await this.elasticsearchService.index({
          index: this.preferencesIndex,
          id: preferences.userId,
          body: preferences,
        });
      }

      // Update cache
      this.preferencesCache.set(preferences.userId, preferences);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to save user preferences for ${preferences.userId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Check if user preferences exist in Elasticsearch
   */
  private async userPreferencesExist(userId: string): Promise<boolean> {
    try {
      const response = await this.elasticsearchService.exists({
        index: this.preferencesIndex,
        id: userId,
      });

      // Handle both Elasticsearch 7.x and 8.x response formats
      if (typeof response === 'boolean') {
        return response;
      }

      // Using any type to safely access statusCode
      return (response as any)?.statusCode === 200;
    } catch (error) {
      this.logger.error(`Error checking if user preferences exist for ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Record a user interaction and update preferences
   */
  async recordInteraction(interaction: UserInteraction): Promise<boolean> {
    try {
      // Extract session information from the data if available
      if (interaction.data.sessionId && !interaction.sessionId) {
        interaction.sessionId = interaction.data.sessionId;
      }

      if (interaction.data.sessionDuration && !interaction.sessionDuration) {
        interaction.sessionDuration = interaction.data.sessionDuration;
      }

      // Log session information for debugging
      if (interaction.sessionId) {
        this.logger.debug(
          `Recording interaction for user ${interaction.userId} in session ${interaction.sessionId}`,
        );
      }

      // Save interaction to Elasticsearch
      await this.elasticsearchService.index({
        index: this.interactionsIndex,
        body: interaction,
      });

      // Update user preferences based on interaction
      await this.updatePreferencesFromInteraction(interaction);

      return true;
    } catch (error) {
      this.logger.error(`Failed to record user interaction: ${error.message}`);
      return false;
    }
  }

  /**
   * Update user preferences based on an interaction
   */
  private async updatePreferencesFromInteraction(interaction: UserInteraction): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(interaction.userId);
      if (!preferences) return;

      switch (interaction.type) {
        case UserInteractionType.SEARCH:
          this.updateFromSearch(preferences, interaction.data);
          break;

        case UserInteractionType.VIEW_PRODUCT:
          this.updateFromProductView(preferences, interaction.data);
          break;

        case UserInteractionType.ADD_TO_CART:
        case UserInteractionType.PURCHASE:
          this.updateFromPurchaseActivity(preferences, interaction.data, interaction.type);
          break;

        case UserInteractionType.FILTER_APPLY:
          this.updateFromFilterApply(preferences, interaction.data);
          break;

        case UserInteractionType.CLICK_CATEGORY:
        case UserInteractionType.CLICK_BRAND:
          this.updateFromCategoryOrBrandClick(preferences, interaction.data, interaction.type);
          break;

        case UserInteractionType.SEARCH_RESULT_IMPRESSION:
          this.updateFromSearchResultImpression(preferences, interaction.data);
          break;

        case UserInteractionType.SEARCH_RESULT_DWELL_TIME:
          this.updateFromSearchResultDwellTime(preferences, interaction.data);
          break;
      }

      // Save updated preferences
      await this.saveUserPreferences(preferences);
    } catch (error) {
      this.logger.error(`Failed to update preferences from interaction: ${error.message}`);
    }
  }

  /**
   * Update preferences from search interaction
   */
  private updateFromSearch(preferences: UserPreferences, data: Record<string, any>): void {
    if (!data.searchTerm) return;

    // Add to recent searches
    const newSearch = {
      term: data.searchTerm,
      timestamp: Date.now(),
    };

    preferences.recentSearches.unshift(newSearch);

    // Keep only the 10 most recent searches
    if (preferences.recentSearches.length > 10) {
      preferences.recentSearches = preferences.recentSearches.slice(0, 10);
    }

    // Update category weights if search was category-specific
    if (data.category) {
      const category = data.category.toLowerCase();
      preferences.categories[category] = (preferences.categories[category] || 0) + 0.2;
    }

    // Update brand weights if search was brand-specific
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.2;
    }

    // Update value weights if search was value-specific
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach((value: string) => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.2;
      });
    }
  }

  /**
   * Update preferences from product view interaction
   */
  private updateFromProductView(preferences: UserPreferences, data: Record<string, any>): void {
    if (!data.productId) return;

    // Add to recently viewed products
    const newView = {
      productId: data.productId,
      timestamp: Date.now(),
    };

    // Check if product was already viewed recently
    const existingIndex = preferences.recentlyViewedProducts.findIndex(
      item => item.productId === data.productId,
    );

    if (existingIndex >= 0) {
      // Remove existing entry
      preferences.recentlyViewedProducts.splice(existingIndex, 1);
    }

    // Add to the beginning of the array
    preferences.recentlyViewedProducts.unshift(newView);

    // Keep only the 20 most recently viewed products
    if (preferences.recentlyViewedProducts.length > 20) {
      preferences.recentlyViewedProducts = preferences.recentlyViewedProducts.slice(0, 20);
    }

    // Update category weights
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((category: string) => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.1;
      });
    }

    // Update brand weight
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.1;
    }

    // Update value weights
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach((value: string) => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.1;
      });
    }

    // Update price range preferences
    if (data.price && typeof data.price === 'number') {
      this.updatePriceRangePreference(preferences, data.price, 0.1);
    }
  }

  /**
   * Update preferences from purchase activity (add to cart or purchase)
   */
  private updateFromPurchaseActivity(
    preferences: UserPreferences,
    data: Record<string, any>,
    type: UserInteractionType,
  ): void {
    if (!data.productId) return;

    // Higher weight for actual purchase vs. add to cart
    const weightMultiplier = type === UserInteractionType.PURCHASE ? 0.5 : 0.2;

    // Add to purchase history if it's a purchase
    if (type === UserInteractionType.PURCHASE) {
      const newPurchase = {
        productId: data.productId,
        timestamp: Date.now(),
      };

      preferences.purchaseHistory.unshift(newPurchase);

      // Keep only the 50 most recent purchases
      if (preferences.purchaseHistory.length > 50) {
        preferences.purchaseHistory = preferences.purchaseHistory.slice(0, 50);
      }
    }

    // Update category weights
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((category: string) => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] =
          (preferences.categories[categoryLower] || 0) + weightMultiplier;
      });
    }

    // Update brand weight
    if (data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + weightMultiplier;
    }

    // Update value weights
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach((value: string) => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + weightMultiplier;
      });
    }

    // Update price range preferences
    if (data.price && typeof data.price === 'number') {
      this.updatePriceRangePreference(preferences, data.price, weightMultiplier);
    }
  }

  /**
   * Update preferences from filter application
   */
  private updateFromFilterApply(preferences: UserPreferences, data: Record<string, any>): void {
    // Update category preferences
    if (data.categories && Array.isArray(data.categories)) {
      data.categories.forEach((category: string) => {
        const categoryLower = category.toLowerCase();
        preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.15;
      });
    }

    // Update brand preferences
    if (data.brands && Array.isArray(data.brands)) {
      data.brands.forEach((brand: string) => {
        const brandLower = brand.toLowerCase();
        preferences.brands[brandLower] = (preferences.brands[brandLower] || 0) + 0.15;
      });
    }

    // Update value preferences
    if (data.values && Array.isArray(data.values)) {
      data.values.forEach((value: string) => {
        const valueLower = value.toLowerCase();
        preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.15;
      });
    }

    // Update price range preferences
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      const existingRangeIndex = preferences.priceRanges.findIndex(
        range => range.min === data.priceMin && range.max === data.priceMax,
      );

      if (existingRangeIndex >= 0) {
        // Update existing range weight
        preferences.priceRanges[existingRangeIndex].weight += 0.15;
      } else {
        // Add new price range
        preferences.priceRanges.push({
          min: data.priceMin,
          max: data.priceMax,
          weight: 0.15,
        });

        // Sort by weight descending
        preferences.priceRanges.sort((a, b) => b.weight - a.weight);

        // Keep only top 5 price ranges
        if (preferences.priceRanges.length > 5) {
          preferences.priceRanges = preferences.priceRanges.slice(0, 5);
        }
      }
    }
  }

  /**
   * Update preferences from search result dwell time
   * This applies a weight based on how long the user spent viewing a result
   */
  private updateFromSearchResultDwellTime(
    preferences: UserPreferences,
    data: Record<string, any>,
  ): void {
    try {
      const { resultId, _query, dwellTimeMs } = data; // Prefixed query with underscore as it's unused
      if (!resultId || !dwellTimeMs) return;

      // Calculate weight based on dwell time
      // The longer a user spends on a page, the more we assume they're interested
      // We cap the weight to prevent outliers (e.g., user left the tab open)

      // Define thresholds for dwell time (in milliseconds)
      const MIN_DWELL_TIME = 5000; // 5 seconds - minimum time to consider meaningful
      const OPTIMAL_DWELL_TIME = 60000; // 60 seconds - optimal engagement time
      const MAX_DWELL_TIME = 300000; // 5 minutes - cap to prevent outliers

      // Only consider dwell times above the minimum threshold
      if (dwellTimeMs < MIN_DWELL_TIME) return;

      // Cap dwell time at maximum threshold
      const cappedDwellTime = Math.min(dwellTimeMs, MAX_DWELL_TIME);

      // Calculate weight on a scale from 0.1 to 1.0
      // 0.1 for minimum threshold, 1.0 for optimal or higher
      const baseWeight =
        0.1 +
        0.9 *
          Math.min((cappedDwellTime - MIN_DWELL_TIME) / (OPTIMAL_DWELL_TIME - MIN_DWELL_TIME), 1.0);

      // Get product details for the result
      // In a real implementation, this would fetch product details from a database or cache
      // For now, we'll use a simplified approach with mock data

      // Mock implementation - in a real system, you would fetch actual product data
      const mockCategories = ['electronics', 'clothing', 'home', 'beauty'];
      const mockBrands = ['apple', 'samsung', 'nike', 'adidas'];

      // Use random categories and brands for demonstration
      // In a real implementation, you would use actual product data
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];

      // Update category preference with weight based on dwell time
      if (randomCategory) {
        preferences.categories[randomCategory] =
          (preferences.categories[randomCategory] || 0) + baseWeight;
      }

      // Update brand preference with weight based on dwell time
      if (randomBrand) {
        preferences.brands[randomBrand] = (preferences.brands[randomBrand] || 0) + baseWeight;
      }

      // Log the dwell time and weight for debugging
      this.logger.debug(
        `Dwell time for ${resultId}: ${dwellTimeMs}ms, applied weight: ${baseWeight.toFixed(2)}`,
      );

      // Update last updated timestamp
      preferences.lastUpdated = Date.now();
    } catch (error) {
      this.logger.error(`Error updating preferences from dwell time: ${error.message}`);
    }
  }

  /**
   * Update preferences from search result impressions
   * This applies a small weight to categories and brands that were shown but not clicked
   */
  private updateFromSearchResultImpression(
    preferences: UserPreferences,
    data: Record<string, any>,
  ): void {
    try {
      const { resultIds, _query } = data; // Prefixed query with underscore as it's unused
      if (!resultIds || !Array.isArray(resultIds) || resultIds.length === 0) return;

      // Get product details for the impressed results
      // In a real implementation, this would fetch product details from a database or cache
      // For now, we'll use a simplified approach with mock data

      // Apply a small weight to categories and brands that were shown but not clicked
      // The weight is much smaller than for clicks (typically 0.1x of a click)
      const impressionWeight = 0.05;

      // Mock implementation - in a real system, you would fetch actual product data
      // and extract categories and brands
      const mockCategories = ['electronics', 'clothing', 'home', 'beauty'];
      const mockBrands = ['apple', 'samsung', 'nike', 'adidas'];

      // Add a small weight to random categories and brands for demonstration
      // In a real implementation, you would use actual product data
      const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];

      // Update category preference with a small weight
      if (randomCategory) {
        preferences.categories[randomCategory] =
          (preferences.categories[randomCategory] || 0) + impressionWeight;
      }

      // Update brand preference with a small weight
      if (randomBrand) {
        preferences.brands[randomBrand] = (preferences.brands[randomBrand] || 0) + impressionWeight;
      }

      // Update last updated timestamp
      preferences.lastUpdated = Date.now();
    } catch (error) {
      this.logger.error(
        `Error updating preferences from search result impression: ${error.message}`,
      );
    }
  }

  /**
   * Update preferences from category or brand click
   */
  private updateFromCategoryOrBrandClick(
    preferences: UserPreferences,
    data: Record<string, any>,
    type: UserInteractionType,
  ): void {
    if (type === UserInteractionType.CLICK_CATEGORY && data.category) {
      const category = data.category.toLowerCase();
      preferences.categories[category] = (preferences.categories[category] || 0) + 0.25;
    } else if (type === UserInteractionType.CLICK_BRAND && data.brand) {
      const brand = data.brand.toLowerCase();
      preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.25;
    }
  }

  /**
   * Update price range preference
   */
  private updatePriceRangePreference(
    preferences: UserPreferences,
    price: number,
    weight: number,
  ): void {
    // Define standard price ranges
    const standardRanges = [
      { min: 0, max: 25 },
      { min: 25, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 500 },
      { min: 500, max: Number.MAX_SAFE_INTEGER },
    ];

    // Find which standard range this price falls into
    for (const range of standardRanges) {
      if (price >= range.min && price < range.max) {
        const existingRangeIndex = preferences.priceRanges.findIndex(
          r => r.min === range.min && r.max === range.max,
        );

        if (existingRangeIndex >= 0) {
          // Update existing range weight
          preferences.priceRanges[existingRangeIndex].weight += weight;
        } else {
          // Add new price range
          preferences.priceRanges.push({
            min: range.min,
            max: range.max,
            weight: weight,
          });
        }

        // Sort by weight descending
        preferences.priceRanges.sort((a, b) => b.weight - a.weight);

        // Keep only top 5 price ranges
        if (preferences.priceRanges.length > 5) {
          preferences.priceRanges = preferences.priceRanges.slice(0, 5);
        }

        break;
      }
    }
  }

  /**
   * Apply user preferences to a search query
   */
  applyPreferencesToQuery(
    query: any,
    preferences: UserPreferences,
    preferenceWeight: number = 1.0,
  ): any {
    // Create a deep copy of the query to avoid modifying the original
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

    // Apply category preferences
    const topCategories = this.getTopItems(preferences.categories, 5);
    for (const [category, weight] of topCategories) {
      functions.push({
        filter: {
          match: {
            categories: category,
          },
        },
        weight: weight * preferenceWeight,
      });
    }

    // Apply brand preferences
    const topBrands = this.getTopItems(preferences.brands, 5);
    for (const [brand, weight] of topBrands) {
      functions.push({
        filter: {
          match: {
            brand: brand,
          },
        },
        weight: weight * preferenceWeight,
      });
    }

    // Apply value preferences
    const topValues = this.getTopItems(preferences.values, 5);
    for (const [value, weight] of topValues) {
      functions.push({
        filter: {
          match: {
            values: value,
          },
        },
        weight: weight * preferenceWeight,
      });
    }

    // Apply price range preferences
    for (const range of preferences.priceRanges.slice(0, 3)) {
      functions.push({
        filter: {
          range: {
            price: {
              gte: range.min,
              lte: range.max,
            },
          },
        },
        weight: range.weight * preferenceWeight,
      });
    }

    // Boost recently viewed products
    if (preferences.recentlyViewedProducts.length > 0) {
      const recentProductIds = preferences.recentlyViewedProducts
        .slice(0, 10)
        .map(item => item.productId);

      functions.push({
        filter: {
          terms: {
            _id: recentProductIds,
          },
        },
        weight: 1.0 * preferenceWeight,
      });
    }

    return enhancedQuery;
  }

  /**
   * Get top items from a weighted map
   */
  private getTopItems(items: { [key: string]: number }, limit: number): Array<[string, number]> {
    return Object.entries(items)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  /**
   * Clear user preferences cache
   */
  clearCache(): void {
    this.preferencesCache.clear();
    this.logger.log('User preferences cache cleared');
  }
}
