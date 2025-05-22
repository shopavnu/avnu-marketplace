/**
 * Anonymous User Utility
 *
 * This utility provides client-side functionality for anonymous user tracking
 * and personalization, working in conjunction with the backend AnonymousUserService.
 * It uses a combination of cookies (set by the server) and localStorage to
 * provide a seamless personalized experience for users who haven't created accounts.
 */

// Import storage utilities from the newly created storage-utils.ts file
import { getLocalStorage, setLocalStorage } from "./storage-utils";

// Constants
const LOCAL_STORAGE_PREFIX = "avnu_";
const RECENT_SEARCHES_KEY = `${LOCAL_STORAGE_PREFIX}recent_searches`;
const RECENTLY_VIEWED_KEY = `${LOCAL_STORAGE_PREFIX}recently_viewed`;
const USER_PREFERENCES_KEY = `${LOCAL_STORAGE_PREFIX}user_preferences`;
const MAX_RECENT_SEARCHES = 10;
const MAX_RECENTLY_VIEWED = 20;

/**
 * Interface for tracking product view data
 */
interface ProductViewData {
  productId: string;
  timestamp: number;
  title: string;
  imageUrl?: string;
  price?: number;
  categoryId?: string;
  brandId?: string;
}

/**
 * Interface for tracking search data
 */
interface SearchData {
  query: string;
  timestamp: number;
  resultCount?: number;
  filters?: Record<string, any>;
}

/**
 * Interface for user preferences
 */
interface UserPreferences {
  theme?: "light" | "dark" | "system";
  listingViewMode?: "grid" | "list";
  sortPreference?: string;
  filterPreferences?: Record<string, any>;
  categoryPreferences?: string[];
  brandPreferences?: string[];
  lastUpdated: number;
}

/**
 * Get recent searches from local storage
 */
export const getRecentSearches = (): SearchData[] => {
  const searches = getLocalStorage<SearchData[]>(RECENT_SEARCHES_KEY, []);
  return searches.sort(
    (a: SearchData, b: SearchData) => b.timestamp - a.timestamp,
  );
};

/**
 * Add a search to recent searches
 */
