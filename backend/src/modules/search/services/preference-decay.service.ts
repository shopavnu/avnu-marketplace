import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserPreferenceService, UserPreferences } from './user-preference.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Service for implementing time-based decay of user preferences
 * to prioritize recent interests over older ones
 */
@Injectable()
export class PreferenceDecayService {
  private readonly logger = new Logger(PreferenceDecayService.name);
  private readonly preferencesIndex: string;
  private readonly decayEnabled: boolean;
  private readonly decayRates: {
    categories: number;
    brands: number;
    values: number;
    priceRanges: number;
  };
  private readonly halfLifeDays: {
    categories: number;
    brands: number;
    values: number;
    priceRanges: number;
  };
  private readonly maxPreferenceAge: number; // in days
  private readonly batchSize: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly userPreferenceService: UserPreferenceService,
  ) {
    this.preferencesIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.decayEnabled = this.configService.get<boolean>('PREFERENCE_DECAY_ENABLED', true);

    // Default half-life values in days for different preference types
    this.halfLifeDays = {
      categories: this.configService.get<number>('PREFERENCE_DECAY_HALFLIFE_CATEGORIES', 30), // 1 month
      brands: this.configService.get<number>('PREFERENCE_DECAY_HALFLIFE_BRANDS', 45), // 1.5 months
      values: this.configService.get<number>('PREFERENCE_DECAY_HALFLIFE_VALUES', 60), // 2 months
      priceRanges: this.configService.get<number>('PREFERENCE_DECAY_HALFLIFE_PRICERANGES', 90), // 3 months
    };

    // Calculate decay rates based on half-life values
    // Formula: decay_rate = ln(2) / half_life_in_ms
    const msInDay = 24 * 60 * 60 * 1000;
    this.decayRates = {
      categories: Math.log(2) / (this.halfLifeDays.categories * msInDay),
      brands: Math.log(2) / (this.halfLifeDays.brands * msInDay),
      values: Math.log(2) / (this.halfLifeDays.values * msInDay),
      priceRanges: Math.log(2) / (this.halfLifeDays.priceRanges * msInDay),
    };

    this.maxPreferenceAge = this.configService.get<number>('PREFERENCE_MAX_AGE_DAYS', 365); // 1 year
    this.batchSize = this.configService.get<number>('PREFERENCE_DECAY_BATCH_SIZE', 100);

    this.logger.log(
      `Preference decay service initialized with decay ${this.decayEnabled ? 'enabled' : 'disabled'}`,
    );
    if (this.decayEnabled) {
      this.logger.log(
        `Half-life days: Categories=${this.halfLifeDays.categories}, Brands=${this.halfLifeDays.brands}, Values=${this.halfLifeDays.values}, PriceRanges=${this.halfLifeDays.priceRanges}`,
      );
    }
  }

  /**
   * Apply time-based decay to a user's preferences
   *
   * @param userId The user ID
   * @returns True if preferences were successfully decayed
   */
  async applyDecayToUser(userId: string): Promise<boolean> {
    if (!this.decayEnabled) {
      return false;
    }

    try {
      // Get user preferences
      const preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        return false;
      }

      // Apply decay to preferences
      const decayedPreferences = this.calculateDecayedPreferences(preferences);

      // Save decayed preferences
      await this.userPreferenceService.saveUserPreferences(decayedPreferences);

      return true;
    } catch (error) {
      this.logger.error(`Error applying decay to user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculate decayed preferences for a user
   *
   * @param preferences The user preferences to decay
   * @returns The decayed preferences
   */
  calculateDecayedPreferences(preferences: UserPreferences): UserPreferences {
    const now = Date.now();
    const maxAgeMs = this.maxPreferenceAge * 24 * 60 * 60 * 1000;

    // Create a copy of the preferences to modify
    const decayedPreferences: UserPreferences = JSON.parse(JSON.stringify(preferences));

    // Apply decay to categories
    decayedPreferences.categories = this.applyDecayToMap(
      preferences.categories,
      this.decayRates.categories,
      now,
      maxAgeMs,
    );

    // Apply decay to brands
    decayedPreferences.brands = this.applyDecayToMap(
      preferences.brands,
      this.decayRates.brands,
      now,
      maxAgeMs,
    );

    // Apply decay to values
    decayedPreferences.values = this.applyDecayToMap(
      preferences.values,
      this.decayRates.values,
      now,
      maxAgeMs,
    );

    // Apply decay to price ranges
    decayedPreferences.priceRanges = this.applyDecayToPriceRanges(
      preferences.priceRanges,
      this.decayRates.priceRanges,
      now,
      maxAgeMs,
    );

    // Apply decay to recent searches
    decayedPreferences.recentSearches = this.filterRecentItems(
      preferences.recentSearches,
      now,
      maxAgeMs,
    );

    // Apply decay to recently viewed products
    decayedPreferences.recentlyViewedProducts = this.filterRecentItems(
      preferences.recentlyViewedProducts,
      now,
      maxAgeMs,
    );

    // Apply decay to purchase history
    decayedPreferences.purchaseHistory = this.filterRecentItems(
      preferences.purchaseHistory,
      now,
      maxAgeMs,
      // Purchases decay more slowly than other interactions
      this.decayRates.brands / 2,
    );

    // Update last updated timestamp
    decayedPreferences.lastUpdated = now;

    // Add metadata about decay
    if (!decayedPreferences.additionalData) {
      decayedPreferences.additionalData = {};
    }

    decayedPreferences.additionalData.lastDecay = {
      timestamp: now,
      decayRates: this.decayRates,
    };

    return decayedPreferences;
  }

  /**
   * Apply decay to a map of preferences
   *
   * @param map The preference map to decay
   * @param decayRate The decay rate to apply
   * @param now The current timestamp
   * @param maxAgeMs The maximum age in milliseconds
   * @returns The decayed preference map
   */
  private applyDecayToMap(
    map: Record<string, number>,
    decayRate: number,
    now: number,
    maxAgeMs: number,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    const _cutoffTime = now - maxAgeMs;

    // Get the last decay timestamp, or use a default if not available
    const lastDecayTime = now - 24 * 60 * 60 * 1000; // Default to 1 day ago

    // Calculate time since last decay in milliseconds
    const timeSinceLastDecay = now - lastDecayTime;

    // Calculate the decay factor based on time since last decay
    const decayFactor = Math.exp(-decayRate * timeSinceLastDecay);

    // Apply decay to each preference
    for (const [key, value] of Object.entries(map)) {
      // Apply exponential decay
      const decayedValue = value * decayFactor;

      // Only keep preferences above a minimum threshold
      if (decayedValue >= 0.1) {
        result[key] = decayedValue;
      }
    }

    return result;
  }

  /**
   * Apply decay to price ranges
   *
   * @param priceRanges The price ranges to decay
   * @param decayRate The decay rate to apply
   * @param now The current timestamp
   * @param maxAgeMs The maximum age in milliseconds
   * @returns The decayed price ranges
   */
  private applyDecayToPriceRanges(
    priceRanges: Array<{ min: number; max: number; weight: number }>,
    decayRate: number,
    now: number,
    maxAgeMs: number,
  ): Array<{ min: number; max: number; weight: number }> {
    const result: Array<{ min: number; max: number; weight: number }> = [];
    const _cutoffTime = now - maxAgeMs;

    // Get the last decay timestamp, or use a default if not available
    const lastDecayTime = now - 24 * 60 * 60 * 1000; // Default to 1 day ago

    // Calculate time since last decay in milliseconds
    const timeSinceLastDecay = now - lastDecayTime;

    // Calculate the decay factor based on time since last decay
    const decayFactor = Math.exp(-decayRate * timeSinceLastDecay);

    // Apply decay to each price range
    for (const range of priceRanges) {
      // Apply exponential decay to weight
      const decayedWeight = range.weight * decayFactor;

      // Only keep price ranges above a minimum threshold
      if (decayedWeight >= 0.1) {
        result.push({
          min: range.min,
          max: range.max,
          weight: decayedWeight,
        });
      }
    }

    return result;
  }

  /**
   * Filter recent items based on timestamp
   *
   * @param items The items to filter
   * @param now The current timestamp
   * @param maxAgeMs The maximum age in milliseconds
   * @param decayRate Optional decay rate to apply
   * @returns The filtered items
   */
  private filterRecentItems<T extends { timestamp: number }>(
    items: T[],
    now: number,
    maxAgeMs: number,
    _decayRate?: number,
  ): T[] {
    const cutoffTime = now - maxAgeMs;

    // Filter out items older than the maximum age
    return items.filter(item => item.timestamp > cutoffTime);
  }

  /**
   * Apply decay to all users' preferences
   * This is a scheduled job that runs daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async applyDecayToAllUsers(): Promise<void> {
    if (!this.decayEnabled) {
      return;
    }

    try {
      this.logger.log('Starting scheduled preference decay for all users');

      let processedUsers = 0;
      let scrollId: string | undefined;

      // Get total number of users with preferences
      const countResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });

      const totalUsers = countResult.count;
      this.logger.log(`Found ${totalUsers} users with preferences to process`);

      // Process users in batches using the scroll API
      const initialResult = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        scroll: '1m',
        size: this.batchSize,
        body: {
          query: {
            match_all: {},
          },
          _source: ['userId'],
        },
      });

      scrollId = initialResult._scroll_id;
      let hits = initialResult.hits.hits;

      while (hits && hits.length > 0) {
        // Process batch
        const userIds = hits.map(hit => (hit._source as any).userId);

        // Apply decay to each user in parallel
        await Promise.all(userIds.map(userId => this.applyDecayToUser(userId)));

        processedUsers += userIds.length;
        this.logger.log(
          `Processed ${processedUsers}/${totalUsers} users (${Math.round((processedUsers / totalUsers) * 100)}%)`,
        );

        // Get next batch
        if (scrollId) {
          const scrollResult = await this.elasticsearchService.scroll({
            scroll_id: scrollId,
            scroll: '1m',
          });

          scrollId = scrollResult._scroll_id;
          hits = scrollResult.hits.hits;
        } else {
          break;
        }
      }

      // Clear scroll when done
      if (scrollId) {
        await this.elasticsearchService.clearScroll({
          scroll_id: scrollId,
        });
      }

      this.logger.log(`Completed preference decay for ${processedUsers} users`);
    } catch (error) {
      this.logger.error(`Error applying decay to all users: ${error.message}`);
    }
  }

  /**
   * Apply immediate decay to a specific preference type for a user
   *
   * @param userId The user ID
   * @param preferenceType The type of preference to decay
   * @param decayFactor The decay factor to apply (0-1)
   * @returns True if preferences were successfully decayed
   */
  async applyImmediateDecay(
    userId: string,
    preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges',
    decayFactor: number,
  ): Promise<boolean> {
    if (!this.decayEnabled) {
      return false;
    }

    try {
      // Get user preferences
      const preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        return false;
      }

      // Create a copy of the preferences to modify
      const decayedPreferences: UserPreferences = JSON.parse(JSON.stringify(preferences));

      // Apply immediate decay to the specified preference type
      switch (preferenceType) {
        case 'categories':
          decayedPreferences.categories = this.applyImmediateDecayToMap(
            preferences.categories,
            decayFactor,
          );
          break;
        case 'brands':
          decayedPreferences.brands = this.applyImmediateDecayToMap(
            preferences.brands,
            decayFactor,
          );
          break;
        case 'values':
          decayedPreferences.values = this.applyImmediateDecayToMap(
            preferences.values,
            decayFactor,
          );
          break;
        case 'priceRanges':
          decayedPreferences.priceRanges = this.applyImmediateDecayToPriceRanges(
            preferences.priceRanges,
            decayFactor,
          );
          break;
      }

      // Update last updated timestamp
      decayedPreferences.lastUpdated = Date.now();

      // Save decayed preferences
      await this.userPreferenceService.saveUserPreferences(decayedPreferences);

      return true;
    } catch (error) {
      this.logger.error(`Error applying immediate decay to user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Apply immediate decay to a preference map
   *
   * @param map The preference map to decay
   * @param decayFactor The decay factor to apply
   * @returns The decayed preference map
   */
  private applyImmediateDecayToMap(
    map: Record<string, number>,
    decayFactor: number,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    // Apply decay to each preference
    for (const [key, value] of Object.entries(map)) {
      // Apply immediate decay
      const decayedValue = value * decayFactor;

      // Only keep preferences above a minimum threshold
      if (decayedValue >= 0.1) {
        result[key] = decayedValue;
      }
    }

    return result;
  }

  /**
   * Apply immediate decay to price ranges
   *
   * @param priceRanges The price ranges to decay
   * @param decayFactor The decay factor to apply
   * @returns The decayed price ranges
   */
  private applyImmediateDecayToPriceRanges(
    priceRanges: Array<{ min: number; max: number; weight: number }>,
    decayFactor: number,
  ): Array<{ min: number; max: number; weight: number }> {
    const result: Array<{ min: number; max: number; weight: number }> = [];

    // Apply decay to each price range
    for (const range of priceRanges) {
      // Apply immediate decay to weight
      const decayedWeight = range.weight * decayFactor;

      // Only keep price ranges above a minimum threshold
      if (decayedWeight >= 0.1) {
        result.push({
          min: range.min,
          max: range.max,
          weight: decayedWeight,
        });
      }
    }

    return result;
  }

  /**
   * Get the decay rate for a specific preference type
   *
   * @param preferenceType The type of preference
   * @returns The decay rate
   */
  getDecayRate(preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges'): number {
    return this.decayRates[preferenceType];
  }

  /**
   * Get the half-life in days for a specific preference type
   *
   * @param preferenceType The type of preference
   * @returns The half-life in days
   */
  getHalfLifeDays(preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges'): number {
    return this.halfLifeDays[preferenceType];
  }

  /**
   * Check if preference decay is enabled
   *
   * @returns True if preference decay is enabled
   */
  isDecayEnabled(): boolean {
    return this.decayEnabled;
  }
}
