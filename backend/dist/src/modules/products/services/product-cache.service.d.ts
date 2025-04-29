import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ResilientCacheService } from '../../../common/services';
export declare class ProductCacheService {
    private cacheManager;
    private readonly productsRepository;
    private readonly eventEmitter;
    private readonly configService;
    private readonly resilientCache;
    private readonly logger;
    private readonly productTTL;
    private readonly popularProductsTTL;
    private readonly categoryProductsTTL;
    private readonly merchantProductsTTL;
    constructor(cacheManager: Cache, productsRepository: Repository<Product>, eventEmitter: EventEmitter2, configService: ConfigService, resilientCache: ResilientCacheService);
    private getProductKey;
    private getProductsListKey;
    private getProductsByCursorKey;
    private getProductsByMerchantKey;
    private getProductsByCategoryKey;
    private getPopularProductsKey;
    private getRecommendedProductsKey;
    private getDiscoveryProductsKey;
    private getSearchProductsKey;
    getCachedProduct(id: string): Promise<Product | null>;
    cacheProduct(product: Product): Promise<void>;
    getCachedProductsList(page: number, limit: number): Promise<{
        items: Product[];
        total: number;
    } | null>;
    cacheProductsList(productsData: {
        items: Product[];
        total: number;
    }, page: number, limit: number): Promise<void>;
    getCachedProductsByCursor(cursor: string, limit: number): Promise<any | null>;
    cacheProductsByCursor(productsData: any, cursor: string, limit: number): Promise<void>;
    getCachedProductsByMerchant(merchantId: string, page: number, limit: number): Promise<{
        items: Product[];
        total: number;
    } | null>;
    cacheProductsByMerchant(merchantId: string, productsData: {
        items: Product[];
        total: number;
    }, page: number, limit: number): Promise<void>;
    getCachedRecommendedProducts(userId: string, limit: number): Promise<Product[] | null>;
    cacheRecommendedProducts(userId: string, products: Product[], limit: number): Promise<void>;
    getCachedDiscoveryProducts(limit: number): Promise<Product[] | null>;
    cacheDiscoveryProducts(products: Product[], limit: number): Promise<void>;
    getCachedSearchProducts(query: string, page: number, limit: number, filters?: any): Promise<{
        items: Product[];
        total: number;
    } | null>;
    cacheSearchProducts(query: string, productsData: {
        items: Product[];
        total: number;
    }, page: number, limit: number, filters?: any): Promise<void>;
    invalidateProduct(id: string): Promise<void>;
    invalidateProductsByMerchant(merchantId: string): Promise<void>;
    invalidateAllProductsCache(): Promise<void>;
    handleProductCreated(_product: Product): Promise<void>;
    handleProductUpdated(_product: Product): Promise<void>;
    handleProductDeleted(productId: string): Promise<void>;
    handleBulkProductsCreated(_products: Product[]): Promise<void>;
    handleBulkProductsUpdated(_products: Product[]): Promise<void>;
    warmPopularProductsCache(): Promise<void>;
    warmCategoryProductsCache(): Promise<void>;
    warmMerchantProductsCache(): Promise<void>;
    warmCache(): Promise<void>;
}
