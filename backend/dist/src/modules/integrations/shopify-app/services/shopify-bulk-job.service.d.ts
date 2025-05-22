import { Repository } from 'typeorm';
import {
  ShopifyBulkOperationJob,
  BulkOperationJobStatus,
} from '../entities/shopify-bulk-operation-job.entity';
export declare class ShopifyBulkJobService {
  private readonly jobRepository;
  private readonly logger;
  constructor(jobRepository: Repository<ShopifyBulkOperationJob>);
  createJob(
    merchantId: string,
    bulkOperationId: string,
    description: string,
    query: string,
    metadata?: Record<string, any>,
    connectionId?: string,
  ): Promise<ShopifyBulkOperationJob>;
  updateJobStatus(
    jobId: string,
    status: BulkOperationJobStatus,
    statusMessage?: string,
    additionalData?: Partial<ShopifyBulkOperationJob>,
  ): Promise<ShopifyBulkOperationJob>;
  findJobById(jobId: string): Promise<ShopifyBulkOperationJob | null>;
  findJobsByMerchantId(
    merchantId: string,
    status?: BulkOperationJobStatus | BulkOperationJobStatus[],
    limit?: number,
    cursor?: string,
    direction?: 'forward' | 'backward',
  ): Promise<{
    jobs: ShopifyBulkOperationJob[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  }>;
  cleanupOldJobs(): Promise<void>;
  findStalledJobs(): Promise<void>;
  retryJob(jobId: string): Promise<ShopifyBulkOperationJob>;
  cancelJob(jobId: string, reason?: string): Promise<ShopifyBulkOperationJob>;
  getJobMetrics(merchantId?: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    canceledJobs: number;
    timedOutJobs: number;
    averageCompletionTimeMs?: number;
  }>;
}
