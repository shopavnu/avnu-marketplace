import { ElasticsearchService } from './elasticsearch.service';
import { ElasticsearchIndexingService } from './elasticsearch-indexing.service';
import { Product, Brand } from '@modules/products';
import { Merchant } from '@modules/merchants';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { LoggerService } from '@common/services/logger.service';
export declare class SearchIndexListener {
  private readonly elasticsearchService;
  private readonly elasticsearchIndexingService;
  private readonly configService;
  private readonly productRepository;
  private readonly merchantRepository;
  private readonly brandRepository;
  private readonly loggerService;
  private readonly logger;
  private readonly maxRetries;
  private readonly retryDelay;
  constructor(
    elasticsearchService: ElasticsearchService,
    elasticsearchIndexingService: ElasticsearchIndexingService,
    configService: ConfigService,
    productRepository: Repository<Product>,
    merchantRepository: Repository<Merchant>,
    brandRepository: Repository<Brand>,
    loggerService: LoggerService,
  );
  handleProductCreatedEvent(product: Product): Promise<void>;
  handleProductUpdatedEvent(product: Product): Promise<void>;
  handleProductDeletedEvent(productId: string): Promise<void>;
  handleProductsBulkCreatedEvent(products: Product[]): Promise<void>;
  handleProductsBulkUpdatedEvent(products: Product[]): Promise<void>;
  handleProductsBulkIndexEvent(payload: { productIds: string[] }): Promise<void>;
  handleMerchantCreatedEvent(merchant: Merchant): Promise<void>;
  handleMerchantUpdatedEvent(merchant: Merchant): Promise<void>;
  handleMerchantDeletedEvent(merchantId: string): Promise<void>;
  handleMerchantsBulkCreatedEvent(merchants: Merchant[]): Promise<void>;
  handleMerchantsBulkIndexEvent(payload: { merchantIds: string[] }): Promise<void>;
  handleBrandCreatedEvent(brand: Brand): Promise<void>;
  handleBrandUpdatedEvent(brand: Brand): Promise<void>;
  handleBrandDeletedEvent(brandId: string): Promise<void>;
  handleBrandsBulkCreatedEvent(brands: Brand[]): Promise<void>;
  handleBrandsBulkIndexEvent(payload: { brandIds: string[] }): Promise<void>;
  handleReindexAllEvent(payload: { entityType?: string }): Promise<void>;
  private executeWithRetry;
}
