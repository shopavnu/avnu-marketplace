import { Injectable, Logger } from '@nestjs/common';
import {
  UserPreferenceService,
  UserInteraction,
  UserInteractionType,
  UserPreferences as _UserPreferences,
} from './user-preference.service';
import { PreferenceDecayService } from './preference-decay.service';
import { Product } from '../../products/entities/product.entity';
import {
  UserPreferencesSurveyInput,
  ShoppingFrequency as _ShoppingFrequency,
  PriceSensitivity,
} from '../dto/user-preferences-survey.dto';

/**
 * Service for collecting user preferences from various interactions
 * This service acts as a facade for tracking different types of user interactions
 * and updating user preferences accordingly
 */
@Injectable()
export class PreferenceCollectorService {
  private readonly logger = new Logger(PreferenceCollectorService.name);

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly preferenceDecayService: PreferenceDecayService,
  ) {}

  /**
   * Track a search query to update user preferences
   *
   * @param userId The user ID
   * @param query The search query
   * @param filters Any filters applied to the search
   * @param resultCount The number of results returned
   * @returns True if the interaction was recorded successfully
   */
  async trackSearch(
    userId: string,
    query: string,
    filters?: Record<string, any>,
    resultCount?: number,
  ): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.SEARCH,
        timestamp: Date.now(),
        data: {
          query,
          filters,
          resultCount,
        },
      };

      this.logger.debug(`Tracking search interaction for user ${userId}: ${query}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track search for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track a product view to update user preferences
   *
   * @param userId The user ID
   * @param product The viewed product
   * @param referrer The referrer (e.g., 'search', 'recommendation', 'category')
   * @returns True if the interaction was recorded successfully
   */
  async trackProductView(userId: string, product: Product, referrer?: string): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.VIEW_PRODUCT,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          referrer,
        },
      };

      this.logger.debug(`Tracking product view for user ${userId}: ${product.title}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track product view for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track a product added to cart to update user preferences
   *
   * @param userId The user ID
   * @param product The product added to cart
   * @param quantity The quantity added
   * @returns True if the interaction was recorded successfully
   */
  async trackAddToCart(userId: string, product: Product, quantity: number = 1): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.ADD_TO_CART,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          quantity,
        },
      };

      this.logger.debug(`Tracking add to cart for user ${userId}: ${product.title} (${quantity})`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track add to cart for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track a product purchase to update user preferences
   *
   * @param userId The user ID
   * @param product The purchased product
   * @param quantity The quantity purchased
   * @returns True if the interaction was recorded successfully
   */
  async trackPurchase(userId: string, product: Product, quantity: number = 1): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.PURCHASE,
        timestamp: Date.now(),
        data: {
          productId: product.id,
          title: product.title,
          price: product.price,
          categories: product.categories,
          brandName: product.brandName,
          values: product.values,
          quantity,
        },
      };

      this.logger.debug(`Tracking purchase for user ${userId}: ${product.title} (${quantity})`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track purchase for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track filter application to update user preferences
   *
   * @param userId The user ID
   * @param filters The filters applied
   * @returns True if the interaction was recorded successfully
   */
  async trackFilterApply(userId: string, filters: Record<string, any>): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.FILTER_APPLY,
        timestamp: Date.now(),
        data: {
          filters,
        },
      };

      this.logger.debug(`Tracking filter apply for user ${userId}: ${JSON.stringify(filters)}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track filter apply for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track category click to update user preferences
   *
   * @param userId The user ID
   * @param category The category clicked
   * @returns True if the interaction was recorded successfully
   */
  async trackCategoryClick(userId: string, category: string): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.CLICK_CATEGORY,
        timestamp: Date.now(),
        data: {
          category,
        },
      };

      this.logger.debug(`Tracking category click for user ${userId}: ${category}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track category click for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Track brand click to update user preferences
   *
   * @param userId The user ID
   * @param brand The brand clicked
   * @returns True if the interaction was recorded successfully
   */
  async trackBrandClick(userId: string, brand: string): Promise<boolean> {
    try {
      const interaction: UserInteraction = {
        userId,
        type: UserInteractionType.CLICK_BRAND,
        timestamp: Date.now(),
        data: {
          brand,
        },
      };

      this.logger.debug(`Tracking brand click for user ${userId}: ${brand}`);
      return await this.userPreferenceService.recordInteraction(interaction);
    } catch (error) {
      this.logger.error(`Failed to track brand click for user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process initial user preferences survey
   *
   * @param userId The user ID
   * @param surveyData The survey data submitted by the user
   * @returns True if the preferences were successfully saved
   */
  async processPreferencesSurvey(
    userId: string,
    surveyData: UserPreferencesSurveyInput,
  ): Promise<boolean> {
    try {
      this.logger.debug(`Processing preferences survey for user ${userId}`);

      // Get existing preferences or create default ones
      let preferences = await this.userPreferenceService.getUserPreferences(userId);
      if (!preferences) {
        // Create default preferences if none exist
        preferences = {
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

      // Update preferences based on survey data

      // Process preferred categories
      surveyData.preferredCategories.forEach(category => {
        // Assign higher weights to explicitly preferred categories from survey
        preferences.categories[category] = (preferences.categories[category] || 0) + 5;
      });

      // Process preferred brands
      surveyData.preferredBrands.forEach(brand => {
        // Assign higher weights to explicitly preferred brands from survey
        preferences.brands[brand] = (preferences.brands[brand] || 0) + 5;
      });

      // Process price range preference
      const priceRangeWeight = this.getPriceRangeWeightFromSensitivity(surveyData.priceSensitivity);
      preferences.priceRanges.push({
        min: surveyData.priceRangeMin,
        max: surveyData.priceRangeMax,
        weight: priceRangeWeight,
      });

      // Process preferred attributes/features
      if (surveyData.preferredAttributes && surveyData.preferredAttributes.length > 0) {
        surveyData.preferredAttributes.forEach(attr => {
          preferences.values[attr] = (preferences.values[attr] || 0) + 3;
        });
      }

      // Store shopping frequency and other metadata in additionalData
      if (!preferences.additionalData) {
        preferences.additionalData = {};
      }

      preferences.additionalData.shoppingFrequency = surveyData.shoppingFrequency;
      preferences.additionalData.priceSensitivity = surveyData.priceSensitivity;
      preferences.additionalData.reviewImportance = surveyData.reviewImportance;

      if (surveyData.additionalPreferences) {
        preferences.additionalData = {
          ...preferences.additionalData,
          ...surveyData.additionalPreferences,
        };
      }

      // Update the lastUpdated timestamp
      preferences.lastUpdated = Date.now();

      // Save the updated preferences
      const result = await this.userPreferenceService.saveUserPreferences(preferences);

      this.logger.debug(
        `Preferences survey processed for user ${userId}: ${result ? 'success' : 'failed'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process preferences survey for user ${userId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Get price range weight based on price sensitivity
   *
   * @param sensitivity The price sensitivity level
   * @returns A weight value for the price range
   */
  private getPriceRangeWeightFromSensitivity(sensitivity: PriceSensitivity): number {
    switch (sensitivity) {
      case PriceSensitivity.BUDGET:
        return 5.0; // Very important
      case PriceSensitivity.VALUE:
        return 4.0;
      case PriceSensitivity.BALANCED:
        return 3.0;
      case PriceSensitivity.PREMIUM:
        return 2.0;
      case PriceSensitivity.LUXURY:
        return 1.5; // Less restrictive on price
      default:
        return 3.0; // Default balanced weight
    }
  }

  /**
   * Get user preferences for personalizing search results
   *
   * @param userId The user ID
   * @returns The user preferences or null if not found
   */
  async getUserPreferences(userId: string) {
    return this.userPreferenceService.getUserPreferences(userId);
  }

  /**
   * Apply time-based decay to a user's preferences
   *
   * @param userId The user ID
   * @returns True if preferences were successfully decayed
   */
  async applyPreferenceDecay(userId: string): Promise<boolean> {
    return this.preferenceDecayService.applyDecayToUser(userId);
  }

  /**
   * Apply immediate decay to a specific preference type
   * Useful when a user explicitly changes their interests
   *
   * @param userId The user ID
   * @param preferenceType The type of preference to decay
   * @param decayFactor The decay factor to apply (0-1)
   * @returns True if preferences were successfully decayed
   */
  async applyImmediateDecay(
    userId: string,
    preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges',
    decayFactor: number = 0.5,
  ): Promise<boolean> {
    return this.preferenceDecayService.applyImmediateDecay(userId, preferenceType, decayFactor);
  }
}
