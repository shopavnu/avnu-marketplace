'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var ElasticsearchIndexingService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ElasticsearchIndexingService = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_service_1 = require('./elasticsearch.service');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const product_entity_1 = require('../../products/entities/product.entity');
const merchant_entity_1 = require('../../merchants/entities/merchant.entity');
const brand_entity_1 = require('../../products/entities/brand.entity');
const config_1 = require('@nestjs/config');
const event_emitter_1 = require('@nestjs/event-emitter');
let ElasticsearchIndexingService =
  (ElasticsearchIndexingService_1 = class ElasticsearchIndexingService {
    constructor(
      elasticsearchService,
      configService,
      eventEmitter,
      productRepository,
      merchantRepository,
      brandRepository,
    ) {
      this.elasticsearchService = elasticsearchService;
      this.configService = configService;
      this.eventEmitter = eventEmitter;
      this.productRepository = productRepository;
      this.merchantRepository = merchantRepository;
      this.brandRepository = brandRepository;
      this.logger = new common_1.Logger(ElasticsearchIndexingService_1.name);
      this.bulkBatchSize = this.configService.get('ELASTICSEARCH_BULK_BATCH_SIZE', 100);
      this.indexingConcurrency = this.configService.get('ELASTICSEARCH_INDEXING_CONCURRENCY', 5);
    }
    async indexMerchant(merchant) {
      try {
        await this.elasticsearchService.indexDocument(
          'merchants',
          merchant.id,
          this.serializeMerchant(merchant),
          true,
        );
        this.logger.debug(`Indexed merchant: ${merchant.id}`);
      } catch (error) {
        this.logger.error(`Failed to index merchant: ${error.message}`);
        throw error;
      }
    }
    async updateMerchant(merchant) {
      try {
        await this.elasticsearchService.updateDocument(
          'merchants',
          merchant.id,
          { doc: this.serializeMerchant(merchant) },
          true,
        );
        this.logger.debug(`Updated merchant: ${merchant.id}`);
      } catch (error) {
        if (error.meta?.statusCode === 404) {
          this.logger.warn(`Merchant ${merchant.id} not found for update, attempting index.`);
          return this.indexMerchant(merchant);
        }
        this.logger.error(`Failed to update merchant: ${error.message}`);
        throw error;
      }
    }
    async deleteMerchant(merchantId) {
      try {
        await this.elasticsearchService.deleteDocument('merchants', merchantId, true);
        this.logger.debug(`Deleted merchant: ${merchantId}`);
      } catch (error) {
        if (error.meta?.statusCode === 404) {
          this.logger.warn(`Merchant ${merchantId} not found in index, skipping delete`);
          return;
        }
        this.logger.error(`Failed to delete merchant: ${error.message}`);
        throw error;
      }
    }
    async bulkIndexMerchants(merchants) {
      if (!merchants || merchants.length === 0) {
        return;
      }
      try {
        const body = merchants.flatMap(merchant => [
          { index: { _index: 'merchants', _id: merchant.id } },
          this.serializeMerchant(merchant),
        ]);
        await this.elasticsearchService.bulkOperation(body, true);
        this.logger.debug(`Bulk indexed ${merchants.length} merchants`);
      } catch (error) {
        this.logger.error(`Failed to bulk index merchants: ${error.message}`);
        throw error;
      }
    }
    async indexBrand(brand) {
      try {
        await this.elasticsearchService.indexDocument(
          'brands',
          brand.id,
          this.serializeBrand(brand),
          true,
        );
        this.logger.debug(`Indexed brand: ${brand.id}`);
      } catch (error) {
        this.logger.error(`Failed to index brand: ${error.message}`);
        throw error;
      }
    }
    async updateBrand(brand) {
      try {
        await this.elasticsearchService.updateDocument(
          'brands',
          brand.id,
          { doc: this.serializeBrand(brand) },
          true,
        );
        this.logger.debug(`Updated brand: ${brand.id}`);
      } catch (error) {
        if (error.meta?.statusCode === 404) {
          this.logger.warn(`Brand ${brand.id} not found for update, attempting index.`);
          return this.indexBrand(brand);
        }
        this.logger.error(`Failed to update brand: ${error.message}`);
        throw error;
      }
    }
    async deleteBrand(brandId) {
      try {
        await this.elasticsearchService.deleteDocument('brands', brandId, true);
        this.logger.debug(`Deleted brand: ${brandId}`);
      } catch (error) {
        if (error.meta?.statusCode === 404) {
          this.logger.warn(`Brand ${brandId} not found in index, skipping delete`);
          return;
        }
        this.logger.error(`Failed to delete brand: ${error.message}`);
        throw error;
      }
    }
    async bulkIndexBrands(brands) {
      if (!brands || brands.length === 0) {
        return;
      }
      try {
        const body = brands.flatMap(brand => [
          { index: { _index: 'brands', _id: brand.id } },
          this.serializeBrand(brand),
        ]);
        await this.elasticsearchService.bulkOperation(body, true);
        this.logger.debug(`Bulk indexed ${brands.length} brands`);
      } catch (error) {
        this.logger.error(`Failed to bulk index brands: ${error.message}`);
        throw error;
      }
    }
    async bulkUpdateProducts(products) {
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
            doc_as_upsert: false,
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
    async reindexAllProducts() {
      this.logger.log('Starting reindexing of all products');
      try {
        const tempIndexName = `products_reindex_${Date.now()}`;
        let processedCount = 0;
        const totalProducts = await this.productRepository.count();
        this.logger.log(`Starting reindex for ${totalProducts} products into ${tempIndexName}`);
        this.logger.debug(`Creating temporary index: ${tempIndexName}`);
        const mapping = await this.elasticsearchService.getIndexMapping('products');
        await this.elasticsearchService.createIndex(tempIndexName, mapping, {
          refresh_interval: '-1',
          number_of_replicas: 0,
        });
        this.logger.debug(`Temporary index ${tempIndexName} created.`);
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
          await this.elasticsearchService.bulkOperation(body, false);
          processedCount += productsBatch.length;
          this.logger.log(`Indexed ${processedCount}/${totalProducts} products`);
        }
        await this.elasticsearchService.updateIndexSettings(tempIndexName, {
          refresh_interval: '1s',
          number_of_replicas: 1,
        });
        await this.elasticsearchService.refreshIndex(tempIndexName);
        const originalIndexExists = await this.elasticsearchService.indexExists('products');
        if (originalIndexExists) {
          this.logger.log('Updating aliases to point to new index');
          await this.elasticsearchService.updateAliases({
            body: {
              actions: [
                { remove: { index: 'products', alias: 'products_current' } },
                { add: { index: tempIndexName, alias: 'products_current' } },
              ],
            },
          });
          this.logger.log('Deleting old products index');
          await this.elasticsearchService.deleteIndex('products');
        }
        this.logger.log(`Adding primary alias 'products' to ${tempIndexName}`);
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [{ add: { index: tempIndexName, alias: 'products' } }],
          },
        });
        this.logger.log(`Successfully reindexed ${totalProducts} products`);
      } catch (error) {
        this.logger.error(`Failed to reindex products: ${error.message}`);
        this.eventEmitter.emit('search.reindex_error', {
          entityType: 'products',
          error: error.message,
        });
        throw error;
      }
    }
    async reindexAllMerchants() {
      this.logger.log('Starting reindexing of all merchants');
      try {
        const tempIndexName = `merchants_reindex_${Date.now()}`;
        let processedCount = 0;
        const totalMerchants = await this.merchantRepository.count();
        this.logger.log(`Starting reindex for ${totalMerchants} merchants into ${tempIndexName}`);
        this.logger.debug(`Creating temporary index: ${tempIndexName}`);
        const mapping = await this.elasticsearchService.getIndexMapping('merchants');
        await this.elasticsearchService.createIndex(tempIndexName, mapping, {
          refresh_interval: '-1',
          number_of_replicas: 0,
        });
        this.logger.debug(`Temporary index ${tempIndexName} created.`);
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
        await this.elasticsearchService.updateIndexSettings(tempIndexName, {
          refresh_interval: '1s',
          number_of_replicas: 1,
        });
        await this.elasticsearchService.refreshIndex(tempIndexName);
        const originalIndexExists = await this.elasticsearchService.indexExists('merchants');
        if (originalIndexExists) {
          this.logger.log('Updating aliases to point to new index');
          await this.elasticsearchService.updateAliases({
            body: {
              actions: [
                { remove: { index: 'merchants', alias: 'merchants_current' } },
                { add: { index: tempIndexName, alias: 'merchants_current' } },
              ],
            },
          });
          this.logger.log('Deleting old merchants index');
          await this.elasticsearchService.deleteIndex('merchants');
        }
        this.logger.log(`Adding primary alias 'merchants' to ${tempIndexName}`);
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [{ add: { index: tempIndexName, alias: 'merchants' } }],
          },
        });
        this.logger.log(`Successfully reindexed ${totalMerchants} merchants`);
      } catch (error) {
        this.logger.error(`Failed to reindex merchants: ${error.message}`);
        this.eventEmitter.emit('search.reindex_error', {
          entityType: 'merchants',
          error: error.message,
        });
        throw error;
      }
    }
    async reindexAllBrands() {
      this.logger.log('Starting reindexing of all brands');
      try {
        const tempIndexName = `brands_reindex_${Date.now()}`;
        let processedCount = 0;
        const totalBrands = await this.brandRepository.count();
        this.logger.log(`Starting reindex for ${totalBrands} brands into ${tempIndexName}`);
        this.logger.debug(`Creating temporary index: ${tempIndexName}`);
        const mapping = await this.elasticsearchService.getIndexMapping('brands');
        await this.elasticsearchService.createIndex(tempIndexName, mapping, {
          refresh_interval: '-1',
          number_of_replicas: 0,
        });
        this.logger.debug(`Temporary index ${tempIndexName} created.`);
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
        await this.elasticsearchService.updateIndexSettings(tempIndexName, {
          refresh_interval: '1s',
          number_of_replicas: 1,
        });
        await this.elasticsearchService.refreshIndex(tempIndexName);
        const originalIndexExists = await this.elasticsearchService.indexExists('brands');
        if (originalIndexExists) {
          this.logger.log('Updating aliases to point to new index');
          await this.elasticsearchService.updateAliases({
            body: {
              actions: [
                { remove: { index: 'brands', alias: 'brands_current' } },
                { add: { index: tempIndexName, alias: 'brands_current' } },
              ],
            },
          });
          this.logger.log('Deleting old brands index');
          await this.elasticsearchService.deleteIndex('brands');
        }
        this.logger.log(`Adding primary alias 'brands' to ${tempIndexName}`);
        await this.elasticsearchService.updateAliases({
          body: {
            actions: [{ add: { index: tempIndexName, alias: 'brands' } }],
          },
        });
        this.logger.log(`Successfully reindexed ${totalBrands} brands`);
      } catch (error) {
        this.logger.error(`Failed to reindex brands: ${error.message}`);
        this.eventEmitter.emit('search.reindex_error', {
          entityType: 'brands',
          error: error.message,
        });
        throw error;
      }
    }
    serializeMerchant(merchant) {
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
    serializeBrand(brand) {
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
    serializeProduct(product) {
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
  });
exports.ElasticsearchIndexingService = ElasticsearchIndexingService;
exports.ElasticsearchIndexingService =
  ElasticsearchIndexingService =
  ElasticsearchIndexingService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __param(4, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
        __param(5, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
        __metadata('design:paramtypes', [
          elasticsearch_service_1.ElasticsearchService,
          config_1.ConfigService,
          event_emitter_1.EventEmitter2,
          typeorm_2.Repository,
          typeorm_2.Repository,
          typeorm_2.Repository,
        ]),
      ],
      ElasticsearchIndexingService,
    );
//# sourceMappingURL=elasticsearch-indexing.service.js.map
