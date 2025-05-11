import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Product } from '../../products/entities/product.entity';
export declare class ElasticsearchService implements OnModuleInit {
  private readonly configService;
  private readonly _logger;
  private _client;
  constructor(configService: ConfigService);
  onModuleInit(): Promise<void>;
  private _createIndices;
  private _getMappingForIndex;
  indexProduct(product: Product): Promise<void>;
  bulkIndexProducts(products: Product[]): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
  searchProducts(
    query: string,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    },
    page?: number,
    limit?: number,
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    },
  ): Promise<{
    items: any[];
    total: number;
  }>;
  getProductSuggestions(query: string, limit?: number): Promise<string[]>;
  reindexAllProducts(products: Product[]): Promise<void>;
  getRelatedProducts(productId: string, limit?: number): Promise<any[]>;
  getTrendingProducts(limit?: number): Promise<any[]>;
  getDiscoveryProducts(userId?: string, limit?: number, values?: string[]): Promise<any[]>;
  buildProductSearchQuery(
    query: string,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    },
    page?: number,
    limit?: number,
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    },
  ): any;
  performSearch(index: string, body: any): Promise<any>;
  searchMerchants(
    query: string,
    page?: number,
    limit?: number,
  ): Promise<{
    items: any[];
    total: number;
  }>;
  searchBrands(
    query: string,
    page?: number,
    limit?: number,
  ): Promise<{
    items: any[];
    total: number;
  }>;
  indexDocument(index: string, id: string, body: any, refresh?: boolean | 'wait_for'): Promise<any>;
  updateDocument(
    index: string,
    id: string,
    body: any,
    refresh?: boolean | 'wait_for',
  ): Promise<any>;
  deleteDocument(index: string, id: string, refresh?: boolean | 'wait_for'): Promise<any>;
  bulkOperation(body: any[], refresh?: boolean | 'wait_for'): Promise<any>;
  indexExists(index: string): Promise<boolean>;
  createIndex(
    index: string,
    mappings?: Record<string, any>,
    settings?: Record<string, any>,
  ): Promise<any>;
  deleteIndex(index: string): Promise<any>;
  updateAliases(body: any): Promise<any>;
  getIndexMapping(index: string): Promise<Record<string, any>>;
  updateIndexSettings(index: string, body: any): Promise<any>;
  refreshIndex(index: string): Promise<any>;
}
