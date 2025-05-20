// User profile and personalization types for Avnu Marketplace
// This file defines the structure for user-driven personalization, favorites, and settings.

export type FreshnessPreference = 'newest' | 'popular' | 'recommended';

export interface UserProfile {
  id: string; // User ID (could be anonymous/session-based or from auth)
  interests: string[]; // Category or cause IDs
  favoriteBrands: string[]; // Brand IDs
  favoriteProducts: string[]; // Product IDs
  freshnessPreference: FreshnessPreference;
  excludedProductIds: string[]; // Products to exclude from recommendations
  excludedBrandIds?: string[]; // Brands to exclude (optional)
  recentlyViewedProductIds?: string[]; // For recency-based recommendations
  // Add additional personalization fields as needed
}

// Default user profile (for anonymous/local users)
export const defaultUserProfile: UserProfile = {
  id: 'anonymous',
  interests: [],
  favoriteBrands: [],
  favoriteProducts: [],
  freshnessPreference: 'recommended',
  excludedProductIds: [],
  excludedBrandIds: [],
  recentlyViewedProductIds: [],
};
