import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan, Not, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { DataNormalizationService } from './data-normalization.service';
import {
  ProgressiveLoadingDto,
  ProgressiveLoadingResponseDto,
  LoadingPriority,
} from '../dto/progressive-loading.dto';

/**
 * Service for progressive loading of products
 * Optimized for continuous scroll with consistent product cards
 */
@Injectable()
export class ProgressiveLoadingService {
  private readonly logger = new Logger(ProgressiveLoadingService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataNormalizationService: DataNormalizationService,
  ) {}

  /**
   * Load products progressively based on priority and scroll position
   * @param options Progressive loading options
   * @returns Progressive loading response
   */
  async loadProgressively(
    options: ProgressiveLoadingDto,
  ): Promise<ProgressiveLoadingResponseDto<Product>> {
    const startTime = Date.now();

    // Extract options with defaults
    const {
      cursor,
      limit = 20,
      priority = LoadingPriority.HIGH,
      fullDetails = false,
      withMetadata = false,
      exclude = [],
    } = options;

    // Build query conditions
    const where: FindOptionsWhere<Product> = {};

    // Add exclusions if provided
    if (exclude.length > 0) {
      where.id = Not(In(exclude));
    }

    // Parse cursor if provided
    if (cursor) {
      try {
        // Decode cursor (base64 encoded JSON with id and createdAt)
        const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

        // Query for items created before the cursor
        where.createdAt = LessThan(decodedCursor.createdAt);
      } catch (error) {
        this.logger.warn(`Invalid cursor format: ${error.message}`);
        // If cursor is invalid, start from the beginning
      }
    }

    // Execute query with limit + 1 to determine if there are more items
    const query = this.productRepository
      .createQueryBuilder('product')
      .where(where)
      .take(limit + 1)
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.id', 'DESC');

    // Optimize query based on loading priority
    if (priority === LoadingPriority.HIGH) {
      // For high priority (visible content), load everything
      if (fullDetails) {
        query.leftJoinAndSelect('product.categories', 'categories');
      }
    } else if (priority === LoadingPriority.MEDIUM) {
      // For medium priority (just outside viewport), load essential fields
      query.select([
        'product.id',
        'product.title',
        'product.price',
        'product.compareAtPrice',
        'product.images',
        'product.slug',
        'product.createdAt',
      ]);
    } else if (priority === LoadingPriority.LOW || priority === LoadingPriority.PREFETCH) {
      // For low priority (far from viewport), load minimal data
      query.select(['product.id', 'product.title', 'product.images', 'product.createdAt']);
    }

    // Execute query
    const items = await query.getMany();

    // Check if there are more items
    const hasMore = items.length > limit;
    if (hasMore) {
      // Remove the extra item we fetched
      items.pop();
    }

    // Generate next cursor from the last item
    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      const cursorData = {
        id: lastItem.id,
        createdAt: lastItem.createdAt,
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    // Get metadata if requested
    let metadata: any = undefined;
    if (withMetadata) {
      const totalCount = await this.productRepository.count();
      const estimatedRemainingItems = Math.max(0, totalCount - (exclude.length + items.length));
      const loadTimeMs = Date.now() - startTime;

      metadata = {
        totalCount,
        estimatedRemainingItems,
        loadTimeMs,
      };
    }

    // Normalize products for consistent display
    // For low priority or prefetch, skip normalization to improve performance
    let normalizedItems = items;
    if (priority !== LoadingPriority.LOW && priority !== LoadingPriority.PREFETCH) {
      normalizedItems = await Promise.all(
        items.map(product => this.dataNormalizationService.normalizeProduct(product)),
      );
    }

    return {
      items: normalizedItems,
      nextCursor,
      hasMore,
      metadata,
    };
  }

  /**
   * Prefetch products for future loading
   * This method only fetches IDs and minimal data to prepare cache
   * @param cursor Cursor for pagination
   * @param limit Number of items to prefetch
   * @returns Array of product IDs that were prefetched
   */
  async prefetchProducts(cursor?: string, limit: number = 20): Promise<string[]> {
    try {
      const prefetchResult = await this.loadProgressively({
        cursor,
        limit,
        priority: LoadingPriority.PREFETCH,
        fullDetails: false,
        withMetadata: false,
      });

      return prefetchResult.items.map(item => item.id);
    } catch (error) {
      this.logger.error(`Error prefetching products: ${error.message}`);
      return [];
    }
  }
}
