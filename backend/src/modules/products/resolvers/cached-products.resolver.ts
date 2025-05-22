import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CachedProductsService } from '../services/cached-products.service';
import { ProductCacheService } from '../services/product-cache.service';
import { CacheWarmingService } from '../services/cache-warming.service';
import { Product } from '../entities/product.entity';
// Unused imports but kept for future use
// import { CreateProductDto } from '../dto/create-product.dto';
// import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CursorPaginationDto } from '../../../common/dto/cursor-pagination.dto';

@Resolver(() => Product)
export class CachedProductsResolver {
  constructor(
    private readonly cachedProductsService: CachedProductsService,
    private readonly productCacheService: ProductCacheService,
    private readonly cacheWarmingService: CacheWarmingService,
  ) {}

  @Query(() => Product, { name: 'cachedProduct' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<Product> {
    return this.cachedProductsService.findOne(id);
  }

  @Query(() => [Product], { name: 'cachedProducts' })
  async findAll(
    @Args('pagination', { nullable: true }) paginationDto?: PaginationDto,
  ): Promise<Product[]> {
    const result = await this.cachedProductsService.findAll(paginationDto);
    return result.items;
  }

  @Query(() => [Product], { name: 'cachedProductsByCursor' })
  async findByCursor(@Args('pagination') paginationDto: CursorPaginationDto): Promise<Product[]> {
    const result = await this.cachedProductsService.findWithCursor(paginationDto);
    return result.items;
  }

  @Query(() => [Product], { name: 'cachedProductsByMerchant' })
  async findByMerchant(
    @Args('merchantId') merchantId: string,
    @Args('pagination', { nullable: true }) paginationDto?: PaginationDto,
  ): Promise<Product[]> {
    const result = await this.cachedProductsService.findByMerchant(merchantId, paginationDto);
    return result.items;
  }

  @Query(() => [Product], { name: 'cachedRecommendedProducts' })
  async getRecommendedProducts(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Product[]> {
    return this.cachedProductsService.getRecommendedProducts(userId, limit);
  }

  @Query(() => [Product], { name: 'cachedDiscoveryProducts' })
  async getDiscoveryProducts(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<Product[]> {
    return this.cachedProductsService.getDiscoveryProducts(limit);
  }

  @Query(() => [Product], { name: 'cachedSearchProducts' })
  async search(
    @Args('query') query: string,
    @Args('pagination', { nullable: true }) paginationDto?: PaginationDto,
    @Args('filters', { nullable: true }) filters?: any,
  ): Promise<Product[]> {
    const result = await this.cachedProductsService.search(query, paginationDto, filters);
    return result.items;
  }

  // Admin-only cache management operations
  @Mutation(() => Boolean, { name: 'warmProductCache' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async warmCache(): Promise<boolean> {
    const result = await this.cacheWarmingService.triggerCacheWarming();
    return result.success;
  }

  @Mutation(() => Boolean, { name: 'invalidateProductCache' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async invalidateCache(
    @Args('productId', { nullable: true }) productId?: string,
    @Args('merchantId', { nullable: true }) merchantId?: string,
    @Args('all', { nullable: true }) all?: boolean,
  ): Promise<boolean> {
    if (productId) {
      await this.productCacheService.invalidateProduct(productId);
      return true;
    }

    if (merchantId) {
      await this.productCacheService.invalidateProductsByMerchant(merchantId);
      return true;
    }

    if (all) {
      await this.productCacheService.invalidateAllProductsCache();
      return true;
    }

    return false;
  }
}
