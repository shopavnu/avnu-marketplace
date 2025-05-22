import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType as _ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig as _shopifyConfig } from '../../../common/config/shopify-config';
import { PlatformType } from '../../enums/platform-type.enum';
import {
  IShopifyBulkOperationService as _IShopifyBulkOperationService,
  IShopifyClientService,
} from '../../../common/interfaces/shopify-services.interfaces';
import { ShopifyBulkOperation as _ShopifyBulkOperation } from '../../../common/types/shopify-models.types';
import { SHOPIFY_CONSTANTS as _SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';
import { ShopifyBulkJobService } from './shopify-bulk-job.service';
import {
  ShopifyBulkOperationJob,
  BulkOperationJobStatus,
} from '../entities/shopify-bulk-operation-job.entity';
import { BulkOperationPaginatedResults } from './shopify-bulk-operation.enhanced.service';

/**
 * This is a continuation of the ShopifyBulkOperationEnhancedService
 * implementation focusing on processing results with cursor-based pagination
 * and error recovery mechanisms.
 *
 * This will be merged with the first part in the final implementation.
 */
@Injectable()
export class ShopifyBulkOperationEnhancedServicePart2 {
  // Dependencies that need to be injected
  constructor(
    @Inject('IShopifyClientService') private readonly shopifyClientService: IShopifyClientService,
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantConnectionRepository: Repository<MerchantPlatformConnection>,
    private readonly bulkJobService: ShopifyBulkJobService,
  ) {}

  private readonly logger = new Logger(ShopifyBulkOperationEnhancedServicePart2.name);

  // Validators and transformers as class members
  private entityValidators: Record<string, (entity: any) => boolean> = {
    // Add entity validators as needed
    default: (entity: any) => !!entity,
  };

  private entityTransformers: Record<string, (entity: any) => any> = {
    // Add entity transformers as needed
    default: (entity: any) => entity,
  };

  /**
   * Get Shopify connection details for a merchant
   *
   * @param merchantId The merchant ID
   * @returns Connection details with shop name and access token
   */
  async getShopifyConnection(
    merchantId: string,
  ): Promise<{ platformStoreName: string; accessToken: string }> {
    const connection = await this.merchantConnectionRepository.findOne({
      where: {
        merchantId,
        platformType: PlatformType.SHOPIFY,
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

  /**
   * Process results with cursor-based pagination
   *
   * @param jobId The job tracking this bulk operation
   * @param options Processing options
   * @param cursor Optional cursor for pagination
   * @param limit Number of items to return per page
   * @returns Paginated results
   */
  async processResultsWithPagination<T>(
    jobId: string,
    options: {
      entityType?: string;
      validateEntities?: boolean;
      transformEntities?: boolean;
      filters?: Record<string, any>;
    } = {},
    cursor?: string,
    limit: number = 100,
  ): Promise<BulkOperationPaginatedResults<T>> {
    try {
      // Get the job
      const job = await this.bulkJobService.findJobById(jobId);

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Check if job is completed
      if (job.status !== BulkOperationJobStatus.COMPLETED) {
        throw new Error(`Cannot process results for job with status ${job.status}`);
      }

      // Get the result URL
      const resultUrl = job.resultUrl;
      if (!resultUrl) {
        throw new Error(`No result URL available for job ${jobId}`);
      }

      // Process options
      const entityType = options.entityType;
      const validateEntities = options.validateEntities !== false;
      const transformEntities = options.transformEntities !== false;
      const filters = options.filters || {};

      // Download the results file
      const tempFilePath = `/tmp/shopify-bulk-${uuidv4()}.jsonl`;
      this.logger.log(`Downloading bulk operation results to ${tempFilePath}`);

      const response = await axios.get(resultUrl, {
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(tempFilePath);
      // Add type assertion to fix 'pipe' method not found on type 'unknown'
      (response.data as any).pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // Process the JSONL file with pagination
      const allResults: any[] = [];
      let filteredResults: any[] = [];
      const _currentIndex = 0;
      const _endCursorIndex = -1;
      let startCursorIndex = 0;

      // Read all results into memory for filtering and pagination
      // This works for reasonably sized result sets
      const fileStream = fs.createReadStream(tempFilePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        try {
          if (line.trim() === '') continue;
          const jsonData = JSON.parse(line);
          allResults.push(jsonData);
        } catch (error) {
          this.logger.warn(`Error parsing JSON line: ${error.message}`);
          continue;
        }
      }

      // Apply filters
      if (Object.keys(filters).length > 0) {
        filteredResults = allResults.filter(item => {
          for (const [key, value] of Object.entries(filters)) {
            if (item[key] !== value) {
              return false;
            }
          }
          return true;
        });
      } else {
        filteredResults = allResults;
      }

      // Calculate pagination
      if (cursor) {
        // Find the index of the cursor item
        startCursorIndex = filteredResults.findIndex(
          item => item.id === cursor || item.cursor === cursor,
        );
        if (startCursorIndex === -1) {
          // Cursor not found, start from beginning
          startCursorIndex = 0;
        } else {
          // Start after the cursor item
          startCursorIndex += 1;
        }
      }

      // Get the page of results
      const endIndex = Math.min(startCursorIndex + limit, filteredResults.length);
      const pageItems = filteredResults.slice(startCursorIndex, endIndex);

      // Process each item
      const validatedItems: T[] = [];
      const errors: Error[] = [];

      for (const item of pageItems) {
        try {
          // Validate if required
          if (validateEntities && entityType) {
            const validator = this.entityValidators[entityType] || this.entityValidators.default;
            if (!validator(item)) {
              throw new Error(`Validation failed for item ${item.id || JSON.stringify(item)}`);
            }
          }

          // Transform if required
          if (transformEntities && entityType) {
            const transformer =
              this.entityTransformers[entityType] || this.entityTransformers.default;
            validatedItems.push(transformer(item));
          } else {
            validatedItems.push(item as T);
          }
        } catch (error) {
          errors.push(error);
          this.logger.error(`Error processing item: ${error.message}`);
        }
      }

      // Calculate next cursor
      const hasNextPage = endIndex < filteredResults.length;
      const nextCursor = hasNextPage
        ? filteredResults[endIndex - 1].id || filteredResults[endIndex - 1].cursor
        : null;

      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        this.logger.warn(`Error deleting temp file: ${error.message}`);
      }

      // Log errors if any occurred during processing
      if (errors.length > 0) {
        this.logger.warn(
          `Encountered ${errors.length} errors while processing results: ${errors.map(e => e.message).join(', ')}`,
        );
      }

      // Return object matching the BulkOperationPaginatedResults interface
      return {
        data: validatedItems,
        totalCount: filteredResults.length,
        hasNextPage,
        endCursor: nextCursor,
      };
    } catch (error) {
      this.logger.error(`Failed to process bulk operation results: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download and process all results at once
   * Warning: This can be memory-intensive for large datasets
   * For large datasets, use processResultsWithPagination instead
   *
   * @param jobId The job tracking this bulk operation
   * @param options Processing options
   * @returns Array of processed entities
   */
  async processAllResults<T>(
    jobId: string,
    options: {
      entityType?: string;
      validateEntities?: boolean;
      transformEntities?: boolean;
      batchSize?: number;
    } = {},
  ): Promise<T[]> {
    try {
      // Get the job
      const job = await this.bulkJobService.findJobById(jobId);

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Check if job is completed
      if (job.status !== BulkOperationJobStatus.COMPLETED) {
        throw new Error(`Cannot process results for job with status ${job.status}`);
      }

      // Get the result URL
      const resultUrl = job.resultUrl;
      if (!resultUrl) {
        throw new Error(`No result URL available for job ${jobId}`);
      }

      // Process options
      const entityType = options.entityType;
      const validateEntities = options.validateEntities !== false;
      const transformEntities = options.transformEntities !== false;
      const batchSize = options.batchSize || 1000;

      // Download the results file
      const tempFilePath = `/tmp/shopify-bulk-${uuidv4()}.jsonl`;
      this.logger.log(`Downloading bulk operation results to ${tempFilePath}`);

      const response = await axios.get(resultUrl, {
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(tempFilePath);
      // Add type assertion to fix 'pipe' method not found on type 'unknown'
      (response.data as any).pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // Process the JSONL file
      const allResults: T[] = [];
      const errors: Error[] = [];
      let currentBatch: any[] = [];
      let batchCount = 0;

      const fileStream = fs.createReadStream(tempFilePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      // Process file line by line
      for await (const line of rl) {
        try {
          if (line.trim() === '') continue;
          const jsonData = JSON.parse(line);

          // Validate if required
          if (validateEntities && entityType) {
            const validator = this.entityValidators[entityType] || this.entityValidators.default;
            if (!validator(jsonData)) {
              throw new Error(
                `Validation failed for item ${jsonData.id || JSON.stringify(jsonData)}`,
              );
            }
          }

          // Transform if required
          if (transformEntities && entityType) {
            const transformer =
              this.entityTransformers[entityType] || this.entityTransformers.default;
            currentBatch.push(transformer(jsonData));
          } else {
            currentBatch.push(jsonData as T);
          }

          // Process in batches
          if (currentBatch.length >= batchSize) {
            allResults.push(...currentBatch);
            batchCount++;
            this.logger.log(`Processed batch ${batchCount} (${currentBatch.length} items)`);
            currentBatch = [];
          }
        } catch (error) {
          errors.push(error);
          this.logger.error(`Error processing item: ${error.message}`);
        }
      }

      // Process final batch
      if (currentBatch.length > 0) {
        allResults.push(...currentBatch);
        batchCount++;
        this.logger.log(`Processed final batch ${batchCount} (${currentBatch.length} items)`);
      }

      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        this.logger.warn(`Error deleting temp file: ${error.message}`);
      }

      // Log any errors
      if (errors.length > 0) {
        this.logger.warn(`Encountered ${errors.length} errors while processing results`);
      }

      this.logger.log(`Successfully processed ${allResults.length} items from bulk operation`);
      return allResults;
    } catch (error) {
      this.logger.error(`Failed to process bulk operation results: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retry a failed bulk operation job
   *
   * @param jobId The job ID to retry
   * @returns The updated job
   */
  async retryJob(jobId: string): Promise<ShopifyBulkOperationJob> {
    try {
      // Get the job
      const job = await this.bulkJobService.findJobById(jobId);

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Only retry failed jobs
      if (job.status !== BulkOperationJobStatus.FAILED) {
        throw new Error(`Cannot retry job with status ${job.status}`);
      }

      // Get query from job
      const query = job.query;
      if (!query) {
        throw new Error(`No query found for job ${jobId}`);
      }

      // Get the Shopify connection
      const connection = await this.getShopifyConnection(job.merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Define the GraphQL mutation
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

      // Execute the GraphQL mutation
      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        bulkOperationRunQuery,
      );

      // Check for user errors
      if (
        result?.bulkOperationRunQuery?.userErrors &&
        result.bulkOperationRunQuery.userErrors.length > 0
      ) {
        const errors = result.bulkOperationRunQuery.userErrors;
        this.logger.error(`Failed to start bulk operation: ${errors[0].message}`);

        // Update job as failed
        await this.bulkJobService.updateJobStatus(
          jobId,
          BulkOperationJobStatus.FAILED,
          `Retry failed: ${errors[0].message}`,
          { errorDetails: JSON.stringify(errors) },
        );

        throw new Error(`Failed to retry job: ${errors[0].message}`);
      }

      // Get the new bulk operation ID
      const bulkOperation = result?.bulkOperationRunQuery?.bulkOperation;
      if (!bulkOperation?.id) {
        throw new Error('Failed to start new bulk operation');
      }

      // Update job with new shopify bulk operation ID
      const updatedJob = await this.bulkJobService.updateJobStatus(
        jobId,
        BulkOperationJobStatus.RUNNING,
        'Retry in progress',
        { shopifyBulkOperationId: bulkOperation.id },
      );

      this.logger.log(
        `Successfully retried job ${jobId} with new bulk operation ${bulkOperation.id}`,
      );

      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to retry job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running bulk operation
   *
   * @param jobId The job ID to cancel
   * @returns The updated job
   */
  async cancelJob(jobId: string): Promise<ShopifyBulkOperationJob> {
    try {
      // Get the job
      const job = await this.bulkJobService.findJobById(jobId);

      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      // Only cancel if the job is in a cancellable state
      if (
        job.status !== BulkOperationJobStatus.RUNNING &&
        job.status !== BulkOperationJobStatus.CREATED
      ) {
        throw new Error(`Cannot cancel job with status ${job.status}`);
      }

      // Cancel the Shopify bulk operation
      const success = await this.cancelBulkOperation(job.merchantId, job.shopifyBulkOperationId);

      if (!success) {
        // Still mark as canceled in our system even if Shopify cancellation fails
        this.logger.warn(
          `Failed to cancel Shopify bulk operation, but will mark job as canceled anyway`,
        );
      }

      // Update the job status
      const updatedJob = await this.bulkJobService.cancelJob(jobId, 'Canceled by user');

      this.logger.log(`Cancelled job ${jobId}`);
      return updatedJob;
    } catch (error) {
      this.logger.error(`Failed to cancel job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a running bulk operation in Shopify
   *
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
        result?.bulkOperationCancel?.userErrors &&
        result.bulkOperationCancel.userErrors.length > 0
      ) {
        const errors = result.bulkOperationCancel.userErrors;
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
