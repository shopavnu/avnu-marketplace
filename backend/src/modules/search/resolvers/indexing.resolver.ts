import { Resolver, Mutation, Query, Args /*, Int */ } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ElasticsearchIndexingService } from '../services/elasticsearch-indexing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Brand } from '../../products/entities/brand.entity';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class IndexingResolver {
  private reindexingStatus: Record<string, any> = {};

  constructor(
    private readonly elasticsearchIndexingService: ElasticsearchIndexingService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
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

  @Mutation(() => Boolean, { description: 'Reindex all entities or a specific entity type' })
  async reindexAll(
    @Args('entityType', { nullable: true, defaultValue: 'all' }) entityType: string,
  ): Promise<boolean> {
    // Trigger reindexing asynchronously
    this.eventEmitter.emit('search.reindex_all', { entityType });

    return true;
  }

  @Query(() => String, { description: 'Get reindexing status' })
  getReindexingStatus(@Args('entityType', { nullable: true }) entityType?: string): string {
    if (entityType && entityType !== 'all') {
      return JSON.stringify({
        [entityType]: this.reindexingStatus[entityType] || { status: 'not_started' },
      });
    }

    return JSON.stringify({
      products: this.reindexingStatus.products || { status: 'not_started' },
      merchants: this.reindexingStatus.merchants || { status: 'not_started' },
      brands: this.reindexingStatus.brands || { status: 'not_started' },
    });
  }

  @Mutation(() => Boolean, { description: 'Bulk index products by IDs' })
  async bulkIndexProducts(
    @Args('productIds', { type: () => [String] }) productIds: string[],
  ): Promise<boolean> {
    this.eventEmitter.emit('products.bulk_index', { productIds });
    return true;
  }

  @Mutation(() => Boolean, { description: 'Bulk index merchants by IDs' })
  async bulkIndexMerchants(
    @Args('merchantIds', { type: () => [String] }) merchantIds: string[],
  ): Promise<boolean> {
    this.eventEmitter.emit('merchants.bulk_index', { merchantIds });
    return true;
  }

  @Mutation(() => Boolean, { description: 'Bulk index brands by IDs' })
  async bulkIndexBrands(
    @Args('brandIds', { type: () => [String] }) brandIds: string[],
  ): Promise<boolean> {
    this.eventEmitter.emit('brands.bulk_index', { brandIds });
    return true;
  }
}
