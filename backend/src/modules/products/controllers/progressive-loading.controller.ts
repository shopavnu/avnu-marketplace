import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProgressiveLoadingService } from '../services/progressive-loading.service';
import {
  ProgressiveLoadingDto,
  ProgressiveLoadingResponseDto,
  LoadingPriority,
} from '../dto/progressive-loading.dto';
import { DataNormalizationService } from '../services/data-normalization.service';

/**
 * Controller for progressive loading of products
 * Optimized for continuous scroll with consistent product cards
 */
@ApiTags('products-progressive')
@Controller('products/progressive')
export class ProgressiveLoadingController {
  private readonly logger = new Logger(ProgressiveLoadingController.name);

  constructor(
    private readonly progressiveLoadingService: ProgressiveLoadingService,
    private readonly dataNormalizationService: DataNormalizationService,
  ) {}

  /**
   * Load products progressively based on scroll position
   * Optimized for continuous scroll interfaces
   */
  @Get()
  @ApiOperation({
    summary: 'Load products progressively',
    description:
      'Load products incrementally as the user scrolls, with priority-based loading for visible content.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return products with next cursor',
    type: ProgressiveLoadingResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'priority', required: false, enum: LoadingPriority })
  @ApiQuery({ name: 'fullDetails', required: false, type: Boolean })
  @ApiQuery({ name: 'withMetadata', required: false, type: Boolean })
  async loadProgressively(
    @Query() options: ProgressiveLoadingDto,
  ): Promise<ProgressiveLoadingResponseDto<any>> {
    this.logger.log(`Progressive loading with priority: ${options.priority}`);
    return this.progressiveLoadingService.loadProgressively(options);
  }

  /**
   * Prefetch products for future loading
   * This endpoint is called by the frontend to prepare data before it's needed
   */
  @Get('prefetch')
  @ApiOperation({
    summary: 'Prefetch products for future loading',
    description: "Prefetch product data before it's needed to improve perceived performance.",
  })
  @ApiResponse({
    status: 200,
    description: 'Return IDs of prefetched products',
    type: [String],
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async prefetchProducts(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<string[]> {
    this.logger.log(`Prefetching products with cursor: ${cursor?.substring(0, 10)}...`);
    return this.progressiveLoadingService.prefetchProducts(cursor, limit);
  }

  /**
   * Load products with exclusions
   * Used to load more products while excluding already loaded ones
   */
  @Post('load-more')
  @ApiOperation({
    summary: 'Load more products with exclusions',
    description: 'Load more products while excluding already loaded ones to avoid duplicates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return additional products',
    type: ProgressiveLoadingResponseDto,
  })
  async loadMoreWithExclusions(
    @Body() options: ProgressiveLoadingDto,
  ): Promise<ProgressiveLoadingResponseDto<any>> {
    this.logger.log(`Loading more products with ${options.exclude?.length || 0} exclusions`);
    return this.progressiveLoadingService.loadProgressively(options);
  }
}
