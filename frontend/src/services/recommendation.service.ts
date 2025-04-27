import axios from 'axios';
import { Product } from '../types/product';
import { getAuthHeader } from '../utils/auth';
import { API_BASE_URL } from '../config';

/**
 * Service for interacting with the recommendation API
 */
export class RecommendationService {
  /**
   * Get similar products to a given product
   * @param productId Product ID to find similar products for
   * @param type Similarity type (default: 'hybrid')
   * @param limit Maximum number of products to return
   */
  static async getSimilarProducts(
    productId: string,
    type: 'attribute_based' | 'view_based' | 'hybrid' = 'hybrid',
    limit: number = 6
  ): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/similar-products/${productId}`,
        {
          params: { type, limit },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations for the current user
   * @param limit Maximum number of products to return
   * @param refresh Whether to refresh recommendations
   */
  static async getPersonalizedRecommendations(
    limit: number = 10,
    refresh: boolean = false
  ): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/personalized`,
        {
          params: { limit, refresh },
          headers: getAuthHeader(),
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Get trending products
   * @param limit Maximum number of products to return
   */
  static async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/trending`,
        {
          params: { limit },
          headers: getAuthHeader(),
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  }

  /**
   * Track recommendation impression
   * @param recommendationId Recommendation ID
   */
  static async trackImpression(recommendationId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/recommendations/track/impression/${recommendationId}`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }

  /**
   * Track recommendation click
   * @param recommendationId Recommendation ID
   */
  static async trackClick(recommendationId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/recommendations/track/click/${recommendationId}`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  /**
   * Track recommendation conversion
   * @param recommendationId Recommendation ID
   */
  static async trackConversion(recommendationId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/recommendations/track/conversion/${recommendationId}`,
        {},
        {
          headers: getAuthHeader(),
        }
      );
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }
}
