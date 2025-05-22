import axios from "axios";
import { Product } from "../types/product";
import { API_BASE_URL } from "../config";
import { getAuthHeader } from "../utils/auth";

/**
 * Service for interacting with the product API
 */
export class ProductService {
  /**
   * Get products by IDs
   * @param ids Array of product IDs
   */
  static async getProductsByIds(ids: string[]): Promise<Product[]> {
    try {
      if (!ids.length) return [];

      const response = await axios.post(
        `${API_BASE_URL}/products/by-ids`,
        { ids },
        { headers: getAuthHeader() },
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      return [];
    }
  }

  /**
   * Get product by ID
   * @param id Product ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Get products by category
   * @param categoryId Category ID
   * @param limit Maximum number of products to return
   */
  static async getProductsByCategory(
    categoryId: string,
    limit: number = 10,
  ): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/category/${categoryId}`,
        {
          params: { limit },
          headers: getAuthHeader(),
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Get trending products
   * @param limit Maximum number of products to return
   */
  static async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/trending`, {
        params: { limit },
        headers: getAuthHeader(),
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching trending products:", error);
      return [];
    }
  }

  /**
   * Search products
   * @param query Search query
   * @param limit Maximum number of products to return
   * @param filters Optional filters
   */
  static async searchProducts(
    query: string,
    limit: number = 10,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
    },
  ): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search`, {
        params: {
          query,
          limit,
          ...filters,
        },
        headers: getAuthHeader(),
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  /**
   * Get recently viewed products for the current user
   * @param limit Maximum number of products to return
   */
  static async getRecentlyViewedProducts(
    limit: number = 10,
  ): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/recently-viewed-products`,
        {
          params: { limit },
          headers: getAuthHeader(),
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching recently viewed products:", error);
      return [];
    }
  }

  /**
   * Get suppressed products for a merchant
   * @param merchantId The ID of the merchant
   * @param limit Maximum number of products to return
   */
  static async getSuppressedProducts(
    merchantId: string,
    limit: number = 50,
  ): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/merchant/${merchantId}/products/suppressed`,
        {
          params: { limit },
          headers: getAuthHeader(),
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching suppressed products:", error);
      return [];
    }
  }

  /**
   * Suppress a product
   * @param merchantId The ID of the merchant
   * @param productId The ID of the product to suppress
   */
  static async suppressProduct(
    merchantId: string,
    productId: string,
  ): Promise<boolean> {
    try {
      await axios.post(
        `${API_BASE_URL}/merchant/${merchantId}/products/${productId}/suppress`,
        {},
        { headers: getAuthHeader() },
      );
      return true;
    } catch (error) {
      console.error(`Error suppressing product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Unsuppress a product
   * @param merchantId The ID of the merchant
   * @param productId The ID of the product to unsuppress
   */
  static async unsuppressProduct(
    merchantId: string,
    productId: string,
  ): Promise<boolean> {
    try {
      await axios.post(
        `${API_BASE_URL}/merchant/${merchantId}/products/${productId}/unsuppress`,
        {},
        { headers: getAuthHeader() },
      );
      return true;
    } catch (error) {
      console.error(`Error unsuppressing product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Bulk suppress products
   * @param merchantId The ID of the merchant
   * @param productIds Array of product IDs to suppress
   */
  static async bulkSuppressProducts(
    merchantId: string,
    productIds: string[],
  ): Promise<boolean> {
    try {
      await axios.post(
        `${API_BASE_URL}/merchant/${merchantId}/products/bulk-suppress`,
        { productIds },
        { headers: getAuthHeader() },
      );
      return true;
    } catch (error) {
      console.error("Error bulk suppressing products:", error);
      return false;
    }
  }

  /**
   * Bulk unsuppress products
   * @param merchantId The ID of the merchant
   * @param productIds Array of product IDs to unsuppress
   */
  static async bulkUnsuppressProducts(
    merchantId: string,
    productIds: string[],
  ): Promise<boolean> {
    try {
      await axios.post(
        `${API_BASE_URL}/merchant/${merchantId}/products/bulk-unsuppress`,
        { productIds },
        { headers: getAuthHeader() },
      );
      return true;
    } catch (error) {
      console.error("Error bulk unsuppressing products:", error);
      return false;
    }
  }
}
