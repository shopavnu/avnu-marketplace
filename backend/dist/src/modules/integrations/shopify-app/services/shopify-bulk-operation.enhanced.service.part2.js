"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ShopifyBulkOperationEnhancedServicePart2_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyBulkOperationEnhancedServicePart2 = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const uuid_1 = require("uuid");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../enums/platform-type.enum");
const shopify_bulk_job_service_1 = require("./shopify-bulk-job.service");
const shopify_bulk_operation_job_entity_1 = require("../entities/shopify-bulk-operation-job.entity");
let ShopifyBulkOperationEnhancedServicePart2 = ShopifyBulkOperationEnhancedServicePart2_1 = class ShopifyBulkOperationEnhancedServicePart2 {
    constructor(shopifyClientService, merchantConnectionRepository, bulkJobService) {
        this.shopifyClientService = shopifyClientService;
        this.merchantConnectionRepository = merchantConnectionRepository;
        this.bulkJobService = bulkJobService;
        this.logger = new common_1.Logger(ShopifyBulkOperationEnhancedServicePart2_1.name);
        this.entityValidators = {
            default: (entity) => !!entity,
        };
        this.entityTransformers = {
            default: (entity) => entity,
        };
    }
    async getShopifyConnection(merchantId) {
        const connection = await this.merchantConnectionRepository.findOne({
            where: {
                merchantId,
                platformType: platform_type_enum_1.PlatformType.SHOPIFY,
            },
        });
        if (!connection) {
            throw new Error(`No Shopify connection found for merchant ${merchantId}`);
        }
        return {
            platformStoreName: connection.platformStoreName,
            accessToken: connection.accessToken,
        };
    }
    async processResultsWithPagination(jobId, options = {}, cursor, limit = 100) {
        try {
            const job = await this.bulkJobService.findJobById(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            if (job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED) {
                throw new Error(`Cannot process results for job with status ${job.status}`);
            }
            const resultUrl = job.resultUrl;
            if (!resultUrl) {
                throw new Error(`No result URL available for job ${jobId}`);
            }
            const entityType = options.entityType;
            const validateEntities = options.validateEntities !== false;
            const transformEntities = options.transformEntities !== false;
            const filters = options.filters || {};
            const tempFilePath = `/tmp/shopify-bulk-${(0, uuid_1.v4)()}.jsonl`;
            this.logger.log(`Downloading bulk operation results to ${tempFilePath}`);
            const response = await axios_1.default.get(resultUrl, {
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve());
                writer.on('error', reject);
            });
            const allResults = [];
            let filteredResults = [];
            const _currentIndex = 0;
            const _endCursorIndex = -1;
            let startCursorIndex = 0;
            const fileStream = fs.createReadStream(tempFilePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            for await (const line of rl) {
                try {
                    if (line.trim() === '')
                        continue;
                    const jsonData = JSON.parse(line);
                    allResults.push(jsonData);
                }
                catch (error) {
                    this.logger.warn(`Error parsing JSON line: ${error.message}`);
                    continue;
                }
            }
            if (Object.keys(filters).length > 0) {
                filteredResults = allResults.filter(item => {
                    for (const [key, value] of Object.entries(filters)) {
                        if (item[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            else {
                filteredResults = allResults;
            }
            if (cursor) {
                startCursorIndex = filteredResults.findIndex(item => item.id === cursor || item.cursor === cursor);
                if (startCursorIndex === -1) {
                    startCursorIndex = 0;
                }
                else {
                    startCursorIndex += 1;
                }
            }
            const endIndex = Math.min(startCursorIndex + limit, filteredResults.length);
            const pageItems = filteredResults.slice(startCursorIndex, endIndex);
            const validatedItems = [];
            const errors = [];
            for (const item of pageItems) {
                try {
                    if (validateEntities && entityType) {
                        const validator = this.entityValidators[entityType] || this.entityValidators.default;
                        if (!validator(item)) {
                            throw new Error(`Validation failed for item ${item.id || JSON.stringify(item)}`);
                        }
                    }
                    if (transformEntities && entityType) {
                        const transformer = this.entityTransformers[entityType] || this.entityTransformers.default;
                        validatedItems.push(transformer(item));
                    }
                    else {
                        validatedItems.push(item);
                    }
                }
                catch (error) {
                    errors.push(error);
                    this.logger.error(`Error processing item: ${error.message}`);
                }
            }
            const hasNextPage = endIndex < filteredResults.length;
            const nextCursor = hasNextPage
                ? filteredResults[endIndex - 1].id || filteredResults[endIndex - 1].cursor
                : null;
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (error) {
                this.logger.warn(`Error deleting temp file: ${error.message}`);
            }
            if (errors.length > 0) {
                this.logger.warn(`Encountered ${errors.length} errors while processing results: ${errors.map(e => e.message).join(', ')}`);
            }
            return {
                data: validatedItems,
                totalCount: filteredResults.length,
                hasNextPage,
                endCursor: nextCursor,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process bulk operation results: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processAllResults(jobId, options = {}) {
        try {
            const job = await this.bulkJobService.findJobById(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            if (job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.COMPLETED) {
                throw new Error(`Cannot process results for job with status ${job.status}`);
            }
            const resultUrl = job.resultUrl;
            if (!resultUrl) {
                throw new Error(`No result URL available for job ${jobId}`);
            }
            const entityType = options.entityType;
            const validateEntities = options.validateEntities !== false;
            const transformEntities = options.transformEntities !== false;
            const batchSize = options.batchSize || 1000;
            const tempFilePath = `/tmp/shopify-bulk-${(0, uuid_1.v4)()}.jsonl`;
            this.logger.log(`Downloading bulk operation results to ${tempFilePath}`);
            const response = await axios_1.default.get(resultUrl, {
                responseType: 'stream',
            });
            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve());
                writer.on('error', reject);
            });
            const allResults = [];
            const errors = [];
            let currentBatch = [];
            let batchCount = 0;
            const fileStream = fs.createReadStream(tempFilePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            for await (const line of rl) {
                try {
                    if (line.trim() === '')
                        continue;
                    const jsonData = JSON.parse(line);
                    if (validateEntities && entityType) {
                        const validator = this.entityValidators[entityType] || this.entityValidators.default;
                        if (!validator(jsonData)) {
                            throw new Error(`Validation failed for item ${jsonData.id || JSON.stringify(jsonData)}`);
                        }
                    }
                    if (transformEntities && entityType) {
                        const transformer = this.entityTransformers[entityType] || this.entityTransformers.default;
                        currentBatch.push(transformer(jsonData));
                    }
                    else {
                        currentBatch.push(jsonData);
                    }
                    if (currentBatch.length >= batchSize) {
                        allResults.push(...currentBatch);
                        batchCount++;
                        this.logger.log(`Processed batch ${batchCount} (${currentBatch.length} items)`);
                        currentBatch = [];
                    }
                }
                catch (error) {
                    errors.push(error);
                    this.logger.error(`Error processing item: ${error.message}`);
                }
            }
            if (currentBatch.length > 0) {
                allResults.push(...currentBatch);
                batchCount++;
                this.logger.log(`Processed final batch ${batchCount} (${currentBatch.length} items)`);
            }
            try {
                fs.unlinkSync(tempFilePath);
            }
            catch (error) {
                this.logger.warn(`Error deleting temp file: ${error.message}`);
            }
            if (errors.length > 0) {
                this.logger.warn(`Encountered ${errors.length} errors while processing results`);
            }
            this.logger.log(`Successfully processed ${allResults.length} items from bulk operation`);
            return allResults;
        }
        catch (error) {
            this.logger.error(`Failed to process bulk operation results: ${error.message}`, error.stack);
            throw error;
        }
    }
    async retryJob(jobId) {
        try {
            const job = await this.bulkJobService.findJobById(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            if (job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED) {
                throw new Error(`Cannot retry job with status ${job.status}`);
            }
            const query = job.query;
            if (!query) {
                throw new Error(`No query found for job ${jobId}`);
            }
            const connection = await this.getShopifyConnection(job.merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
            const bulkOperationRunQuery = `
        mutation {
          bulkOperationRunQuery(
            query: """${query}"""
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
            const result = await this.shopifyClientService.query(shop, accessToken, bulkOperationRunQuery);
            if (result?.bulkOperationRunQuery?.userErrors &&
                result.bulkOperationRunQuery.userErrors.length > 0) {
                const errors = result.bulkOperationRunQuery.userErrors;
                this.logger.error(`Failed to start bulk operation: ${errors[0].message}`);
                await this.bulkJobService.updateJobStatus(jobId, shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.FAILED, `Retry failed: ${errors[0].message}`, { errorDetails: JSON.stringify(errors) });
                throw new Error(`Failed to retry job: ${errors[0].message}`);
            }
            const bulkOperation = result?.bulkOperationRunQuery?.bulkOperation;
            if (!bulkOperation?.id) {
                throw new Error('Failed to start new bulk operation');
            }
            const updatedJob = await this.bulkJobService.updateJobStatus(jobId, shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING, 'Retry in progress', { shopifyBulkOperationId: bulkOperation.id });
            this.logger.log(`Successfully retried job ${jobId} with new bulk operation ${bulkOperation.id}`);
            return updatedJob;
        }
        catch (error) {
            this.logger.error(`Failed to retry job ${jobId}:`, error);
            throw error;
        }
    }
    async cancelJob(jobId) {
        try {
            const job = await this.bulkJobService.findJobById(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            if (job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.RUNNING &&
                job.status !== shopify_bulk_operation_job_entity_1.BulkOperationJobStatus.CREATED) {
                throw new Error(`Cannot cancel job with status ${job.status}`);
            }
            const success = await this.cancelBulkOperation(job.merchantId, job.shopifyBulkOperationId);
            if (!success) {
                this.logger.warn(`Failed to cancel Shopify bulk operation, but will mark job as canceled anyway`);
            }
            const updatedJob = await this.bulkJobService.cancelJob(jobId, 'Canceled by user');
            this.logger.log(`Cancelled job ${jobId}`);
            return updatedJob;
        }
        catch (error) {
            this.logger.error(`Failed to cancel job ${jobId}:`, error);
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
            const result = await this.shopifyClientService.query(shop, accessToken, cancelBulkOperationMutation);
            if (result?.bulkOperationCancel?.userErrors &&
                result.bulkOperationCancel.userErrors.length > 0) {
                const errors = result.bulkOperationCancel.userErrors;
                this.logger.error(`Failed to cancel bulk operation: ${errors[0].message}`);
                return false;
            }
            this.logger.log(`Cancelled bulk operation ${bulkOperationId} for merchant ${merchantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to cancel bulk operation for merchant ${merchantId}:`, error);
            return false;
        }
    }
};
exports.ShopifyBulkOperationEnhancedServicePart2 = ShopifyBulkOperationEnhancedServicePart2;
exports.ShopifyBulkOperationEnhancedServicePart2 = ShopifyBulkOperationEnhancedServicePart2 = ShopifyBulkOperationEnhancedServicePart2_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IShopifyClientService')),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        shopify_bulk_job_service_1.ShopifyBulkJobService])
], ShopifyBulkOperationEnhancedServicePart2);
//# sourceMappingURL=shopify-bulk-operation.enhanced.service.part2.js.map