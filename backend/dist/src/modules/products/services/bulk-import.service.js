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
var BulkImportService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.BulkImportService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const data_normalization_service_1 = require('./data-normalization.service');
const products_service_1 = require('../products.service');
let BulkImportService = (BulkImportService_1 = class BulkImportService {
  constructor(dataNormalizationService, productsService, configService) {
    this.dataNormalizationService = dataNormalizationService;
    this.productsService = productsService;
    this.configService = configService;
    this.logger = new common_1.Logger(BulkImportService_1.name);
  }
  async importProducts(products, options = {}) {
    const defaultOptions = {
      source: data_normalization_service_1.DataSource.MANUAL,
      merchantId: '',
      skipExisting: true,
      batchSize: 10,
      validateOnly: false,
      processImages: true,
    };
    const importOptions = { ...defaultOptions, ...options };
    const result = {
      total: products.length,
      successful: 0,
      failed: 0,
      errors: [],
      products: [],
    };
    const batches = this.chunkArray(products, importOptions.batchSize);
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.logger.log(
        `Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products)`,
      );
      const batchPromises = batch.map(async (rawProduct, index) => {
        const originalIndex = batchIndex * importOptions.batchSize + index;
        try {
          if (importOptions.skipExisting && rawProduct.externalId) {
            const existingProduct = await this.productsService.findByExternalId(
              rawProduct.externalId,
              importOptions.source,
            );
            if (existingProduct) {
              this.logger.log(
                `Skipping existing product with externalId: ${rawProduct.externalId}`,
              );
              return null;
            }
          }
          const normalizedProduct = await this.dataNormalizationService.normalizeProductData(
            rawProduct,
            importOptions.source,
            {
              processImages: importOptions.processImages,
              validateImages: true,
              sanitizeText: true,
              enforceRequiredFields: true,
            },
          );
          if (importOptions.merchantId) {
            normalizedProduct.merchantId = importOptions.merchantId;
          }
          if (importOptions.validateOnly) {
            return { validated: true, product: normalizedProduct };
          }
          const createdProduct = await this.productsService.create(normalizedProduct);
          return { created: true, product: createdProduct, id: createdProduct.id };
        } catch (error) {
          this.logger.error(`Error importing product at index ${originalIndex}: ${error.message}`);
          result.errors.push({
            index: originalIndex,
            externalId: rawProduct.externalId || rawProduct.id,
            error: error.message,
          });
          return { error: true, message: error.message };
        }
      });
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(batchResult => {
        if (!batchResult) {
          return;
        }
        if (batchResult.error) {
          result.failed++;
        } else {
          result.successful++;
          if (batchResult.created && batchResult.product && 'id' in batchResult.product) {
            result.products.push(batchResult.product.id);
          }
        }
      });
    }
    return result;
  }
  async importFromShopify(shopifyData, options = {}) {
    const shopifyProducts = Array.isArray(shopifyData) ? shopifyData : shopifyData.products || [];
    return this.importProducts(shopifyProducts, {
      ...options,
      source: data_normalization_service_1.DataSource.SHOPIFY,
    });
  }
  async importFromWooCommerce(wooCommerceData, options = {}) {
    const wooProducts = Array.isArray(wooCommerceData)
      ? wooCommerceData
      : wooCommerceData.products || [];
    return this.importProducts(wooProducts, {
      ...options,
      source: data_normalization_service_1.DataSource.WOOCOMMERCE,
    });
  }
  async importFromEtsy(etsyData, options = {}) {
    const etsyProducts = Array.isArray(etsyData) ? etsyData : etsyData.results || [];
    return this.importProducts(etsyProducts, {
      ...options,
      source: data_normalization_service_1.DataSource.ETSY,
    });
  }
  async validateProducts(products, source = data_normalization_service_1.DataSource.MANUAL) {
    const valid = [];
    const invalid = [];
    for (let i = 0; i < products.length; i++) {
      try {
        const normalizedProduct = await this.dataNormalizationService.normalizeProductData(
          products[i],
          source,
          {
            processImages: false,
            validateImages: true,
            sanitizeText: true,
            enforceRequiredFields: true,
          },
        );
        valid.push(normalizedProduct);
      } catch (error) {
        invalid.push({
          index: i,
          errors: [error.message],
        });
      }
    }
    return { valid, invalid };
  }
  async processExistingProducts(productIds, options) {
    const processingOptions = {
      processImages: options?.processImages ?? true,
      updateSlug: options?.updateSlug ?? true,
      batchSize: options?.batchSize ?? 20,
    };
    let productsToProcess = [];
    try {
      if (productIds && productIds.length > 0) {
        const productPromises = productIds.map(id => this.productsService.findOne(id));
        const products = await Promise.all(productPromises);
        productsToProcess = products.filter(product => product !== null);
      } else {
        const paginationDto = { page: 1, limit: 1000 };
        const result = await this.productsService.findAll(paginationDto);
        productsToProcess = Array.isArray(result) ? result : result.items;
      }
    } catch (error) {
      this.logger.error(`Error fetching products: ${error.message}`);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    const result = {
      total: productsToProcess.length,
      processed: 0,
      failed: 0,
      errors: [],
    };
    const batches = this.chunkArray(productsToProcess, processingOptions.batchSize);
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.logger.log(`Processing existing products batch ${batchIndex + 1}/${batches.length}`);
      const batchPromises = batch.map(async product => {
        try {
          const normalizedProduct = await this.dataNormalizationService.normalizeProduct(product);
          await this.productsService.update(product.id, normalizedProduct);
          return { success: true };
        } catch (error) {
          this.logger.error(`Error processing product ${product.id}: ${error.message}`);
          return {
            error: true,
            id: product.id,
            message: error.message,
          };
        }
      });
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(batchResult => {
        if (batchResult.error) {
          result.failed++;
          result.errors.push({
            id: batchResult.id,
            error: batchResult.message,
          });
        } else {
          result.processed++;
        }
      });
    }
    return result;
  }
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
});
exports.BulkImportService = BulkImportService;
exports.BulkImportService =
  BulkImportService =
  BulkImportService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          data_normalization_service_1.DataNormalizationService,
          products_service_1.ProductsService,
          config_1.ConfigService,
        ]),
      ],
      BulkImportService,
    );
//# sourceMappingURL=bulk-import.service.js.map
