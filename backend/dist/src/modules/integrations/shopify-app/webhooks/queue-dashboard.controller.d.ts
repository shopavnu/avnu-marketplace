import { Queue } from 'bull';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
export declare class QueueDashboardController {
  private webhookQueue;
  private readonly logger;
  constructor(webhookQueue: Queue, logger: ShopifyStructuredLogger);
  getQueueStats(): Promise<{
    counts: import('bull').JobCounts;
    processingRate: number;
    activeJobs: {
      id: import('bull').JobId;
      topic: any;
      shop: any;
      attemptsMade: number;
      timestamp: number;
    }[];
    failedJobs: {
      id: import('bull').JobId;
      topic: any;
      shop: any;
      attemptsMade: number;
      stacktrace: string[];
      failedReason: string;
    }[];
    queueHealth: {
      isHealthy: boolean;
      stuckJobsCount: number;
      oldestJob: number;
    };
  }>;
  getMerchantQueueStats(merchantId: string): Promise<{
    merchantId: string;
    totalJobs: number;
    status: {
      active: number;
      waiting: number;
      failed: number;
      completed: number;
    };
    topics: {};
    recentFailed: {
      id: import('bull').JobId;
      topic: any;
      failedReason: string;
      timestamp: number;
    }[];
  }>;
  retryJob(jobId: string): Promise<{
    success: boolean;
    message: string;
  }>;
  cleanupOldJobs(): Promise<{
    success: boolean;
    message: string;
  }>;
}
