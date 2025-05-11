import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
export declare enum BulkOperationJobStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  TIMED_OUT = 'TIMED_OUT',
}
export declare class ShopifyBulkOperationJob {
  id: string;
  merchantId: string;
  shopifyBulkOperationId: string;
  description: string;
  query: string;
  status: BulkOperationJobStatus;
  statusMessage: string;
  errorCode: string;
  errorDetails: string;
  resultUrl: string;
  partialResultUrl: string;
  objectCount: number;
  fileSize: number;
  completedAt: Date;
  retryCount: number;
  progressPercentage: number;
  metadata: Record<string, any>;
  connectionId: string;
  connection: MerchantPlatformConnection;
  createdAt: Date;
  updatedAt: Date;
}
