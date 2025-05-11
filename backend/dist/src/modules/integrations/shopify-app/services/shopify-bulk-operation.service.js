'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
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
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var ShopifyBulkOperationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyBulkOperationService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const axios_1 = __importDefault(require('axios'));
const fs = __importStar(require('fs'));
const readline = __importStar(require('readline'));
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const shopify_config_1 = require('../../../common/config/shopify-config');
const platform_type_enum_1 = require('../../enums/platform-type.enum');
const shopify_config_2 = require('../../../common/config/shopify-config');
let ShopifyBulkOperationService =
  (ShopifyBulkOperationService_1 = class ShopifyBulkOperationService {
    validateEntity(entity, entityType) {
      if (!entity || typeof entity !== 'object') return false;
      switch (entityType.toLowerCase()) {
        case 'product':
          return Boolean(entity.id && (entity.title || entity.handle));
        case 'order':
          return Boolean(entity.id && entity.createdAt);
        case 'customer':
          return Boolean(entity.id && (entity.email || entity.phone));
        case 'fulfillment':
          return Boolean(entity.id && entity.status);
        default:
          return true;
      }
    }
    transformEntity(entity, entityType) {
      switch (entityType.toLowerCase()) {
        case 'product':
          return {
            ...entity,
            formattedPrice: entity.price ? `$${parseFloat(entity.price).toFixed(2)}` : 'N/A',
            availableForSale: Boolean(
              entity.status === 'ACTIVE' && (!entity.hasInventory || entity.totalInventory > 0),
            ),
          };
        case 'order':
          return {
            ...entity,
            totalPrice: parseFloat(entity.totalPrice || '0'),
            formattedDate: entity.createdAt ? new Date(entity.createdAt).toISOString() : '',
          };
        default:
          return entity;
      }
    }
    constructor(merchantPlatformConnectionRepository, config, shopifyClientService) {
      this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
      this.config = config;
      this.shopifyClientService = shopifyClientService;
      this.ERROR_CODES = {
        ACCESS_DENIED: 'ACCESS_DENIED',
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        TIMEOUT: 'TIMEOUT',
        QUERY_SYNTAX_ERROR: 'QUERY_SYNTAX_ERROR',
        QUERY_NOT_SUPPORTED: 'QUERY_NOT_SUPPORTED',
        OPERATION_TYPE_ERROR: 'OPERATION_TYPE_ERROR',
      };
      this.logger = new common_1.Logger(ShopifyBulkOperationService_1.name);
    }
    async getShopifyConnection(merchantId) {
      const connection = await this.merchantPlatformConnectionRepository.findOne({
        where: {
          merchantId,
          platformType: platform_type_enum_1.PlatformType.SHOPIFY,
          isActive: true,
        },
      });
      if (!connection) {
        throw new Error(`No active Shopify connection found for merchant ${merchantId}`);
      }
      return connection;
    }
    async startBulkOperation(merchantId, query) {
      try {
        const connection = await this.getShopifyConnection(merchantId);
        const shop = connection.platformStoreName;
        const accessToken = connection.accessToken;
        const startBulkOperationMutation = `
        mutation {
          bulkOperationRunQuery(
            query: """
              ${query}
            """
          ) {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          startBulkOperationMutation,
        );
        if (
          result &&
          result['bulkOperationRunQuery'] &&
          result['bulkOperationRunQuery']['userErrors'] &&
          result['bulkOperationRunQuery']['userErrors'].length > 0
        ) {
          const errors = result['bulkOperationRunQuery']['userErrors'];
          throw new Error(`Failed to start bulk operation: ${errors[0].message}`);
        }
        if (
          !result ||
          !result['bulkOperationRunQuery'] ||
          !result['bulkOperationRunQuery']['bulkOperation'] ||
          !result['bulkOperationRunQuery']['bulkOperation']['id']
        ) {
          throw new Error('Failed to start bulk operation: No bulk operation ID returned');
        }
        const bulkOperationId = result['bulkOperationRunQuery']['bulkOperation']['id'];
        this.logger.log(`Started bulk operation ${bulkOperationId} for merchant ${merchantId}`);
        return bulkOperationId;
      } catch (error) {
        this.logger.error(`Failed to start bulk operation for merchant ${merchantId}:`, error);
        throw error;
      }
    }
    async pollBulkOperationStatus(merchantId, bulkOperationId, maxRetries = 10, delayMs = 2000) {
      try {
        const connection = await this.getShopifyConnection(merchantId);
        const shop = connection.platformStoreName;
        const accessToken = connection.accessToken;
        const getBulkOperationQuery = `
        query {
          node(id: "${bulkOperationId}") {
            ... on BulkOperation {
              id
              status
              errorCode
              statusMessage
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
              rootObjectCount
              type
              query
              rootObjectDeletionAllowed
            }
          }
        }
      `;
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          getBulkOperationQuery,
        );
        if (!result || !result['node']) {
          throw new Error(
            `Failed to poll bulk operation status: Bulk operation ${bulkOperationId} not found`,
          );
        }
        const operation = {
          id: result['node']['id'] || '',
          status: result['node']['status'] || 'CREATED',
          errorCode: result['node']['errorCode'] || null,
          createdAt: result['node']['createdAt'] || '',
          completedAt: result['node']['completedAt'] || null,
          objectCount: result['node']['objectCount'] || 0,
          fileSize: result['node']['fileSize'] || 0,
          url: result['node']['url'] || null,
          partialDataUrl: result['node']['partialDataUrl'] || null,
          rootObjectCount: result['node']['rootObjectCount'] || 0,
          type: result['node']['type'] || '',
          query: result['node']['query'] || '',
        };
        this.logger.log(`Bulk operation ${bulkOperationId} status: ${operation.status}`);
        if (operation.status.toUpperCase() === 'FAILED') {
          this.logger.error(
            `Bulk operation ${bulkOperationId} failed: ${operation.errorCode || 'Unknown error'}`,
          );
          const errorDetail = operation.errorCode || 'No error details available';
          throw new Error(`Bulk operation failed: ${errorDetail}`);
        }
        if (operation.status.toUpperCase() === 'COMPLETED') {
          this.logger.log(`Bulk operation ${bulkOperationId} completed successfully`);
          return operation;
        }
        if (maxRetries > 0) {
          this.logger.log(
            `Bulk operation ${bulkOperationId} is ${operation.status}, waiting for completion... (${maxRetries} retries left)`,
          );
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.pollBulkOperationStatus(merchantId, bulkOperationId, maxRetries - 1, delayMs);
        } else {
          this.logger.warn(
            `Bulk operation ${bulkOperationId} polling timed out after maximum retries`,
          );
          throw new Error(`Bulk operation polling timed out for operation ${bulkOperationId}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to poll bulk operation status for merchant ${merchantId}:`,
          error,
        );
        throw error;
      }
    }
    async processResults(merchantId, url, entityType, options) {
      const { batchSize = 1000, validateEntities = true, transformEntities = true } = options || {};
      try {
        this.logger.log(`Processing bulk operation results from ${url} for merchant ${merchantId}`);
        const response = await axios_1.default.get(url, { responseType: 'stream' });
        const tempFilePath = `/tmp/bulk-operation-${Date.now()}.jsonl`;
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', () => resolve());
          writer.on('error', err => reject(err));
        });
        const results = [];
        const fileStream = fs.createReadStream(tempFilePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });
        for await (const line of rl) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              results.push(parsed);
            } catch (parseError) {
              this.logger.warn(`Failed to parse line: ${line}`, parseError);
            }
          }
        }
        fs.unlinkSync(tempFilePath);
        this.logger.log(
          `Processed ${results.length} results from bulk operation for merchant ${merchantId}`,
        );
        if (entityType && validateEntities) {
          this.logger.log(`Validating and processing entities of type: ${entityType}`);
          const processedResults = [];
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            const processedBatch = batch
              .map(item => {
                if (!this.validateEntity(item, entityType)) {
                  this.logger.warn(
                    `Skipping invalid ${entityType} entity:`,
                    JSON.stringify(item).substring(0, 200),
                  );
                  return null;
                }
                if (transformEntities) {
                  return this.transformEntity(item, entityType);
                }
                return item;
              })
              .filter(Boolean);
            processedResults.push(...processedBatch);
          }
          this.logger.log(
            `Successfully processed ${processedResults.length} valid ${entityType} entities`,
          );
          return processedResults;
        }
        return results;
      } catch (error) {
        this.logger.error(
          `Failed to process bulk operation results for merchant ${merchantId}:`,
          error,
        );
        throw error;
      }
    }
    async cancelBulkOperation(merchantId, bulkOperationId) {
      try {
        const connection = await this.getShopifyConnection(merchantId);
        const shop = connection.platformStoreName;
        const accessToken = connection.accessToken;
        const cancelBulkOperationMutation = `
        mutation {
          bulkOperationCancel(
            id: "${bulkOperationId}"
          ) {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
        const result = await this.shopifyClientService.query(
          shop,
          accessToken,
          cancelBulkOperationMutation,
        );
        if (
          result &&
          result['bulkOperationCancel'] &&
          result['bulkOperationCancel']['userErrors'] &&
          result['bulkOperationCancel']['userErrors'].length > 0
        ) {
          const errors = result['bulkOperationCancel']['userErrors'];
          this.logger.error(`Failed to cancel bulk operation: ${errors[0].message}`);
          return false;
        }
        this.logger.log(`Cancelled bulk operation ${bulkOperationId} for merchant ${merchantId}`);
        return true;
      } catch (error) {
        this.logger.error(`Failed to cancel bulk operation for merchant ${merchantId}:`, error);
        return false;
      }
    }
  });
exports.ShopifyBulkOperationService = ShopifyBulkOperationService;
exports.ShopifyBulkOperationService =
  ShopifyBulkOperationService =
  ShopifyBulkOperationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(
          0,
          (0, typeorm_1.InjectRepository)(
            merchant_platform_connection_entity_1.MerchantPlatformConnection,
          ),
        ),
        __param(1, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
        __param(
          2,
          (0, common_1.Inject)(
            shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE,
          ),
        ),
        __metadata('design:paramtypes', [typeorm_2.Repository, void 0, Object]),
      ],
      ShopifyBulkOperationService,
    );
//# sourceMappingURL=shopify-bulk-operation.service.js.map
