import { useEffect, useState } from 'react';
import { Product } from '@/data/products';
import { Category } from '@/data/categories';
import personalizationService from '@/services/personalization';
import { products as allProducts } from '@/data/products';
import { categories as allCategories } from '@/data/categories';

/**
 * Discovery Integration Utilities
 * 
 * This module provides utilities to easily integrate discovery components
 * throughout the Avnu Marketplace platform.
 */

/**
 * Initialize the personalization service
 * This should be called when the app loads, typically in _app.tsx
 */
export const initializePersonalization = (): void => {
  personalizationService.initialize();
};

/**
 * Track product view with the personalization service
 * @param productId The ID of the product that was viewed
 * @param duration Optional duration of the view in seconds
 */
export const trackProductView = (productId: string, duration?: number): void => {
  personalizationService.trackProductView(productId, duration);
};

/**
 * Track category view with the personalization service
 * @param categoryId The ID of the category that was viewed
 * @param duration Optional duration of the view in seconds
 */
export const trackCategoryView = (categoryId: string, duration?: number): void => {
  personalizationService.trackCategoryView(categoryId, duration);
};

/**
 * Use personalized recommendations hook
 * @param limit Maximum number of products to return
 * @param offset Offset for pagination
 * @returns Object with recommended products and loading state
 */
export const usePersonalizedRecommendations = (limit = 12, offset = 0) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = () => {
      setIsLoading(true);
      try {
        const recommendedProducts = personalizationService.generateRecommendations(
          allProducts,
          limit,
          offset
        );
        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [limit, offset]);

  return { recommendations, isLoading };
};

/**
 * Use infinite scroll recommendations hook
 * @param initialLimit Initial number of products to load
 * @param incrementAmount Number of additional products to load on each fetch
 * @returns Object with products, loading state, and loadMore function
 */
export const useInfiniteRecommendations = (initialLimit = 12, incrementAmount = 12) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial products
  useEffect(() => {
    const loadInitialProducts = () => {
      setIsLoading(true);
      try {
        const recommendedProducts = personalizationService.generateRecommendations(
          allProducts,
          initialLimit,
          0
        );
        setProducts(recommendedProducts);
        setHasMore(recommendedProducts.length === initialLimit);
      } catch (error) {
        console.error('Error loading initial recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProducts();
  }, [initialLimit]);

  // Function to load more products
  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPageProducts = personalizationService.loadMoreRecommendations(
        allProducts,
        products.length,
        incrementAmount
      );

      if (nextPageProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts([...products, ...nextPageProducts]);
        setPage(page + 1);
        setHasMore(nextPageProducts.length === incrementAmount);
      }
    } catch (error) {
      console.error('Error loading more recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, loadMore, hasMore };
};

/**
 * Get preferred categories based on user behavior
 * @param limit Maximum number of categories to return
 * @returns Array of preferred category objects
 */
export const getPreferredCategories = (limit = 5): Category[] => {
  const preferredCategoryIds = personalizationService.getPreferredCategories(limit);
  return allCategories.filter(category => preferredCategoryIds.includes(category.id));
};

/**
 * Use recently viewed products hook
 * @param limit Maximum number of products to return
 * @returns Object with recently viewed products and loading state
 */
export const useRecentlyViewedProducts = (limit = 10) => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentProducts = () => {
      setIsLoading(true);
      try {
        const recentProductIds = personalizationService.getRecentlyViewedProducts(limit);
        const products = allProducts.filter(product => 
          recentProductIds.includes(product.id)
        );
        setRecentProducts(products);
      } catch (error) {
        console.error('Error loading recent products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentProducts();
  }, [limit]);

  return { recentProducts, isLoading };
};

/**
 * Toggle product favorite status
 * @param productId The ID of the product to favorite/unfavorite
 * @returns boolean indicating if the product is now favorited
 */
export const toggleFavoriteProduct = (productId: string): boolean => {
  return personalizationService.toggleFavoriteProduct(productId);
};

/**
 * Check if a product is favorited
 * @param productId The ID of the product to check
 * @returns boolean indicating if the product is favorited
 */
export const isProductFavorited = (productId: string): boolean => {
  return personalizationService.isProductFavorited(productId);
};

const discoveryIntegrationService = {
  initializePersonalization,
  trackProductView,
  trackCategoryView,
  usePersonalizedRecommendations,
  useInfiniteRecommendations,
  getPreferredCategories,
  useRecentlyViewedProducts,
  toggleFavoriteProduct,
  isProductFavorited,
};

export default discoveryIntegrationService;
