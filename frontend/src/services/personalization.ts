import { Product } from "@/data/products";
import { Category } from "@/data/categories";
import { SectionType } from "@/data/sections";

// Constants
const STORAGE_KEYS = {
  VIEWED_PRODUCTS: "avnu_viewed_products",
  VIEWED_CATEGORIES: "avnu_viewed_categories",
  FAVORITE_PRODUCTS: "avnu_favorite_products",
  FAVORITE_CATEGORIES: "avnu_favorite_categories",
  LAST_VISIT: "avnu_last_visit",
  USER_PREFERENCES: "avnu_user_preferences",
};

const MAX_HISTORY_ITEMS = 100;
const RECENCY_WEIGHT = 2.0;
const FREQUENCY_WEIGHT = 1.5;
const CATEGORY_WEIGHT = 1.2;
const BRAND_WEIGHT = 1.0;
const PRICE_RANGE_WEIGHT = 0.8;
const ATTRIBUTE_WEIGHT = 0.7;

// Types for personalization data
export interface ViewedItem {
  id: string;
  timestamp: number;
  duration?: number; // Time spent viewing in seconds
}

export interface UserPreferences {
  preferredCategories: string[];
  preferredBrands: string[];
  preferredPriceRange: {
    min: number;
    max: number;
  };
  preferredAttributes: {
    [key: string]: string[];
  };
  interests: string[];
}

export interface PersonalizationData {
  viewedProducts: ViewedItem[];
  viewedCategories: ViewedItem[];
  favoriteProducts: string[];
  favoriteCategories: string[];
  lastVisit: number;
  userPreferences: UserPreferences;
}

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  preferredCategories: [],
  preferredBrands: [],
  preferredPriceRange: {
    min: 0,
    max: 1000,
  },
  preferredAttributes: {},
  interests: [],
};

// Initialize personalization data from localStorage
const initializePersonalizationData = (): PersonalizationData => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return {
      viewedProducts: [],
      viewedCategories: [],
      favoriteProducts: [],
      favoriteCategories: [],
      lastVisit: Date.now(),
      userPreferences: defaultUserPreferences,
    };
  }

  try {
    const viewedProducts = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.VIEWED_PRODUCTS) || "[]",
    );
    const viewedCategories = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.VIEWED_CATEGORIES) || "[]",
    );
    const favoriteProducts = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FAVORITE_PRODUCTS) || "[]",
    );
    const favoriteCategories = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FAVORITE_CATEGORIES) || "[]",
    );
    const lastVisit = parseInt(
      localStorage.getItem(STORAGE_KEYS.LAST_VISIT) || Date.now().toString(),
      10,
    );
    const userPreferences = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) ||
        JSON.stringify(defaultUserPreferences),
    );

    return {
      viewedProducts,
      viewedCategories,
      favoriteProducts,
      favoriteCategories,
      lastVisit,
      userPreferences,
    };
  } catch (error) {
    console.error("Error initializing personalization data:", error);
    return {
      viewedProducts: [],
      viewedCategories: [],
      favoriteProducts: [],
      favoriteCategories: [],
      lastVisit: Date.now(),
      userPreferences: defaultUserPreferences,
    };
  }
};

/**
 * Personalization Service
 *
 * A service for tracking user behavior and generating personalized recommendations
 * for the "For You" section of the Avnu Marketplace.
 */
class PersonalizationService {
  private data: PersonalizationData;
  private initialized: boolean = false;

  constructor() {
    this.data = {
      viewedProducts: [],
      viewedCategories: [],
      favoriteProducts: [],
      favoriteCategories: [],
      lastVisit: Date.now(),
      userPreferences: defaultUserPreferences,
    };
  }

  /**
   * Initialize the personalization service
   * This should be called when the app starts
   */
  public initialize(): void {
    if (typeof window === "undefined") return;

    this.data = initializePersonalizationData();
    this.initialized = true;

    // Update last visit timestamp
    this.data.lastVisit = Date.now();
    localStorage.setItem(
      STORAGE_KEYS.LAST_VISIT,
      this.data.lastVisit.toString(),
    );
  }

