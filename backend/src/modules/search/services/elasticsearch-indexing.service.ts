import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Brand } from '../../products/entities/brand.entity';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service responsible for managing Elasticsearch indexing operations
 * This service extends the functionality of ElasticsearchService with
 * additional methods for indexing, bulk operations, and reindexing
 */
@Injectable()
export class ElasticsearchIndexingService {
  private readonly logger = new Logger(ElasticsearchIndexingService.name);
  private readonly bulkBatchSize: number;
  private readonly indexingConcurrency: number;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {
    this.bulkBatchSize = this.configService.get<number>('ELASTICSEARCH_BULK_BATCH_SIZE', 100);
    this.indexingConcurrency = this.configService.get<number>(
      'ELASTICSEARCH_INDEXING_CONCURRENCY',
      5,
    );
  }

  /**
   * Index a merchant in Elasticsearch
   * @param merchant Merchant to index
   */
  async indexMerchant(merchant: Merchant): Promise<void> {
    try {
      await this.elasticsearchService.indexDocument(
        'merchants',
        merchant.id,
        this.serializeMerchant(merchant),
        true, // refresh
      );
      this.logger.debug(`Indexed merchant: ${merchant.id}`);
    } catch (error) {
      this.logger.error(`Failed to index merchant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a merchant in Elasticsearch
   * @param merchant Merchant to update
   */
  async updateMerchant(merchant: Merchant): Promise<void> {
    try {
      await this.elasticsearchService.updateDocument(
        'merchants',
        merchant.id,
        { doc: this.serializeMerchant(merchant) },
        true, // refresh
      );
      this.logger.debug(`Updated merchant: ${merchant.id}`);
    } catch (error: any) {
      // If document doesn't exist (404), index it instead
      if (error.meta?.statusCode === 404) {
        this.logger.warn(`Merchant ${merchant.id} not found for update, attempting index.`);
        return this.indexMerchant(merchant);
      }
      this.logger.error(`Failed to update merchant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a merchant from Elasticsearch
   * @param merchantId Merchant ID to delete
   */
  async deleteMerchant(merchantId: string): Promise<void> {
    try {
      await this.elasticsearchService.deleteDocument('merchants', merchantId, true);
      this.logger.debug(`Deleted merchant: ${merchantId}`);
    } catch (error: any) {
      // Ignore if document doesn't exist (404)
      if (error.meta?.statusCode === 404) {
        this.logger.warn(`Merchant ${merchantId} not found in index, skipping delete`);
        return;
      }
      this.logger.error(`Failed to delete merchant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk index merchants in Elasticsearch
   * @param merchants Merchants to index
   */
  async bulkIndexMerchants(merchants: Merchant[]): Promise<void> {
    if (!merchants || merchants.length === 0) {
      return;
    }

    try {
      const body = merchants.flatMap(merchant => [
        { index: { _index: 'merchants', _id: merchant.id } },
        this.serializeMerchant(merchant),
      ]);

      await this.elasticsearchService.bulkOperation(body, true); // refresh = true

      this.logger.debug(`Bulk indexed ${merchants.length} merchants`);
    } catch (error) {
      this.logger.error(`Failed to bulk index merchants: ${error.message}`);
      throw error;
    }
  }

  /**
   * Index a brand in Elasticsearch
   * @param brand Brand to index
   */
  async indexBrand(brand: Brand): Promise<void> {
    try {
      await this.elasticsearchService.indexDocument(
        'brands',
        brand.id,
        this.serializeBrand(brand),
        true, // refresh
      );
      this.logger.debug(`Indexed brand: ${brand.id}`);
    } catch (error) {
      this.logger.error(`Failed to index brand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a brand in Elasticsearch
   * @param brand Brand to update
   */
  async updateBrand(brand: Brand): Promise<void> {
    try {
      await this.elasticsearchService.updateDocument(
        'brands',
        brand.id,
        { doc: this.serializeBrand(brand) },
        true, // refresh
      );
      this.logger.debug(`Updated brand: ${brand.id}`);
    } catch (error: any) {
      // If document doesn't exist (404), index it instead
      if (error.meta?.statusCode === 404) {
        this.logger.warn(`Brand ${brand.id} not found for update, attempting index.`);
        return this.indexBrand(brand);
      }
      this.logger.error(`Failed to update brand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a brand from Elasticsearch
   * @param brandId Brand ID to delete
   */
  async deleteBrand(brandId: string): Promise<void> {
    try {
      await this.elasticsearchService.deleteDocument('brands', brandId, true);
      this.logger.debug(`Deleted brand: ${brandId}`);
    } catch (error: any) {
      // Ignore if document doesn't exist (404)
      if (error.meta?.statusCode === 404) {
        this.logger.warn(`Brand ${brandId} not found in index, skipping delete`);
        return;
      }
      this.logger.error(`Failed to delete brand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk index brands in Elasticsearch
   * @param brands Brands to index
   */
  async bulkIndexBrands(brands: Brand[]): Promise<void> {
    if (!brands || brands.length === 0) {
      return;
    }

    try {
      const body = brands.flatMap(brand => [
        { index: { _index: 'brands', _id: brand.id } },
        this.serializeBrand(brand),
      ]);

      await this.elasticsearchService.bulkOperation(body, true); // refresh = true

      this.logger.debug(`Bulk indexed ${brands.length} brands`);
    } catch (error) {
      this.logger.error(`Failed to bulk index brands: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk update products in Elasticsearch
   * @param products Products to update
   */
  async bulkUpdateProducts(products: Product[]): Promise<void> {
    if (!products || products.length === 0) {
      return;
    }

    try {
      const body = products.flatMap(product => [
        { update: { _index: 'products', _id: product.id } },
        {
          doc: {
            title: product.title,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            images: product.images,
            thumbnail: product.thumbnail,
            categories: product.categories,
            tags: product.tags,
            merchantId: product.merchantId,
            brandName: product.brandName,
            isActive: product.isActive,
            inStock: product.inStock,
            quantity: product.quantity,
            values: product.values,
            externalId: product.externalId,
            externalSource: product.externalSource,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            isOnSale: product.compareAtPrice !== null && product.price < product.compareAtPrice,
          },
          doc_as_upsert: false, // Do not create if doesn't exist
        },
      ]);

      try {
        await this.elasticsearchService.bulkOperation(body, true);
        this.logger.debug(`Bulk updated ${products.length} products`);
      } catch (error) {
        this.logger.error(`Bulk updating products had errors: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to bulk update products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reindex all products from the database to Elasticsearch
   */
  async reindexAllProducts(): Promise<void> {
    this.logger.log('Starting reindexing of all products');

    try {
      const tempIndexName = `products_reindex_${Date.now()}`;
      let processedCount = 0;

      // Fetch total count for progress reporting
      const totalProducts = await this.productRepository.count();
      this.logger.log(`Starting reindex for ${totalProducts} products into ${tempIndexName}`);

      // 1. Create a new index with mapping and settings
      this.logger.debug(`Creating temporary index: ${tempIndexName}`);
      const mapping = await this.elasticsearchService.getIndexMapping('products');
      await this.elasticsearchService.createIndex(tempIndexName, mapping, {
        refresh_interval: '-1',
        number_of_replicas: 0, // Optimize for indexing speed
      });
      this.logger.debug(`Temporary index ${tempIndexName} created.`);

      // 2. Index documents in batches
      const batchSize = this.bulkBatchSize;
      while (processedCount < totalProducts) {
        const productsBatch = await this.productRepository.find({
          skip: processedCount,
          take: batchSize,
          relations: ['categories', 'tags', 'brand', 'merchant'],
        });

        if (productsBatch.length === 0) {
          break;
        }

        const body = productsBatch.flatMap(product => [
          { index: { _index: tempIndexName, _id: product.id } },
          this.serializeProduct(product),
        ]);

        await this.elasticsearchService.bulkOperation(body, false); // No need to refresh yet

        processedCount += productsBatch.length;
        this.logger.log(`Indexed ${processedCount}/${totalProducts} products`);
      }

      // Enable refresh and replicas
      await this.elasticsearchService.updateIndexSettings(tempIndexName, {
        refresh_interval: '1s',
        number_of_replicas: 1,
      });

      // Refresh the index
      await this.elasticsearchService.refreshIndex(tempIndexName);

      // Check if the original index exists
      const originalIndexExists = await this.elasticsearchService.indexExists('products');

      if (originalIndexExists) {
        // Update aliases
        this.logger.log('Updating aliases to point to new index');
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [
              { remove: { index: 'products', alias: 'products_current' } }, // Assuming an alias 'products_current' exists
              { add: { index: tempIndexName, alias: 'products_current' } },
            ],
          },
        });

        // Delete the old index
        this.logger.log('Deleting old products index');
        await this.elasticsearchService.deleteIndex('products');
      }

      // Rename the temporary index (or add the main alias)
      this.logger.log(`Adding primary alias 'products' to ${tempIndexName}`);
      await this.elasticsearchService.updateAliases({
        body: {
          actions: [{ add: { index: tempIndexName, alias: 'products' } }],
        },
      });

      this.logger.log(`Successfully reindexed ${totalProducts} products`);
    } catch (error) {
      this.logger.error(`Failed to reindex products: ${error.message}`);

      // Emit error event
      this.eventEmitter.emit('search.reindex_error', {
        entityType: 'products',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Reindex all merchants from the database to Elasticsearch
   */
  async reindexAllMerchants(): Promise<void> {
    this.logger.log('Starting reindexing of all merchants');

    try {
      const tempIndexName = `merchants_reindex_${Date.now()}`;
      let processedCount = 0;

      const totalMerchants = await this.merchantRepository.count();
      this.logger.log(`Starting reindex for ${totalMerchants} merchants into ${tempIndexName}`);

      // 1. Create temporary index
      this.logger.debug(`Creating temporary index: ${tempIndexName}`);
      const mapping = await this.elasticsearchService.getIndexMapping('merchants');
      await this.elasticsearchService.createIndex(tempIndexName, mapping, {
        refresh_interval: '-1',
        number_of_replicas: 0,
      });
      this.logger.debug(`Temporary index ${tempIndexName} created.`);

      // 2. Index documents in batches
      const batchSize = this.bulkBatchSize;
      while (processedCount < totalMerchants) {
        const merchants = await this.merchantRepository.find({
          skip: processedCount,
          take: batchSize,
          relations: ['categories', 'values'],
        });

        if (merchants.length === 0) {
          break;
        }

        const body = merchants.flatMap(merchant => [
          { index: { _index: tempIndexName, _id: merchant.id } },
          this.serializeMerchant(merchant),
        ]);

        await this.elasticsearchService.bulkOperation(body, false);

        processedCount += merchants.length;
        this.logger.log(`Indexed ${processedCount}/${totalMerchants} merchants`);
      }

      // Enable refresh and replicas
      await this.elasticsearchService.updateIndexSettings(tempIndexName, {
        refresh_interval: '1s',
        number_of_replicas: 1,
      });

      // Refresh the index
      await this.elasticsearchService.refreshIndex(tempIndexName);

      // Check if the original index exists
      const originalIndexExists = await this.elasticsearchService.indexExists('merchants');

      if (originalIndexExists) {
        // Update aliases
        this.logger.log('Updating aliases to point to new index');
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [
              { remove: { index: 'merchants', alias: 'merchants_current' } },
              { add: { index: tempIndexName, alias: 'merchants_current' } },
            ],
          },
        });

        // Delete the old index
        this.logger.log('Deleting old merchants index');
        await this.elasticsearchService.deleteIndex('merchants');
      }

      // Rename the temporary index
      this.logger.log(`Adding primary alias 'merchants' to ${tempIndexName}`);
      await this.elasticsearchService.updateAliases({
        body: {
          actions: [{ add: { index: tempIndexName, alias: 'merchants' } }],
        },
      });

      this.logger.log(`Successfully reindexed ${totalMerchants} merchants`);
    } catch (error) {
      this.logger.error(`Failed to reindex merchants: ${error.message}`);

      // Emit error event
      this.eventEmitter.emit('search.reindex_error', {
        entityType: 'merchants',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Reindex all brands from the database to Elasticsearch
   */
  async reindexAllBrands(): Promise<void> {
    this.logger.log('Starting reindexing of all brands');

    try {
      const tempIndexName = `brands_reindex_${Date.now()}`;
      let processedCount = 0;

      const totalBrands = await this.brandRepository.count();
      this.logger.log(`Starting reindex for ${totalBrands} brands into ${tempIndexName}`);

      // 1. Create temporary index
      this.logger.debug(`Creating temporary index: ${tempIndexName}`);
      const mapping = await this.elasticsearchService.getIndexMapping('brands');
      await this.elasticsearchService.createIndex(tempIndexName, mapping, {
        refresh_interval: '-1',
        number_of_replicas: 0,
      });
      this.logger.debug(`Temporary index ${tempIndexName} created.`);

      // 2. Index documents in batches
      const batchSize = this.bulkBatchSize;
      while (processedCount < totalBrands) {
        const brands = await this.brandRepository.find({
          skip: processedCount,
          take: batchSize,
          relations: ['categories', 'values'],
        });

        if (brands.length === 0) {
          break;
        }

        const body = brands.flatMap(brand => [
          { index: { _index: tempIndexName, _id: brand.id } },
          this.serializeBrand(brand),
        ]);

        await this.elasticsearchService.bulkOperation(body, false);

        processedCount += brands.length;
        this.logger.log(`Indexed ${processedCount}/${totalBrands} brands`);
      }

      // Enable refresh and replicas
      await this.elasticsearchService.updateIndexSettings(tempIndexName, {
        refresh_interval: '1s',
        number_of_replicas: 1,
      });

      // Refresh the index
      await this.elasticsearchService.refreshIndex(tempIndexName);

      // Check if the original index exists
      const originalIndexExists = await this.elasticsearchService.indexExists('brands');

      if (originalIndexExists) {
        // Update aliases
        this.logger.log('Updating aliases to point to new index');
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [
              { remove: { index: 'brands', alias: 'brands_current' } },
              { add: { index: tempIndexName, alias: 'brands_current' } },
            ],
          },
        });

        // Delete the old index
        this.logger.log('Deleting old brands index');
        await this.elasticsearchService.deleteIndex('brands');
      }

      // Rename the temporary index
      this.logger.log(`Adding primary alias 'brands' to ${tempIndexName}`);
      await this.elasticsearchService.updateAliases({
        body: {
          actions: [{ add: { index: tempIndexName, alias: 'brands' } }],
        },
      });

      this.logger.log(`Successfully reindexed ${totalBrands} brands`);
    } catch (error) {
      this.logger.error(`Failed to reindex brands: ${error.message}`);

      // Emit error event
      this.eventEmitter.emit('search.reindex_error', {
        entityType: 'brands',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Serialize a merchant for Elasticsearch indexing
   * @param merchant Merchant to serialize
   */
  private serializeMerchant(merchant: Merchant): any {
    return {
      id: merchant.id,
      name: merchant.name,
      description: merchant.description,
      logo: merchant.logo,
      website: merchant.website,
      location:
        merchant.latitude && merchant.longitude
          ? { lat: merchant.latitude, lon: merchant.longitude }
          : null,
      rating: merchant.rating,
      reviewCount: merchant.reviewCount,
      categories: merchant.categories,
      values: merchant.values,
      productCount: merchant.productCount,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
      isActive: merchant.isActive,
      popularity: merchant.popularity,
    };
  }

  /**
   * Serialize a brand for Elasticsearch indexing
   * @param brand Brand to serialize
   */
  private serializeBrand(brand: Brand): any {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      website: brand.website,
      categories: brand.categories,
      values: brand.values,
      foundedYear: brand.foundedYear,
      origin: brand.origin,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      isActive: brand.isActive,
      popularity: brand.popularity,
    };
  }

  private serializeProduct(product: Product): any {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      thumbnail: product.thumbnail,
      categories: product.categories,
      tags: product.tags,
      merchantId: product.merchantId,
      brandName: product.brandName,
      isActive: product.isActive,
      inStock: product.inStock,
      quantity: product.quantity,
      values: product.values,
      externalId: product.externalId,
      externalSource: product.externalSource,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      isOnSale: product.compareAtPrice !== null && product.price < product.compareAtPrice,
    };
  }
}
