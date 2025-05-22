import { Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CacheWarmingService } from '../services/cache-warming.service';
import { ProductCacheService } from '../services/product-cache.service';

@Controller('admin/products/cache')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductCacheController {
  private readonly logger = new Logger(ProductCacheController.name);

  constructor(
    private readonly cacheWarmingService: CacheWarmingService,
    private readonly productCacheService: ProductCacheService,
  ) {}

  @Post('warm')
  async warmCache() {
    this.logger.log('Admin triggered cache warming');
    return this.cacheWarmingService.triggerCacheWarming();
  }

  @Post('invalidate/all')
  async invalidateAllCache() {
    this.logger.log('Admin triggered full cache invalidation');
    await this.productCacheService.invalidateAllProductsCache();
    return { success: true, message: 'All product cache invalidated successfully' };
  }

  @Post('invalidate/merchant/:merchantId')
  async invalidateMerchantCache(merchantId: string) {
    this.logger.log(`Admin triggered cache invalidation for merchant ${merchantId}`);
    await this.productCacheService.invalidateProductsByMerchant(merchantId);
    return { success: true, message: `Cache for merchant ${merchantId} invalidated successfully` };
  }
}
