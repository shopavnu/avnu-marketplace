import { Product } from "../types/product";

export class ProductService {
  static getProductsByIds(ids: string[]): Promise<Product[]>;
  static getProductById(id: string): Promise<Product | null>;
  static getProductsByCategory(
    categoryId: string,
    limit?: number,
  ): Promise<Product[]>;
  static getTrendingProducts(limit?: number): Promise<Product[]>;
  static searchProducts(
    query: string,
    limit?: number,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
    },
  ): Promise<Product[]>;
  static getRecentlyViewedProducts(limit?: number): Promise<Product[]>;
}
