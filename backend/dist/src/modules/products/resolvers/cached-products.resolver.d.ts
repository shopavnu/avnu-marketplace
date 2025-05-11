import { CachedProductsService } from '../services/cached-products.service';
import { ProductCacheService } from '../services/product-cache.service';
import { CacheWarmingService } from '../services/cache-warming.service';
import { Product } from '../entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CursorPaginationDto } from '../../../common/dto/cursor-pagination.dto';
export declare class CachedProductsResolver {
  private readonly cachedProductsService;
  private readonly productCacheService;
  private readonly cacheWarmingService;
  constructor(
    cachedProductsService: CachedProductsService,
    productCacheService: ProductCacheService,
    cacheWarmingService: CacheWarmingService,
  );
  findOne(id: string): Promise<Product>;
  findAll(paginationDto?: PaginationDto): Promise<Product[]>;
  findByCursor(paginationDto: CursorPaginationDto): Promise<Product[]>;
  findByMerchant(merchantId: string, paginationDto?: PaginationDto): Promise<Product[]>;
  getRecommendedProducts(userId: string, limit?: number): Promise<Product[]>;
  getDiscoveryProducts(limit?: number): Promise<Product[]>;
  search(query: string, paginationDto?: PaginationDto, filters?: any): Promise<Product[]>;
  warmCache(): Promise<boolean>;
  invalidateCache(productId?: string, merchantId?: string, all?: boolean): Promise<boolean>;
}