export const addRecentSearch = (
  query: string,
  resultCount?: number,
  filters?: Record<string, any>,
): void => {
  const searches = getRecentSearches();

  // Check if this search already exists
  const existingIndex = searches.findIndex(
    (s) => s.query.toLowerCase() === query.toLowerCase(),
  );

  if (existingIndex !== -1) {
    // Update existing search with new timestamp and data
    searches[existingIndex] = {
      ...searches[existingIndex],
      timestamp: Date.now(),
      resultCount,
      filters,
    };
  } else {
    // Add new search
    searches.unshift({
      query,
      timestamp: Date.now(),
      resultCount,
      filters,
    });

    // Limit to max number of searches
    if (searches.length > MAX_RECENT_SEARCHES) {
      searches.pop();
    }
  }

  setLocalStorage(RECENT_SEARCHES_KEY, searches);

  // Also track this interaction on the server
  trackInteraction("search", {
    query,
    resultCount,
    filters,
  });
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = (): void => {
  setLocalStorage(RECENT_SEARCHES_KEY, []);
};

/**
 * Get recently viewed products from local storage
 */
export const getRecentlyViewedProducts = (): ProductViewData[] => {
  const products = getLocalStorage<ProductViewData[]>(RECENTLY_VIEWED_KEY, []);
  return products.sort(
    (a: ProductViewData, b: ProductViewData) => b.timestamp - a.timestamp,
  );
};

/**
 * Add a product to recently viewed
 */
export const addRecentlyViewedProduct = (
  productData: Omit<ProductViewData, "timestamp">,
): void => {
  const products = getRecentlyViewedProducts();

  // Check if this product already exists
  const existingIndex = products.findIndex(
    (p) => p.productId === productData.productId,
  );

  if (existingIndex !== -1) {
    // Update existing product with new timestamp
    products[existingIndex] = {
      ...products[existingIndex],
      ...productData,
      timestamp: Date.now(),
    };
  } else {
    // Add new product
    products.unshift({
      ...productData,
      timestamp: Date.now(),
    });

    // Limit to max number of products
    if (products.length > MAX_RECENTLY_VIEWED) {
      products.pop();
    }
  }

  setLocalStorage(RECENTLY_VIEWED_KEY, products);

  // Also track this interaction on the server
  trackInteraction("product_view", {
    productId: productData.productId,
    categoryId: productData.categoryId,
    brandId: productData.brandId,
    viewTimeMs: 0, // Initial view, will be updated on unmount
  });
};

/**
 * Track product view time
 */
export const trackProductViewTime = (
  productId: string,
  viewTimeMs: number,
): void => {
  // Track this interaction on the server
  trackInteraction("product_view", {
    productId,
    viewTimeMs,
  });
};

/**
 * Clear recently viewed products
 */
export const clearRecentlyViewedProducts = (): void => {
  setLocalStorage(RECENTLY_VIEWED_KEY, []);
};

/**
 * Get user preferences from local storage
 */
export const getUserPreferences = (): UserPreferences => {
  return getLocalStorage<UserPreferences>(USER_PREFERENCES_KEY, {
    theme: "system",
    listingViewMode: "grid",
    lastUpdated: Date.now(),
  });
};

/**
 * Update user preferences
 */
export const updateUserPreferences = (
  preferences: Partial<Omit<UserPreferences, "lastUpdated">>,
): void => {
  const currentPreferences = getUserPreferences();

  const updatedPreferences = {
    ...currentPreferences,
    ...preferences,
    lastUpdated: Date.now(),
  };

  setLocalStorage(USER_PREFERENCES_KEY, updatedPreferences);
};

/**
 * Track user interaction with the server
 */
export const trackInteraction = async (
  type: string,
  data: Record<string, any>,
  durationMs?: number,
): Promise<void> => {
  try {
    // Send interaction to server
    await fetch("/api/personalization/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        data,
        durationMs,
      }),
      credentials: "include", // Important: include cookies
    });
  } catch (error) {
    console.error("Failed to track interaction:", error);
    // Fail silently to not disrupt user experience
  }
};

/**
 * Track category view
 */
export const trackCategoryView = (
  categoryId: string,
  categoryName: string,
): void => {
  trackInteraction("view", {
    type: "category",
    categoryId,
    categoryName,
  });
};

/**
 * Track brand view
 */
export const trackBrandView = (brandId: string, brandName: string): void => {
  trackInteraction("view", {
    type: "brand",
    brandId,
    brandName,
  });
};

/**
 * Track filter usage
 */
export const trackFilterUsage = (
  filterType: string,
  filterValue: string,
): void => {
  trackInteraction("filter", {
    filterType,
    filterValue,
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (
  pageType: string,
  scrollPercentage: number,
  visibleProductIds?: string[],
): void => {
  trackInteraction("scroll_depth", {
    pageType,
    scrollPercentage,
    visibleProductIds,
  });
};

/**
 * Get personalized recommendations based on anonymous user profile
 */
export const getPersonalizedRecommendations = async (): Promise<any> => {
  try {
    const response = await fetch("/api/personalization/recommendations", {
      credentials: "include", // Important: include cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get personalized recommendations:", error);
    return { products: [] };
  }
};

/**
 * Clear all anonymous user data (both client and server)
 */
export const clearAllAnonymousUserData = async (): Promise<void> => {
  // Clear local storage data
  clearRecentSearches();
  clearRecentlyViewedProducts();
  setLocalStorage(USER_PREFERENCES_KEY, null);

  // Clear server-side data
  try {
    await fetch("/api/personalization/clear", {
      method: "POST",
      credentials: "include", // Important: include cookies
    });
  } catch (error) {
    console.error("Failed to clear server-side data:", error);
  }
};

// Storage utilities are imported from storage-utils.ts
