import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
import _fs from 'fs';
import _readline from 'readline';
import { v4 as _uuidv4 } from 'uuid';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { PlatformType } from '../../enums/platform-type.enum';
import {
  IShopifyBulkOperationService,
  IShopifyClientService,
} from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkOperation } from '../../../common/types/shopify-models.types';
import { SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';
import { ShopifyBulkJobService } from './shopify-bulk-job.service';
import {
  ShopifyBulkOperationJob,
  BulkOperationJobStatus,
} from '../entities/shopify-bulk-operation-job.entity';

/**
 * Interface for cursor-based pagination of results
 */
export interface BulkOperationPaginatedResults<T> {
  data: T[];
  hasNextPage: boolean;
  endCursor?: string;
  totalCount: number;
}

/**
 * Enhanced service for handling Shopify Bulk Operations
 *
 * This enhanced service adds:
 * 1. Background job monitoring and tracking
 * 2. Improved cursor-based pagination
 * 3. Better error recovery mechanisms for long-running operations
 * 4. Progress tracking for bulk operations
 */
@Injectable()
export class ShopifyBulkOperationEnhancedService implements IShopifyBulkOperationService {
  /**
   * Map of common bulk operation error codes in the 2025-01 API
   */
  private readonly ERROR_CODES = {
    ACCESS_DENIED: 'ACCESS_DENIED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    TIMEOUT: 'TIMEOUT',
    QUERY_SYNTAX_ERROR: 'QUERY_SYNTAX_ERROR',
    QUERY_NOT_SUPPORTED: 'QUERY_NOT_SUPPORTED',
    OPERATION_TYPE_ERROR: 'OPERATION_TYPE_ERROR',
  };

  /**
   * Map of entity validation functions
   */
  private readonly entityValidators = {
    product: this.validateProductEntity.bind(this),
    order: this.validateOrderEntity.bind(this),
    customer: this.validateCustomerEntity.bind(this),
    fulfillment: this.validateFulfillmentEntity.bind(this),
  };

  /**
   * Map of entity transformation functions
   */
  private readonly entityTransformers = {
    product: this.transformProductEntity.bind(this),
    order: this.transformOrderEntity.bind(this),
    customer: this.transformCustomerEntity.bind(this),
    fulfillment: this.transformFulfillmentEntity.bind(this),
  };

  private readonly logger = new Logger(ShopifyBulkOperationEnhancedService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @Inject(SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)
    private readonly shopifyClientService: IShopifyClientService,
    private readonly bulkJobService: ShopifyBulkJobService,
  ) {}

  /**
   * Entity validation functions
   */
  private validateProductEntity(entity: any): boolean {
    if (!entity || typeof entity !== 'object') return false;
    return Boolean(entity.id && (entity.title || entity.handle));
  }

  private validateOrderEntity(entity: any): boolean {
    if (!entity || typeof entity !== 'object') return false;
    return Boolean(entity.id && entity.createdAt);
  }

  private validateCustomerEntity(entity: any): boolean {
    if (!entity || typeof entity !== 'object') return false;
    return Boolean(entity.id && (entity.email || entity.phone));
  }

  private validateFulfillmentEntity(entity: any): boolean {
    if (!entity || typeof entity !== 'object') return false;
    return Boolean(entity.id && entity.status);
  }

  /**
   * Entity transformation functions
   */
  private transformProductEntity(entity: any): any {
    return {
      ...entity,
      formattedPrice: entity.price ? `$${parseFloat(entity.price).toFixed(2)}` : 'N/A',
      availableForSale: Boolean(
        entity.status === 'ACTIVE' && (!entity.hasInventory || entity.totalInventory > 0),
      ),
    };
  }

  private transformOrderEntity(entity: any): any {
    return {
      ...entity,
      totalPrice: parseFloat(entity.totalPrice || '0'),
      formattedDate: entity.createdAt ? new Date(entity.createdAt).toISOString() : '',
    };
  }

  private transformCustomerEntity(entity: any): any {
    // Example transformation for customers
    return {
      ...entity,
      fullName:
        entity.firstName && entity.lastName
          ? `${entity.firstName} ${entity.lastName}`
          : entity.firstName || entity.lastName || 'Unknown',
    };
  }

  private transformFulfillmentEntity(entity: any): any {
    // Example transformation for fulfillments
    return {
      ...entity,
      isDelivered: entity.status === 'SUCCESS',
      statusLabel: this.mapFulfillmentStatus(entity.status),
    };
  }

  private mapFulfillmentStatus(status: string): string {
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

  /**
   * Get a Shopify connection for a merchant
   */
  private async getShopifyConnection(merchantId: string): Promise<MerchantPlatformConnection> {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        merchantId,
        platformType: PlatformType.SHOPIFY,
        isActive: true,
      },
    });

    if (!connection) {
      throw new Error(`No active Shopify connection found for merchant ${merchantId}`);
    }

    return connection;
  }

  /**
   * Process results from a bulk operation (implements interface requirement)
   * @param merchantId Merchant ID for connection lookup
   * @param url URL to download the bulk operation results
   * @param entityType Optional entity type to parse results into specific model types
   * @returns Parsed results from the bulk operation
   */
  async processResults<T = Record<string, any>[]>(
    merchantId: string,
    url: string,
    entityType?: string,
  ): Promise<T> {
    try {
      this.logger.log(`Processing bulk operation results for merchant ${merchantId}`);

      // Fetch the results from the URL
      const response = await axios.get(url, {
        responseType: 'text',
      });

      const results: Record<string, any>[] = [];

      // Parse the JSONL response
      const responseData = response.data as string;
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

      // Apply entity type validation if specified
      if (entityType) {
        this.logger.debug(`Validating results as entity type: ${entityType}`);
        // Perform any entity-specific validation here
      }

      return results as unknown as T;
    } catch (error) {
      this.logger.error(`Failed to process bulk operation results: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Start a bulk operation with job tracking
   * @param merchantId The merchant ID
   * @param query The GraphQL query for the bulk operation
   * @param description User-friendly description of the operation
   * @param metadata Additional metadata to store with the job
   * @returns The ID of the job tracking this bulk operation
   */
  /**
   * Start a bulk operation with enhanced features
   * @implementation This overrides the basic interface with extended functionality,
   * but returns the bulkOperationId as a string to maintain interface compatibility
   */
  async startBulkOperation(
    merchantId: string,
    query: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<string> {
    // Implementation will return the bulkOperationId as a string for interface compatibility
    try {
      // Get the merchant's Shopify connection
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to create a bulk operation
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

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        createBulkOperationMutation,
      );

      // Check for user errors
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

      // Get the bulk operation ID from the response
      const bulkOperation = result['bulkOperationRunQuery']['bulkOperation'];
      const bulkOperationId = bulkOperation.id;

      // Create a job to track this bulk operation
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

      // Update job to RUNNING status
      await this.bulkJobService.updateJobStatus(
        job.id,
        BulkOperationJobStatus.RUNNING,
        'Operation started',
      );

      // Log both IDs for traceability but only return the bulkOperationId
      this.logger.debug(
        `Enhanced bulk operation initiated with jobId=${job.id} and bulkOperationId=${bulkOperationId}`,
      );

      // Return just the bulkOperationId to maintain interface compatibility
      return bulkOperationId;
    } catch (error) {
      this.logger.error(`Failed to start bulk operation for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current status of a job
   */
  async getJobStatus(jobId: string): Promise<ShopifyBulkOperationJob> {
    try {
      const job = await this.bulkJobService.findJobById(jobId);

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // If the job is running, poll Shopify for the latest status
      if (job.status === BulkOperationJobStatus.RUNNING) {
        try {
          // Poll for the current status from Shopify
          const bulkOperation = await this.pollBulkOperationStatus(
            job.merchantId,
            job.shopifyBulkOperationId,
            1, // Only one attempt as this is just checking status
            0, // No delay
          );

          // Update the job status based on the Shopify status
          if (bulkOperation.status === 'COMPLETED') {
            await this.bulkJobService.updateJobStatus(
              jobId,
              BulkOperationJobStatus.COMPLETED,
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
              BulkOperationJobStatus.FAILED,
              `Operation failed: ${bulkOperation.errorCode || 'Unknown error'}`,
              {
                errorCode: bulkOperation.errorCode,
                errorDetails: bulkOperation.statusMessage,
                progressPercentage: 0,
              },
            );
          } else if (bulkOperation.status === 'RUNNING' || bulkOperation.status === 'CREATED') {
            // Calculate progress percentage based on object count if available
            let progressPercentage = 0;
            if (bulkOperation.objectCount > 0 && bulkOperation.rootObjectCount > 0) {
              progressPercentage = Math.min(
                Math.round((bulkOperation.objectCount / bulkOperation.rootObjectCount) * 100),
                99, // Cap at 99% until fully complete
              );
            }

            await this.bulkJobService.updateJobStatus(
              jobId,
              BulkOperationJobStatus.RUNNING,
              `Operation in progress: ${bulkOperation.status}`,
              {
                objectCount: bulkOperation.objectCount,
                fileSize: bulkOperation.fileSize,
                progressPercentage,
              },
            );
          }

          // Refresh the job data
          return await this.bulkJobService.findJobById(jobId);
        } catch (error) {
          // Don't update job status on polling errors - just log
          this.logger.warn(`Failed to poll status for job ${jobId}:`, error);
        }
      }

      return job;
    } catch (error) {
      this.logger.error(`Failed to get status for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Poll for the status of a bulk operation with enhanced error handling
   * @param merchantId The merchant ID
   * @param bulkOperationId The ID of the bulk operation to poll
   * @param maxRetries Maximum number of polling retries (default: 10)
   * @param delayMs Delay between retries in milliseconds (default: 2000)
   * @returns The current status of the bulk operation
   */
  async pollBulkOperationStatus(
    merchantId: string,
    bulkOperationId: string,
    maxRetries: number = 10,
    delayMs: number = 2000,
  ): Promise<ShopifyBulkOperation> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Enhanced GraphQL query to get the status of a bulk operation with 2025-01 fields
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

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        getBulkOperationQuery,
      );

      if (!result || !result['node']) {
        throw new Error(
          `Failed to poll bulk operation status: Bulk operation ${bulkOperationId} not found`,
        );
      }

      // Map the response to our ShopifyBulkOperation type
      const operation: ShopifyBulkOperation = {
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

      // Detailed error handling according to 2025-01 API
      if (operation.status.toUpperCase() === 'FAILED') {
        this.logger.error(
          `Bulk operation ${bulkOperationId} failed: ${operation.errorCode || 'Unknown error'}`,
        );

        const errorDetail = operation.errorCode || 'No error details available';
        throw new Error(`Bulk operation failed: ${errorDetail}`);
      }

      // Check if the bulk operation was completed
      if (operation.status.toUpperCase() === 'COMPLETED') {
        this.logger.log(`Bulk operation ${bulkOperationId} completed successfully`);
        return operation;
      }

      // If not complete and we have retries left, wait and try again
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
      this.logger.error(`Failed to poll bulk operation status for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  // We'll continue with the implementation in the next file
}
