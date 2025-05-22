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
var ShopifyBulkOperationEnhancedService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyBulkOperationEnhancedService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_platform_connection_entity_1 = require('../../entities/merchant-platform-connection.entity');
const shopify_config_1 = require('../../../common/config/shopify-config');
const platform_type_enum_1 = require('../../enums/platform-type.enum');
const shopify_config_2 = require('../../../common/config/shopify-config');
const shopify_bulk_job_service_1 = require('./shopify-bulk-job.service');
const shopify_bulk_operation_job_entity_1 = require('../entities/shopify-bulk-operation-job.entity');
let ShopifyBulkOperationEnhancedService =
  (ShopifyBulkOperationEnhancedService_1 = class ShopifyBulkOperationEnhancedService {
    constructor(
      merchantPlatformConnectionRepository,
      config,
      shopifyClientService,
      bulkJobService,
    ) {
      this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
      this.config = config;
      this.shopifyClientService = shopifyClientService;
      this.bulkJobService = bulkJobService;
      this.ERROR_CODES = {
        ACCESS_DENIED: 'ACCESS_DENIED',
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        TIMEOUT: 'TIMEOUT',
        QUERY_SYNTAX_ERROR: 'QUERY_SYNTAX_ERROR',
        QUERY_NOT_SUPPORTED: 'QUERY_NOT_SUPPORTED',
        OPERATION_TYPE_ERROR: 'OPERATION_TYPE_ERROR',
      };
      this.entityValidators = {
        product: this.validateProductEntity.bind(this),
        order: this.validateOrderEntity.bind(this),
        customer: this.validateCustomerEntity.bind(this),
        fulfillment: this.validateFulfillmentEntity.bind(this),
      };
      this.entityTransformers = {
        product: this.transformProductEntity.bind(this),
        order: this.transformOrderEntity.bind(this),
        customer: this.transformCustomerEntity.bind(this),
        fulfillment: this.transformFulfillmentEntity.bind(this),
      };
      this.logger = new common_1.Logger(ShopifyBulkOperationEnhancedService_1.name);
    }
    validateProductEntity(entity) {
      if (!entity || typeof entity !== 'object') return false;
      return Boolean(entity.id && (entity.title || entity.handle));
    }
    validateOrderEntity(entity) {
      if (!entity || typeof entity !== 'object') return false;
      return Boolean(entity.id && entity.createdAt);
    }
    validateCustomerEntity(entity) {
      if (!entity || typeof entity !== 'object') return false;
      return Boolean(entity.id && (entity.email || entity.phone));
    }
    validateFulfillmentEntity(entity) {
      if (!entity || typeof entity !== 'object') return false;
      return Boolean(entity.id && entity.status);
    }
    transformProductEntity(entity) {
      return {
        ...entity,
        formattedPrice: entity.price ? `$${parseFloat(entity.price).toFixed(2)}` : 'N/A',
        availableForSale: Boolean(
          entity.status === 'ACTIVE' && (!entity.hasInventory || entity.totalInventory > 0),
        ),
      };
    }
    transformOrderEntity(entity) {
      return {
        ...entity,
        totalPrice: parseFloat(entity.totalPrice || '0'),
        formattedDate: entity.createdAt ? new Date(entity.createdAt).toISOString() : '',
      };
    }
    transformCustomerEntity(entity) {
      return {
        ...entity,
        fullName:
          entity.firstName && entity.lastName
            ? `${entity.firstName} ${entity.lastName}`
            : entity.firstName || entity.lastName || 'Unknown',
      };
    }
    transformFulfillmentEntity(entity) {
      return {
        ...entity,
        isDelivered: entity.status === 'SUCCESS',
        statusLabel: this.mapFulfillmentStatus(entity.status),
      };
    }
    mapFulfillmentStatus(status) {
      const statusMap = {
        SUCCESS: 'Delivered',
        IN_PROGRESS: 'In Transit',
        OPEN: 'Processing',
        CANCELLED: 'Cancelled',
        ERROR: 'Failed',
        FAILURE: 'Failed',
      };
      return statusMap[status] || status;
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
    async processResults(merchantId, url, entityType) {
      try {
        this.logger.log(`Processing bulk operation results for merchant ${merchantId}`);
        const response = await axios.get(url, {
          responseType: 'text',
        });
        const results = [];
        const responseData = response.data;
        const lines = responseData.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsedLine = JSON.parse(line);
            results.push(parsedLine);
          } catch (parseError) {
            this.logger.warn(
              `Failed to parse line from bulk operation results: ${parseError.message}`,
            );
          }
        }
        if (entityType) {
          this.logger.debug(`Validating results as entity type: ${entityType}`);
        }
        return results;
      } catch (error) {
        this.logger.error(
          `Failed to process bulk operation results: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
    async startBulkOperation(merchantId, query, description, metadata) {
      try {
        const connection = await this.getShopifyConnection(merchantId);
        const shop = connection.platformStoreName;
        const accessToken = connection.accessToken;
        const createBulkOperationMutation = `
        mutation {
          bulkOperationRunQuery(
            query: """
              ${query}
            """
          ) {
            bulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
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
          createBulkOperationMutation,
        );
        if (
          result &&
          result['bulkOperationRunQuery'] &&
          result['bulkOperationRunQuery']['userErrors'] &&
          result['bulkOperationRunQuery']['userErrors'].length > 0
        ) {
          const errors = result['bulkOperationRunQuery']['userErrors'];
          this.logger.error(`Failed to create bulk operation: ${errors[0].message}`);
          throw new Error(`Failed to create bulk operation: ${errors[0].message}`);
        }
        const bulkOperation = result['bulkOperationRunQuery']['bulkOperation'];
        const bulkOperationId = bulkOperation.id;
        const jobDescription = description || 'Bulk operation';
        const job = await this.bulkJobService.createJob(
          merchantId,
          bulkOperationId,
          jobDescription,
          query,
          metadata,
          connection.id.toString(),
        );
        this.logger.log(
          `Started bulk operation ${bulkOperationId} for merchant ${merchantId} (Job ID: ${job.id})`,
        );
        await this.bulkJobService.updateJobStatus(
          job.id,
          shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING,
          'Operation started',
        );
        this.logger.debug(
          `Enhanced bulk operation initiated with jobId=${job.id} and bulkOperationId=${bulkOperationId}`,
        );
        return bulkOperationId;
      } catch (error) {
        this.logger.error(`Failed to start bulk operation for merchant ${merchantId}:`, error);
        throw error;
      }
    }
    async getJobStatus(jobId) {
      try {
        const job = await this.bulkJobService.findJobById(jobId);
        if (!job) {
          throw new Error(`Job with ID ${jobId} not found`);
        }
        if (job.status === shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING) {
          try {
            const bulkOperation = await this.pollBulkOperationStatus(
              job.merchantId,
              job.shopifyBulkOperationId,
              1,
              0,
            );
            if (bulkOperation.status === 'COMPLETED') {
              await this.bulkJobService.updateJobStatus(
                jobId,
                shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED,
                'Operation completed successfully',
                {
                  resultUrl: bulkOperation.url,
                  partialResultUrl: bulkOperation.partialDataUrl,
                  objectCount: bulkOperation.objectCount,
                  fileSize: bulkOperation.fileSize,
                  completedAt: bulkOperation.completedAt
                    ? new Date(bulkOperation.completedAt)
                    : new Date(),
                  progressPercentage: 100,
                },
              );
            } else if (bulkOperation.status === 'FAILED') {
              await this.bulkJobService.updateJobStatus(
                jobId,
                shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED,
                `Operation failed: ${bulkOperation.errorCode || 'Unknown error'}`,
                {
                  errorCode: bulkOperation.errorCode,
                  errorDetails: bulkOperation.statusMessage,
                  progressPercentage: 0,
                },
              );
            } else if (bulkOperation.status === 'RUNNING' || bulkOperation.status === 'CREATED') {
              let progressPercentage = 0;
              if (bulkOperation.objectCount > 0 && bulkOperation.rootObjectCount > 0) {
                progressPercentage = Math.min(
                  Math.round((bulkOperation.objectCount / bulkOperation.rootObjectCount) * 100),
                  99,
                );
              }
              await this.bulkJobService.updateJobStatus(
                jobId,
                shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING,
                `Operation in progress: ${bulkOperation.status}`,
                {
                  objectCount: bulkOperation.objectCount,
                  fileSize: bulkOperation.fileSize,
                  progressPercentage,
                },
              );
            }
            return await this.bulkJobService.findJobById(jobId);
          } catch (error) {
            this.logger.warn(`Failed to poll status for job ${jobId}:`, error);
          }
        }
        return job;
      } catch (error) {
        this.logger.error(`Failed to get status for job ${jobId}:`, error);
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
          statusMessage: result['node']['statusMessage'] || null,
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
  });
exports.ShopifyBulkOperationEnhancedService = ShopifyBulkOperationEnhancedService;
exports.ShopifyBulkOperationEnhancedService =
  ShopifyBulkOperationEnhancedService =
  ShopifyBulkOperationEnhancedService_1 =
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
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          void 0,
          Object,
          shopify_bulk_job_service_1.ShopifyBulkJobService,
        ]),
      ],
      ShopifyBulkOperationEnhancedService,
    );
//# sourceMappingURL=shopify-bulk-operation.enhanced.service.js.map
