// Utilities for managing user profile and personalization settings in Avnu Marketplace
// LocalStorage-based MVP, extensible for backend integration

import { UserProfile, defaultUserProfile } from '@/types/user';

const USER_PROFILE_KEY = 'avnu_user_profile';

/**
 * Load the user profile from localStorage, or return the default profile.
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultUserProfile;
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return { ...defaultUserProfile, ...JSON.parse(data) };
    }
  } catch (e) {
    // fail silently, fallback to default
  }
  return { ...defaultUserProfile };
}

/**
 * Save the user profile to localStorage.
 */
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // fail silently
  }
}

/**
 * Update the user profile with partial changes and save.
 */
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated = { ...current, ...updates };
  saveUserProfile(updated);
  return updated;
}

/**
 * Toggle a brand in the user's favorites.
 */
export function toggleFavoriteBrand(brandId: string): UserProfile {
  const profile = getUserProfile();
  const exists = profile.favoriteBrands.includes(brandId);
  const updatedBrands = exists
    ? profile.favoriteBrands.filter(id => id !== brandId)
    : [...profile.favoriteBrands, brandId];
  return updateUserProfile({ favoriteBrands: updatedBrands });
}

/**
 * Toggle a product in the user's favorites.
 */
export function toggleFavoriteProduct(productId: string): UserProfile {
  const profile = getUserProfile();
  const exists = profile.favoriteProducts.includes(productId);
  const updatedProducts = exists
    ? profile.favoriteProducts.filter(id => id !== productId)
    : [...profile.favoriteProducts, productId];
  return updateUserProfile({ favoriteProducts: updatedProducts });
}

/**
 * Add a product to the exclusion list (e.g., purchased, dismissed).
 */
export function excludeProduct(productId: string): UserProfile {
  const profile = getUserProfile();
  if (!profile.excludedProductIds.includes(productId)) {
    return updateUserProfile({
      excludedProductIds: [...profile.excludedProductIds, productId],
    });
  }
  return profile;
}

/**
 * Add a brand to the exclusion list.
 */
export function excludeBrand(brandId: string): UserProfile {
  const profile = getUserProfile();
  const excluded = profile.excludedBrandIds || [];
  if (!excluded.includes(brandId)) {
    return updateUserProfile({
      excludedBrandIds: [...excluded, brandId],
    });
  }
  return profile;
}
