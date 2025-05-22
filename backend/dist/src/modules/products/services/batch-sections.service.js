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
var BatchSectionsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.BatchSectionsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const product_entity_1 = require('../entities/product.entity');
const products_service_1 = require('../products.service');
const data_normalization_service_1 = require('./data-normalization.service');
let BatchSectionsService = (BatchSectionsService_1 = class BatchSectionsService {
  constructor(productRepository, productsService, dataNormalizationService) {
    this.productRepository = productRepository;
    this.productsService = productsService;
    this.dataNormalizationService = dataNormalizationService;
    this.logger = new common_1.Logger(BatchSectionsService_1.name);
  }
  async loadBatchSections(batchRequest) {
    const startTime = Date.now();
    let sectionResponses;
    if (batchRequest.parallel) {
      sectionResponses = await Promise.all(
        batchRequest.sections.map(section => this.loadSection(section)),
      );
    } else {
      sectionResponses = [];
      for (const section of batchRequest.sections) {
        const response = await this.loadSection(section);
        sectionResponses.push(response);
      }
    }
    const totalProducts = sectionResponses.reduce((sum, section) => sum + section.items.length, 0);
    const endTime = Date.now();
    const loadTimeMs = endTime - startTime;
    return {
      sections: sectionResponses,
      meta: {
        totalSections: sectionResponses.length,
        totalProducts,
        loadTimeMs,
      },
    };
  }
  async loadSection(sectionRequest) {
    try {
      const { id, title, pagination, filter } = sectionRequest;
      let sectionFilter = {};
      switch (id) {
        case 'new-arrivals':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          sectionFilter = {
            createdAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo),
          };
          break;
        case 'featured':
          sectionFilter = {
            featured: true,
          };
          break;
        case 'on-sale':
          sectionFilter = {
            compareAtPrice: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
          };
          break;
        case 'recommended':
          sectionFilter = {};
          break;
        default:
          if (filter) {
            sectionFilter = { ...filter };
          }
      }
      const paginationWithFilter = {
        ...pagination,
      };
      const result = await this.productsService.findWithCursor(paginationWithFilter, sectionFilter);
      const normalizedProducts = await Promise.all(
        result.items.map(product => this.dataNormalizationService.normalizeProduct(product)),
      );
      return {
        id,
        title,
        items: normalizedProducts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        totalCount: result.totalCount,
      };
    } catch (error) {
      this.logger.error(
        `Error loading section ${sectionRequest.id}: ${error.message}`,
        error.stack,
      );
      return {
        id: sectionRequest.id,
        title: sectionRequest.title,
        items: [],
        hasMore: false,
      };
    }
  }
});
exports.BatchSectionsService = BatchSectionsService;
exports.BatchSectionsService =
  BatchSectionsService =
  BatchSectionsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          products_service_1.ProductsService,
          data_normalization_service_1.DataNormalizationService,
        ]),
      ],
      BatchSectionsService,
    );
//# sourceMappingURL=batch-sections.service.js.map