  /**
   * Track a product view
   * @param productId The ID of the product that was viewed
   * @param duration Optional duration of the view in seconds
   */
  public trackProductView(productId: string, duration?: number): void {
    if (!this.initialized) this.initialize();

    const viewedItem: ViewedItem = {
      id: productId,
      timestamp: Date.now(),
      duration,
    };

    // Add to the beginning of the array for recency
    this.data.viewedProducts.unshift(viewedItem);

    // Limit the array size
    if (this.data.viewedProducts.length > MAX_HISTORY_ITEMS) {
      this.data.viewedProducts = this.data.viewedProducts.slice(
        0,
        MAX_HISTORY_ITEMS,
      );
    }

    // Save to localStorage
    this.saveToLocalStorage(
      STORAGE_KEYS.VIEWED_PRODUCTS,
      this.data.viewedProducts,
    );
  }

  /**
   * Track a category view
   * @param categoryId The ID of the category that was viewed
   * @param duration Optional duration of the view in seconds
   */
  public trackCategoryView(categoryId: string, duration?: number): void {
    if (!this.initialized) this.initialize();

    const viewedItem: ViewedItem = {
      id: categoryId,
      timestamp: Date.now(),
      duration,
    };

    // Add to the beginning of the array for recency
    this.data.viewedCategories.unshift(viewedItem);

    // Limit the array size
    if (this.data.viewedCategories.length > MAX_HISTORY_ITEMS) {
      this.data.viewedCategories = this.data.viewedCategories.slice(
        0,
        MAX_HISTORY_ITEMS,
      );
    }

    // Save to localStorage
    this.saveToLocalStorage(
      STORAGE_KEYS.VIEWED_CATEGORIES,
      this.data.viewedCategories,
    );
  }

  /**
   * Toggle a product as a favorite
   * @param productId The ID of the product to favorite/unfavorite
   * @returns boolean indicating if the product is now favorited
   */
  public toggleFavoriteProduct(productId: string): boolean {
    if (!this.initialized) this.initialize();

    const index = this.data.favoriteProducts.indexOf(productId);

    if (index === -1) {
      // Add to favorites
      this.data.favoriteProducts.push(productId);
      this.saveToLocalStorage(
        STORAGE_KEYS.FAVORITE_PRODUCTS,
        this.data.favoriteProducts,
      );
      return true;
    } else {
      // Remove from favorites
      this.data.favoriteProducts.splice(index, 1);
      this.saveToLocalStorage(
        STORAGE_KEYS.FAVORITE_PRODUCTS,
        this.data.favoriteProducts,
      );
      return false;
    }
  }

  /**
   * Check if a product is favorited
   * @param productId The ID of the product to check
   * @returns boolean indicating if the product is favorited
   */
  public isProductFavorited(productId: string): boolean {
    if (!this.initialized) this.initialize();
    return this.data.favoriteProducts.includes(productId);
  }

  /**
   * Toggle a category as a favorite
   * @param categoryId The ID of the category to favorite/unfavorite
   * @returns boolean indicating if the category is now favorited
   */
  public toggleFavoriteCategory(categoryId: string): boolean {
    if (!this.initialized) this.initialize();

    const index = this.data.favoriteCategories.indexOf(categoryId);

    if (index === -1) {
      // Add to favorites
      this.data.favoriteCategories.push(categoryId);
      this.saveToLocalStorage(
        STORAGE_KEYS.FAVORITE_CATEGORIES,
        this.data.favoriteCategories,
      );
      return true;
    } else {
      // Remove from favorites
      this.data.favoriteCategories.splice(index, 1);
      this.saveToLocalStorage(
        STORAGE_KEYS.FAVORITE_CATEGORIES,
        this.data.favoriteCategories,
      );
      return false;
    }
  }

  /**
   * Update user preferences
   * @param preferences Partial user preferences to update
   */
  public updateUserPreferences(preferences: Partial<UserPreferences>): void {
    if (!this.initialized) this.initialize();

    this.data.userPreferences = {
      ...this.data.userPreferences,
      ...preferences,
    };

    this.saveToLocalStorage(
      STORAGE_KEYS.USER_PREFERENCES,
      this.data.userPreferences,
    );
  }

