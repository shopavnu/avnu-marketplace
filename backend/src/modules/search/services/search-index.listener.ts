import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ElasticsearchService } from './elasticsearch.service';
import { ElasticsearchIndexingService } from './elasticsearch-indexing.service';
import { Product, Brand } from '@modules/products';
import { Merchant } from '@modules/merchants';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class SearchIndexListener {
  private readonly logger: LoggerService;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly elasticsearchIndexingService: ElasticsearchIndexingService,
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(SearchIndexListener.name);
    this.maxRetries = this.configService.get<number>('ELASTICSEARCH_MAX_RETRIES', 3);
    this.retryDelay = this.configService.get<number>('ELASTICSEARCH_RETRY_DELAY_MS', 1000);
  }

  @OnEvent('product.created')
  async handleProductCreatedEvent(product: Product) {
    this.logger.log(`Indexing new product: ${product.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchService.indexProduct(product),
      `index product ${product.id}`,
    );
  }

  @OnEvent('product.updated')
  async handleProductUpdatedEvent(product: Product) {
    this.logger.log(`Updating product in index: ${product.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchService.updateProduct(product),
      `update product ${product.id}`,
    );
  }

  @OnEvent('product.deleted')
  async handleProductDeletedEvent(productId: string) {
    this.logger.log(`Removing product from index: ${productId}`);
    await this.executeWithRetry(
      () => this.elasticsearchService.deleteProduct(productId),
      `delete product ${productId}`,
    );
  }

  @OnEvent('products.bulk_created')
  async handleProductsBulkCreatedEvent(products: Product[]) {
    this.logger.log(`Bulk indexing ${products.length} products`);
    await this.executeWithRetry(
      () => this.elasticsearchService.bulkIndexProducts(products),
      `bulk index ${products.length} products`,
    );
  }

  @OnEvent('products.bulk_updated')
  async handleProductsBulkUpdatedEvent(products: Product[]) {
    this.logger.log(`Bulk updating ${products.length} products`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.bulkUpdateProducts(products),
      `bulk update ${products.length} products`,
    );
  }

  @OnEvent('products.bulk_index')
  async handleProductsBulkIndexEvent(payload: { productIds: string[] }) {
    this.logger.log(`Bulk indexing ${payload.productIds.length} products by ID`);
    try {
      const products = await this.productRepository.find({
        where: { id: In(payload.productIds) },
        relations: ['categories', 'tags', 'brand', 'merchant'],
      });

      if (products.length === 0) {
        this.logger.warn('No products found for bulk indexing');
        return;
      }

      await this.executeWithRetry(
        () => this.elasticsearchService.bulkIndexProducts(products),
        `bulk index ${products.length} products`,
      );
    } catch (error) {
      this.logger.error(`Failed to bulk index products: ${error.message}`);
      throw error;
    }
  }

  @OnEvent('merchant.created')
  async handleMerchantCreatedEvent(merchant: Merchant) {
    this.logger.log(`Indexing new merchant: ${merchant.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.indexMerchant(merchant),
      `index merchant ${merchant.id}`,
    );
  }

  @OnEvent('merchant.updated')
  async handleMerchantUpdatedEvent(merchant: Merchant) {
    this.logger.log(`Updating merchant in index: ${merchant.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.updateMerchant(merchant),
      `update merchant ${merchant.id}`,
    );
  }

  @OnEvent('merchant.deleted')
  async handleMerchantDeletedEvent(merchantId: string) {
    this.logger.log(`Removing merchant from index: ${merchantId}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.deleteMerchant(merchantId),
      `delete merchant ${merchantId}`,
    );
  }

  @OnEvent('merchants.bulk_created')
  async handleMerchantsBulkCreatedEvent(merchants: Merchant[]) {
    this.logger.log(`Bulk indexing ${merchants.length} merchants`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.bulkIndexMerchants(merchants),
      `bulk index ${merchants.length} merchants`,
    );
  }

  @OnEvent('merchants.bulk_index')
  async handleMerchantsBulkIndexEvent(payload: { merchantIds: string[] }) {
    this.logger.log(`Bulk indexing ${payload.merchantIds.length} merchants by ID`);
    try {
      const merchants = await this.merchantRepository.find({
        where: { id: In(payload.merchantIds) },
        relations: ['categories', 'values'],
      });

      if (merchants.length === 0) {
        this.logger.warn('No merchants found for bulk indexing');
        return;
      }

      await this.executeWithRetry(
        () => this.elasticsearchIndexingService.bulkIndexMerchants(merchants),
        `bulk index ${merchants.length} merchants`,
      );
    } catch (error) {
      this.logger.error(`Failed to bulk index merchants: ${error.message}`);
      throw error;
    }
  }

  @OnEvent('brand.created')
  async handleBrandCreatedEvent(brand: Brand) {
    this.logger.log(`Indexing new brand: ${brand.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.indexBrand(brand),
      `index brand ${brand.id}`,
    );
  }

  @OnEvent('brand.updated')
  async handleBrandUpdatedEvent(brand: Brand) {
    this.logger.log(`Updating brand in index: ${brand.id}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.updateBrand(brand),
      `update brand ${brand.id}`,
    );
  }

  @OnEvent('brand.deleted')
  async handleBrandDeletedEvent(brandId: string) {
    this.logger.log(`Removing brand from index: ${brandId}`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.deleteBrand(brandId),
      `delete brand ${brandId}`,
    );
  }

  @OnEvent('brands.bulk_created')
  async handleBrandsBulkCreatedEvent(brands: Brand[]) {
    this.logger.log(`Bulk indexing ${brands.length} brands`);
    await this.executeWithRetry(
      () => this.elasticsearchIndexingService.bulkIndexBrands(brands),
      `bulk index ${brands.length} brands`,
    );
  }

  @OnEvent('brands.bulk_index')
  async handleBrandsBulkIndexEvent(payload: { brandIds: string[] }) {
    this.logger.log(`Bulk indexing ${payload.brandIds.length} brands by ID`);
    try {
      const brands = await this.brandRepository.find({
        where: { id: In(payload.brandIds) },
        relations: ['categories', 'values'],
      });

      if (brands.length === 0) {
        this.logger.warn('No brands found for bulk indexing');
        return;
      }

      await this.executeWithRetry(
        () => this.elasticsearchIndexingService.bulkIndexBrands(brands),
        `bulk index ${brands.length} brands`,
      );
    } catch (error) {
      this.logger.error(`Failed to bulk index brands: ${error.message}`);
      throw error;
    }
  }

  @OnEvent('search.reindex_all')
  async handleReindexAllEvent(payload: { entityType?: string }) {
    const entityType = payload?.entityType || 'all';
    this.logger.log(`Reindexing all ${entityType} entities`);

    try {
      if (entityType === 'all' || entityType === 'products') {
        await this.elasticsearchIndexingService.reindexAllProducts();
      }

      if (entityType === 'all' || entityType === 'merchants') {
        await this.elasticsearchIndexingService.reindexAllMerchants();
      }

      if (entityType === 'all' || entityType === 'brands') {
        await this.elasticsearchIndexingService.reindexAllBrands();
      }

      this.logger.log(`Successfully reindexed ${entityType} entities`);
    } catch (error) {
      this.logger.error(`Failed to reindex ${entityType} entities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param operationName Name of the operation for logging
   * @param retries Number of retries remaining
   */
  private async executeWithRetry(
    fn: () => Promise<any>,
    operationName: string,
    retries: number = this.maxRetries,
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Failed to ${operationName}, retrying... (${retries} attempts left): ${error.message}`,
        );
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.executeWithRetry(fn, operationName, retries - 1);
      } else {
        this.logger.error(
          `Failed to ${operationName} after ${this.maxRetries} attempts: ${error.message}`,
        );
        throw error;
      }
    }
  }
}
