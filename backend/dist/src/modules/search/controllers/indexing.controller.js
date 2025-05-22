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
var IndexingController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.IndexingController = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_indexing_service_1 = require('../services/elasticsearch-indexing.service');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const event_emitter_1 = require('@nestjs/event-emitter');
const swagger_1 = require('@nestjs/swagger');
let IndexingController = (IndexingController_1 = class IndexingController {
  constructor(elasticsearchIndexingService, eventEmitter) {
    this.elasticsearchIndexingService = elasticsearchIndexingService;
    this.eventEmitter = eventEmitter;
    this.logger = new common_1.Logger(IndexingController_1.name);
    this.reindexingStatus = {};
    this.eventEmitter.on('search.reindex_progress', payload => {
      this.reindexingStatus[payload.entityType] = {
        status: 'in_progress',
        processed: payload.processed,
        total: payload.total,
        percentage: payload.percentage,
        lastUpdated: new Date(),
      };
    });
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
    this.eventEmitter.on('search.reindex_error', payload => {
      this.reindexingStatus[payload.entityType] = {
        status: 'error',
        error: payload.error,
        lastUpdated: new Date(),
      };
    });
  }
  async reindex(entityType = 'all') {
    this.logger.log(`Starting reindexing for ${entityType}`);
    if (entityType === 'all') {
      this.reindexingStatus.products = { status: 'pending', lastUpdated: new Date() };
      this.reindexingStatus.merchants = { status: 'pending', lastUpdated: new Date() };
      this.reindexingStatus.brands = { status: 'pending', lastUpdated: new Date() };
    } else {
      this.reindexingStatus[entityType] = { status: 'pending', lastUpdated: new Date() };
    }
    this.eventEmitter.emit('search.reindex_all', { entityType });
    return {
      message: `Reindexing of ${entityType} started`,
      status: 'pending',
    };
  }
  getReindexingStatus(entityType) {
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
  async bulkIndexProducts(productIds) {
    this.logger.log(`Starting bulk indexing for ${productIds.length} products`);
    this.eventEmitter.emit('products.bulk_index', { productIds });
    return {
      message: `Bulk indexing of ${productIds.length} products started`,
      status: 'pending',
    };
  }
  async bulkIndexMerchants(merchantIds) {
    this.logger.log(`Starting bulk indexing for ${merchantIds.length} merchants`);
    this.eventEmitter.emit('merchants.bulk_index', { merchantIds });
    return {
      message: `Bulk indexing of ${merchantIds.length} merchants started`,
      status: 'pending',
    };
  }
  async bulkIndexBrands(brandIds) {
    this.logger.log(`Starting bulk indexing for ${brandIds.length} brands`);
    this.eventEmitter.emit('brands.bulk_index', { brandIds });
    return {
      message: `Bulk indexing of ${brandIds.length} brands started`,
      status: 'pending',
    };
  }
});
exports.IndexingController = IndexingController;
__decorate(
  [
    (0, common_1.Post)('reindex'),
    (0, swagger_1.ApiOperation)({ summary: 'Reindex all entities or a specific entity type' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Reindexing started' }),
    __param(0, (0, common_1.Body)('entityType')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  IndexingController.prototype,
  'reindex',
  null,
);
__decorate(
  [
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reindexing status' }),
    (0, swagger_1.ApiQuery)({
      name: 'entityType',
      required: false,
      enum: ['all', 'products', 'merchants', 'brands'],
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reindexing status' }),
    __param(0, (0, common_1.Query)('entityType')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  IndexingController.prototype,
  'getReindexingStatus',
  null,
);
__decorate(
  [
    (0, common_1.Post)('products/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk index products' }),
    (0, swagger_1.ApiBody)({
      schema: {
        type: 'object',
        properties: {
          productIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Bulk indexing started' }),
    __param(0, (0, common_1.Body)('productIds')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  IndexingController.prototype,
  'bulkIndexProducts',
  null,
);
__decorate(
  [
    (0, common_1.Post)('merchants/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk index merchants' }),
    (0, swagger_1.ApiBody)({
      schema: {
        type: 'object',
        properties: {
          merchantIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Bulk indexing started' }),
    __param(0, (0, common_1.Body)('merchantIds')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  IndexingController.prototype,
  'bulkIndexMerchants',
  null,
);
__decorate(
  [
    (0, common_1.Post)('brands/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk index brands' }),
    (0, swagger_1.ApiBody)({
      schema: {
        type: 'object',
        properties: {
          brandIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Bulk indexing started' }),
    __param(0, (0, common_1.Body)('brandIds')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Array]),
    __metadata('design:returntype', Promise),
  ],
  IndexingController.prototype,
  'bulkIndexBrands',
  null,
);
exports.IndexingController =
  IndexingController =
  IndexingController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('search-indexing'),
        (0, common_1.Controller)('api/search/indexing'),
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        __metadata('design:paramtypes', [
          elasticsearch_indexing_service_1.ElasticsearchIndexingService,
          event_emitter_1.EventEmitter2,
        ]),
      ],
      IndexingController,
    );
//# sourceMappingURL=indexing.controller.js.map
