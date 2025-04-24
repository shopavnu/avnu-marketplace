import { Controller, Post, Get, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ElasticsearchIndexingService } from '../services/elasticsearch-indexing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
import {} from /* UserRole */ '../../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('search-indexing')
@Controller('api/search/indexing')
@UseGuards(JwtAuthGuard)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN)
export class IndexingController {
  private readonly logger = new Logger(IndexingController.name);
  private reindexingStatus: Record<string, any> = {};

  constructor(
    private readonly elasticsearchIndexingService: ElasticsearchIndexingService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Subscribe to reindexing progress events
    this.eventEmitter.on('search.reindex_progress', payload => {
      this.reindexingStatus[payload.entityType] = {
        status: 'in_progress',
        processed: payload.processed,
        total: payload.total,
        percentage: payload.percentage,
        lastUpdated: new Date(),
      };
    });

    // Subscribe to reindexing completion events
    this.eventEmitter.on('search.reindex_complete', payload => {
      this.reindexingStatus[payload.entityType] = {
        status: 'completed',
        processed: payload.total,
        total: payload.total,
        percentage: 100,
        lastUpdated: new Date(),
        completedAt: new Date(),
      };
    });

    // Subscribe to reindexing error events
    this.eventEmitter.on('search.reindex_error', payload => {
      this.reindexingStatus[payload.entityType] = {
        status: 'error',
        error: payload.error,
        lastUpdated: new Date(),
      };
    });
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Reindex all entities or a specific entity type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entityType: {
          type: 'string',
          enum: ['all', 'products', 'merchants', 'brands'],
          default: 'all',
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: 'Reindexing started' })
  async reindex(
    @Body('entityType') entityType: 'all' | 'products' | 'merchants' | 'brands' = 'all',
  ) {
    this.logger.log(`Starting reindexing for ${entityType}`);

    // Initialize status
    if (entityType === 'all') {
      this.reindexingStatus.products = { status: 'pending', lastUpdated: new Date() };
      this.reindexingStatus.merchants = { status: 'pending', lastUpdated: new Date() };
      this.reindexingStatus.brands = { status: 'pending', lastUpdated: new Date() };
    } else {
      this.reindexingStatus[entityType] = { status: 'pending', lastUpdated: new Date() };
    }

    // Trigger reindexing asynchronously
    this.eventEmitter.emit('search.reindex_all', { entityType });

    return {
      message: `Reindexing of ${entityType} started`,
      status: 'pending',
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get reindexing status' })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: ['all', 'products', 'merchants', 'brands'],
  })
  @ApiResponse({ status: 200, description: 'Reindexing status' })
  getReindexingStatus(
    @Query('entityType') entityType?: 'all' | 'products' | 'merchants' | 'brands',
  ) {
    if (entityType && entityType !== 'all') {
      return {
        [entityType]: this.reindexingStatus[entityType] || { status: 'not_started' },
      };
    }

    return {
      products: this.reindexingStatus.products || { status: 'not_started' },
      merchants: this.reindexingStatus.merchants || { status: 'not_started' },
      brands: this.reindexingStatus.brands || { status: 'not_started' },
    };
  }

  @Post('products/bulk')
  @ApiOperation({ summary: 'Bulk index products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: 'Bulk indexing started' })
  async bulkIndexProducts(@Body('productIds') productIds: string[]) {
    this.logger.log(`Starting bulk indexing for ${productIds.length} products`);

    // Emit event to trigger bulk indexing
    this.eventEmitter.emit('products.bulk_index', { productIds });

    return {
      message: `Bulk indexing of ${productIds.length} products started`,
      status: 'pending',
    };
  }

  @Post('merchants/bulk')
  @ApiOperation({ summary: 'Bulk index merchants' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        merchantIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: 'Bulk indexing started' })
  async bulkIndexMerchants(@Body('merchantIds') merchantIds: string[]) {
    this.logger.log(`Starting bulk indexing for ${merchantIds.length} merchants`);

    // Emit event to trigger bulk indexing
    this.eventEmitter.emit('merchants.bulk_index', { merchantIds });

    return {
      message: `Bulk indexing of ${merchantIds.length} merchants started`,
      status: 'pending',
    };
  }

  @Post('brands/bulk')
  @ApiOperation({ summary: 'Bulk index brands' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        brandIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 202, description: 'Bulk indexing started' })
  async bulkIndexBrands(@Body('brandIds') brandIds: string[]) {
    this.logger.log(`Starting bulk indexing for ${brandIds.length} brands`);

    // Emit event to trigger bulk indexing
    this.eventEmitter.emit('brands.bulk_index', { brandIds });

    return {
      message: `Bulk indexing of ${brandIds.length} brands started`,
      status: 'pending',
    };
  }
}