  /**
   * Get user preferences
   * @returns The user's preferences
   */
  public getUserPreferences(): UserPreferences {
    if (!this.initialized) this.initialize();
    return this.data.userPreferences;
  }

  /**
   * Get recently viewed products
   * @param limit Maximum number of products to return
   * @returns Array of product IDs sorted by recency
   */
  public getRecentlyViewedProducts(limit: number = 10): string[] {
    if (!this.initialized) this.initialize();

    return this.data.viewedProducts.slice(0, limit).map((item) => item.id);
  }

  /**
   * Get frequently viewed products
   * @param limit Maximum number of products to return
   * @returns Array of product IDs sorted by frequency
   */
  public getFrequentlyViewedProducts(limit: number = 10): string[] {
    if (!this.initialized) this.initialize();

    // Count product views
    const productCounts: { [key: string]: number } = {};

    this.data.viewedProducts.forEach((item) => {
      productCounts[item.id] = (productCounts[item.id] || 0) + 1;
    });

    // Sort by frequency
    return Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  /**
   * Get preferred categories based on view history
   * @param limit Maximum number of categories to return
   * @returns Array of category IDs sorted by preference
   */
  public getPreferredCategories(limit: number = 5): string[] {
    if (!this.initialized) this.initialize();

    // Count category views
    const categoryCounts: { [key: string]: number } = {};

    this.data.viewedCategories.forEach((item) => {
      categoryCounts[item.id] = (categoryCounts[item.id] || 0) + 1;
    });

    // Add explicit preferences
    this.data.userPreferences.preferredCategories.forEach((categoryId) => {
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 5; // Give higher weight to explicit preferences
    });

    // Add favorite categories
    this.data.favoriteCategories.forEach((categoryId) => {
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 3; // Give higher weight to favorites
    });

    // Sort by frequency
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  /**
   * Generate personalized product recommendations
   * @param allProducts Array of all available products
   * @param limit Maximum number of products to return
   * @param offset Offset for pagination
   * @returns Array of recommended products
   */
  public generateRecommendations(
    allProducts: Product[],
    limit: number = 24,
    offset: number = 0,
  ): Product[] {
    if (!this.initialized) this.initialize();

    // Calculate scores for each product
    const productScores = this.calculateProductScores(allProducts);

    // Sort products by score (descending)
    const sortedProducts = [...allProducts].sort((a, b) => {
      const scoreA = productScores[a.id] || 0;
      const scoreB = productScores[b.id] || 0;
      return scoreB - scoreA;
    });

    // Return paginated results
    return sortedProducts.slice(offset, offset + limit);
  }

  /**
   * Load more recommendations for infinite scroll
   * @param allProducts Array of all available products
   * @param currentCount Current number of loaded products
   * @param increment Number of additional products to load
   * @returns Array of additional recommended products
   */
  public loadMoreRecommendations(
    allProducts: Product[],
    currentCount: number,
    increment: number = 12,
  ): Product[] {
    return this.generateRecommendations(allProducts, increment, currentCount);
  }

  /**
   * Calculate personalization scores for products
   * @param products Array of products to score
   * @returns Object mapping product IDs to scores
   */
  private calculateProductScores(products: Product[]): {
    [key: string]: number;
  } {
    const scores: { [key: string]: number } = {};
    const now = Date.now();

    // Get user data for scoring
    const recentlyViewed = new Set(this.getRecentlyViewedProducts(20));
    const frequentlyViewed = new Set(this.getFrequentlyViewedProducts(20));
    const preferredCategories = new Set(this.getPreferredCategories());
    const favoriteProducts = new Set(this.data.favoriteProducts);
    const { preferredBrands, preferredPriceRange, preferredAttributes } =
      this.data.userPreferences;

    // Calculate a score for each product
    products.forEach((product) => {
      let score = 0;

      // Recency factor
      if (recentlyViewed.has(product.id)) {
        score += RECENCY_WEIGHT;
      }

      // Frequency factor
      if (frequentlyViewed.has(product.id)) {
        score += FREQUENCY_WEIGHT;
      }

      // Category preference
      if (preferredCategories.has(product.category)) {
        score += CATEGORY_WEIGHT;
      }

      // Brand preference
      if (preferredBrands.includes(product.brand)) {
        score += BRAND_WEIGHT;
      }

      // Price range preference
      if (
        product.price >= preferredPriceRange.min &&
        product.price <= preferredPriceRange.max
      ) {
        score += PRICE_RANGE_WEIGHT;
      }

      // Attribute preferences
      Object.entries(preferredAttributes).forEach(([key, values]) => {
        const attrKey = key as keyof typeof product.attributes;
        const attrValue = product.attributes[attrKey];
        if (
          attrValue &&
          typeof attrValue === "string" &&
          values.includes(attrValue)
        ) {
          score += ATTRIBUTE_WEIGHT;
        }
      });

      // Favorite bonus
      if (favoriteProducts.has(product.id)) {
        score += 3.0; // High bonus for favorites
      }

      // Add some randomness to avoid showing the same products
      score += Math.random() * 0.2;

      // Store the score
      scores[product.id] = score;
    });

    return scores;
  }

  /**
   * Helper method to save data to localStorage
   * @param key Storage key
   * @param data Data to save
   */
  private saveToLocalStorage(key: string, data: any): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all personalization data
   */
  public clearAllData(): void {
    if (typeof window === "undefined") return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    this.data = {
      viewedProducts: [],
      viewedCategories: [],
      favoriteProducts: [],
      favoriteCategories: [],
      lastVisit: Date.now(),
      userPreferences: defaultUserPreferences,
    };
  }

  /**
   * Infer user preferences from behavior
   * This analyzes view history to update user preferences automatically
   */
  public inferPreferences(allProducts: Product[]): void {
    if (!this.initialized) this.initialize();

    // Skip if not enough data
    if (this.data.viewedProducts.length < 5) return;

    const viewedProductIds = new Set(
      this.data.viewedProducts.map((item) => item.id),
    );
    const viewedProducts = allProducts.filter((product) =>
      viewedProductIds.has(product.id),
    );

    if (viewedProducts.length === 0) return;

    // Infer category preferences
    const categoryFrequency: { [key: string]: number } = {};
    viewedProducts.forEach((product) => {
      product.categories.forEach((category) => {
        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
      });
    });

    // Infer brand preferences
    const brandFrequency: { [key: string]: number } = {};
    viewedProducts.forEach((product) => {
      brandFrequency[product.brand] = (brandFrequency[product.brand] || 0) + 1;
    });

    // Infer price range
    const prices = viewedProducts.map((product) => product.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Infer attribute preferences
    const attributeFrequency: Record<string, Record<string, number>> = {};
    viewedProducts.forEach((product) => {
      Object.entries(product.attributes).forEach(([key, value]) => {
        // Skip if value is undefined
        if (value === undefined) return;

        // Ensure the key exists in the frequency object
        if (!attributeFrequency[key]) {
          attributeFrequency[key] = {};
        }

        // Convert value to string to ensure it can be used as an index
        const valueStr = String(value);
        attributeFrequency[key][valueStr] =
          (attributeFrequency[key][valueStr] || 0) + 1;
      });
    });

    // Update user preferences with inferred data
    const preferredCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    const preferredBrands = Object.entries(brandFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand]) => brand);

    const preferredAttributes: { [key: string]: string[] } = {};
    Object.entries(attributeFrequency).forEach(([key, values]) => {
      preferredAttributes[key] = Object.entries(values)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value]) => value);
    });

    // Update preferences with inferred data
    this.updateUserPreferences({
      preferredCategories,
      preferredBrands,
      preferredPriceRange: {
        min: Math.max(0, minPrice - 50), // Add some buffer
        max: maxPrice + 100, // Add some buffer
      },
      preferredAttributes,
    });
  }
}

// Create a singleton instance
const personalizationService = new PersonalizationService();

export default personalizationService;
