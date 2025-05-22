import { ElasticsearchIndexingService } from '../services/elasticsearch-indexing.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class IndexingController {
  private readonly elasticsearchIndexingService;
  private readonly eventEmitter;
  private readonly logger;
  private reindexingStatus;
  constructor(
    elasticsearchIndexingService: ElasticsearchIndexingService,
    eventEmitter: EventEmitter2,
  );
  reindex(entityType?: 'all' | 'products' | 'merchants' | 'brands'): Promise<{
    message: string;
    status: string;
  }>;
  getReindexingStatus(entityType?: 'all' | 'products' | 'merchants' | 'brands'):
    | {
        [entityType]: any;
        products?: undefined;
        merchants?: undefined;
        brands?: undefined;
      }
    | {
        products: any;
        merchants: any;
        brands: any;
      };
  bulkIndexProducts(productIds: string[]): Promise<{
    message: string;
    status: string;
  }>;
  bulkIndexMerchants(merchantIds: string[]): Promise<{
    message: string;
    status: string;
  }>;
  bulkIndexBrands(brandIds: string[]): Promise<{
    message: string;
    status: string;
  }>;
}
