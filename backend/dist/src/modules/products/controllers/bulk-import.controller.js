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
var BulkImportController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.BulkImportController = void 0;
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const bulk_import_service_1 = require('../services/bulk-import.service');
const data_normalization_service_1 = require('../services/data-normalization.service');
class BulkImportDto {}
class SourceImportDto {}
class ProcessExistingDto {}
let BulkImportController = (BulkImportController_1 = class BulkImportController {
  constructor(bulkImportService) {
    this.bulkImportService = bulkImportService;
    this.logger = new common_1.Logger(BulkImportController_1.name);
  }
  async importProducts(importDto) {
    this.logger.log(`Bulk import request received for ${importDto.products.length} products`);
    return this.bulkImportService.importProducts(importDto.products, importDto.options);
  }
  async importFromShopify(importDto) {
    this.logger.log('Shopify import request received');
    return this.bulkImportService.importFromShopify(importDto.data, {
      ...importDto.options,
      source: data_normalization_service_1.DataSource.SHOPIFY,
    });
  }
  async importFromWooCommerce(importDto) {
    this.logger.log('WooCommerce import request received');
    return this.bulkImportService.importFromWooCommerce(importDto.data, {
      ...importDto.options,
      source: data_normalization_service_1.DataSource.WOOCOMMERCE,
    });
  }
  async importFromEtsy(importDto) {
    this.logger.log('Etsy import request received');
    return this.bulkImportService.importFromEtsy(importDto.data, {
      ...importDto.options,
      source: data_normalization_service_1.DataSource.ETSY,
    });
  }
  async validateProducts(importDto, source = data_normalization_service_1.DataSource.MANUAL) {
    this.logger.log(`Validation request received for ${importDto.products.length} products`);
    return this.bulkImportService.validateProducts(importDto.products, source);
  }
  async processExistingProducts(processDto) {
    this.logger.log('Process existing products request received');
    return this.bulkImportService.processExistingProducts(
      processDto.productIds,
      processDto.options,
    );
  }
});
exports.BulkImportController = BulkImportController;
__decorate(
  [
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import products in bulk' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Products imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBody)({ type: BulkImportDto }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [BulkImportDto]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'importProducts',
  null,
);
__decorate(
  [
    (0, common_1.Post)('import/shopify'),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from Shopify' }),
    (0, swagger_1.ApiResponse)({
      status: 201,
      description: 'Shopify products imported successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBody)({ type: SourceImportDto }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [SourceImportDto]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'importFromShopify',
  null,
);
__decorate(
  [
    (0, common_1.Post)('import/woocommerce'),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from WooCommerce' }),
    (0, swagger_1.ApiResponse)({
      status: 201,
      description: 'WooCommerce products imported successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBody)({ type: SourceImportDto }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [SourceImportDto]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'importFromWooCommerce',
  null,
);
__decorate(
  [
    (0, common_1.Post)('import/etsy'),
    (0, swagger_1.ApiOperation)({ summary: 'Import products from Etsy' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Etsy products imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBody)({ type: SourceImportDto }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [SourceImportDto]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'importFromEtsy',
  null,
);
__decorate(
  [
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate products without importing them' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products validated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('source')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [BulkImportDto, String]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'validateProducts',
  null,
);
__decorate(
  [
    (0, common_1.Patch)('process'),
    (0, swagger_1.ApiOperation)({
      summary: 'Process existing products to ensure data consistency',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [ProcessExistingDto]),
    __metadata('design:returntype', Promise),
  ],
  BulkImportController.prototype,
  'processExistingProducts',
  null,
);
exports.BulkImportController =
  BulkImportController =
  BulkImportController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('bulk-import'),
        (0, common_1.Controller)('products/bulk'),
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        (0, swagger_1.ApiBearerAuth)(),
        __metadata('design:paramtypes', [bulk_import_service_1.BulkImportService]),
      ],
      BulkImportController,
    );
//# sourceMappingURL=bulk-import.controller.js.map
