import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as readline from 'readline';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { PlatformType } from '../../enums/platform-type.enum';
import {
  IShopifyBulkOperationService,
  IShopifyClientService,
} from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkOperation } from '../../../common/types/shopify-models.types';
import { SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';

/**
 * Service for handling Shopify Bulk Operations
 *
 * Implements the Bulk Operations API from Shopify's 2025-01 API
 * allowing for scalable data operations on large datasets.
 */
@Injectable()
export class ShopifyBulkOperationService implements IShopifyBulkOperationService {
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
   * Validate an entity based on its type
   * @param entity The entity to validate
   * @param entityType The type of entity
   * @returns Whether the entity is valid
   */
  private validateEntity(entity: any, entityType: string): boolean {
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
        return true; // For unknown types, assume valid
    }
  }

  /**
   * Transform an entity based on its type
   * @param entity The entity to transform
   * @param entityType The type of entity
   * @returns The transformed entity
   */
  private transformEntity(entity: any, entityType: string): any {
    // Apply transformations based on entity type
    switch (entityType.toLowerCase()) {
      case 'product':
        // Example transformation for products
        return {
          ...entity,
          formattedPrice: entity.price ? `$${parseFloat(entity.price).toFixed(2)}` : 'N/A',
          availableForSale: Boolean(
            entity.status === 'ACTIVE' && (!entity.hasInventory || entity.totalInventory > 0),
          ),
        };
      case 'order':
        // Example transformation for orders
        return {
          ...entity,
          totalPrice: parseFloat(entity.totalPrice || '0'),
          formattedDate: entity.createdAt ? new Date(entity.createdAt).toISOString() : '',
        };
      default:
        return entity;
    }
  }
  private readonly logger = new Logger(ShopifyBulkOperationService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @Inject(SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)
    private readonly shopifyClientService: IShopifyClientService,
  ) {}

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
   * Start a bulk operation
   * @param merchantId The merchant ID
   * @param query The GraphQL query for the bulk operation
   * @returns The ID of the started bulk operation
   */
  async startBulkOperation(merchantId: string, query: string): Promise<string> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to start a bulk operation
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

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        startBulkOperationMutation,
      );

      // Check for user errors
      if (
        result &&
        result['bulkOperationRunQuery'] &&
        result['bulkOperationRunQuery']['userErrors'] &&
        result['bulkOperationRunQuery']['userErrors'].length > 0
      ) {
        const errors = result['bulkOperationRunQuery']['userErrors'];
        throw new Error(`Failed to start bulk operation: ${errors[0].message}`);
      }

      // Extract the bulk operation ID
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

  /**
   * Poll for the status of a bulk operation
   * @param merchantId The merchant ID
   * @param bulkOperationId The ID of the bulk operation to poll
   * @returns The current status of the bulk operation
   */
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

  /**
   * Download and process the results of a bulk operation
   * @param merchantId The merchant ID
   * @param url The URL to download the results from
   * @param entityType Optional entity type to parse results into specific model types
   * @returns Parsed results from the bulk operation
   */
  /**
   * Download and process the results of a bulk operation with enhanced error handling
   * @param merchantId The merchant ID
   * @param url The URL to download the results from
   * @param entityType Optional entity type to parse results into specific model types
   * @param options Optional configuration for result processing
   * @returns Parsed results from the bulk operation
   */
  async processResults<T = Record<string, any>[]>(
    merchantId: string,
    url: string,
    entityType?: string,
    options?: {
      batchSize?: number;
      validateEntities?: boolean;
      transformEntities?: boolean;
    },
  ): Promise<T> {
    const { batchSize = 1000, validateEntities = true, transformEntities = true } = options || {};
    try {
      this.logger.log(`Processing bulk operation results from ${url} for merchant ${merchantId}`);

      // Download the JSONL file
      const response = await axios.get(url, { responseType: 'stream' });

      // Create a temp file for the download
      const tempFilePath = `/tmp/bulk-operation-${Date.now()}.jsonl`;
      const writer = fs.createWriteStream(tempFilePath);

      // Save the file - Type cast response.data to Readable stream
      (response.data as any).pipe(writer);
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', err => reject(err));
      });

      // Parse the JSONL file line by line
      const results: any[] = [];
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

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      this.logger.log(
        `Processed ${results.length} results from bulk operation for merchant ${merchantId}`,
      );

      // Enhanced entity-specific processing with validation (2025-01 API)
      if (entityType && validateEntities) {
        this.logger.log(`Validating and processing entities of type: ${entityType}`);

        // Process in batches to avoid memory issues with large datasets
        const processedResults = [];
        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);

          // Apply entity-specific validation and transformation
          const processedBatch = batch
            .map(item => {
              // Validate required fields based on entity type
              if (!this.validateEntity(item, entityType)) {
                this.logger.warn(
                  `Skipping invalid ${entityType} entity:`,
                  JSON.stringify(item).substring(0, 200),
                );
                return null;
              }

              // Transform entity if needed
              if (transformEntities) {
                return this.transformEntity(item, entityType);
              }

              return item;
            })
            .filter(Boolean); // Remove null items

          processedResults.push(...processedBatch);
        }

        this.logger.log(
          `Successfully processed ${processedResults.length} valid ${entityType} entities`,
        );
        return processedResults as unknown as T;
      }

      return results as unknown as T;
    } catch (error) {
      this.logger.error(
        `Failed to process bulk operation results for merchant ${merchantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Cancel a running bulk operation
   * @param merchantId The merchant ID
   * @param bulkOperationId The ID of the bulk operation to cancel
   * @returns Success status of the cancellation
   */
  async cancelBulkOperation(merchantId: string, bulkOperationId: string): Promise<boolean> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to cancel a bulk operation
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

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        cancelBulkOperationMutation,
      );

      // Check for user errors
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
}
