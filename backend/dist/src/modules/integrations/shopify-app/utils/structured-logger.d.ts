import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}
export interface ShopifyLogMetadata {
  shopDomain?: string;
  merchantId?: string;
  storeId?: string;
  operationId?: string;
  webhookId?: string;
  jobId?: string;
  bulkOperationId?: string;
  requestId?: string;
  endpoint?: string;
  duration?: number;
  responseTime?: number;
  errorCode?: string;
  errorMessage?: string;
  httpStatusCode?: number;
  retryCount?: number;
  component?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}
export declare class ShopifyStructuredLogger implements LoggerService {
  private configService;
  private logger;
  constructor(configService: ConfigService);
  error(message: string, metadata?: ShopifyLogMetadata): void;
  warn(message: string, metadata?: ShopifyLogMetadata): void;
  log(message: string, metadata?: ShopifyLogMetadata): void;
  debug(message: string, metadata?: ShopifyLogMetadata): void;
  verbose(message: string, metadata?: ShopifyLogMetadata): void;
  logWebhookEvent(
    topic: string,
    shopDomain: string,
    webhookId: string,
    metadata?: ShopifyLogMetadata,
  ): void;
  logApiRequest(endpoint: string, shopDomain: string, metadata?: ShopifyLogMetadata): void;
  logApiResponse(
    endpoint: string,
    shopDomain: string,
    status: number,
    duration: number,
    metadata?: ShopifyLogMetadata,
  ): void;
  logBulkOperation(
    action: string,
    bulkOperationId: string,
    shopDomain: string,
    metadata?: ShopifyLogMetadata,
  ): void;
  private logWithLevel;
  private generateRequestId;
}
