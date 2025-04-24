import { ElasticsearchIndexingService } from '../services/elasticsearch-indexing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Brand } from '../../products/entities/brand.entity';
export declare class IndexingResolver {
    private readonly elasticsearchIndexingService;
    private readonly eventEmitter;
    private readonly productRepository;
    private readonly merchantRepository;
    private readonly brandRepository;
    private reindexingStatus;
    constructor(elasticsearchIndexingService: ElasticsearchIndexingService, eventEmitter: EventEmitter2, productRepository: Repository<Product>, merchantRepository: Repository<Merchant>, brandRepository: Repository<Brand>);
    reindexAll(entityType: string): Promise<boolean>;
    getReindexingStatus(entityType?: string): string;
    bulkIndexProducts(productIds: string[]): Promise<boolean>;
    bulkIndexMerchants(merchantIds: string[]): Promise<boolean>;
    bulkIndexBrands(brandIds: string[]): Promise<boolean>;
}
