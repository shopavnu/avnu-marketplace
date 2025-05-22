import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

/**
 * The log level
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * Metadata associated with a Shopify log entry
 */
export interface ShopifyLogMetadata {
  // Store/merchant identifiers
  shopDomain?: string;
  merchantId?: string;
  storeId?: string;

  // Operation identifiers
  operationId?: string;
  webhookId?: string;
  jobId?: string;
  bulkOperationId?: string;

  // Request details
  requestId?: string;
  endpoint?: string;

  // Performance metrics
  duration?: number;
  responseTime?: number;

  // Error information
  errorCode?: string;
  errorMessage?: string;
  httpStatusCode?: number;
  retryCount?: number;

  // Additional context
  component?: string;
  action?: string;
  resource?: string;

  // Any other custom data
  [key: string]: any;
}

/**
 * Enhanced structured logger for Shopify integrations
 *
 * Provides structured logging with consistent formatting and metadata
 * to improve observability in a multi-tenant environment.
 */
@Injectable()
export class ShopifyStructuredLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    // Configure Winston logger
    const isProduction = configService.get('NODE_ENV') === 'production';
    const logLevel = configService.get('LOG_LEVEL', 'info');

    // Create format for production (JSON) and development (pretty-printed)
    const format = isProduction
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            const metaStr = Object.keys(metadata).length
              ? `\n${JSON.stringify(metadata, null, 2)}`
              : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
          }),
        );

    // Create Winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      format,
      defaultMeta: { service: 'shopify-integration' },
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Log a message at the 'error' level
   */
  error(message: string, metadata: ShopifyLogMetadata = {}): void {
    this.logWithLevel(LogLevel.ERROR, message, metadata);
  }

  /**
   * Log a message at the 'warn' level
   */
  warn(message: string, metadata: ShopifyLogMetadata = {}): void {
    this.logWithLevel(LogLevel.WARN, message, metadata);
  }

  /**
   * Log a message at the 'info' level
   */
  log(message: string, metadata: ShopifyLogMetadata = {}): void {
    this.logWithLevel(LogLevel.INFO, message, metadata);
  }

  /**
   * Log a message at the 'debug' level
   */
  debug(message: string, metadata: ShopifyLogMetadata = {}): void {
    this.logWithLevel(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log a message at the 'verbose' level
   */
  verbose(message: string, metadata: ShopifyLogMetadata = {}): void {
    this.logWithLevel(LogLevel.VERBOSE, message, metadata);
  }

  /**
   * Log a webhook event
   */
  logWebhookEvent(
    topic: string,
    shopDomain: string,
    webhookId: string,
    metadata: ShopifyLogMetadata = {},
  ): void {
    this.log(`Webhook received: ${topic}`, {
      shopDomain,
      webhookId,
      component: 'webhook',
      action: 'received',
      resource: topic,
      ...metadata,
    });
  }

  /**
   * Log an API request to Shopify
   */
  logApiRequest(endpoint: string, shopDomain: string, metadata: ShopifyLogMetadata = {}): void {
    this.debug(`API Request: ${endpoint}`, {
      shopDomain,
      endpoint,
      component: 'api',
      action: 'request',
      ...metadata,
    });
  }

  /**
   * Log an API response from Shopify
   */
  logApiResponse(
    endpoint: string,
    shopDomain: string,
    status: number,
    duration: number,
    metadata: ShopifyLogMetadata = {},
  ): void {
    const logLevel = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;

    this.logWithLevel(logLevel, `API Response: ${endpoint} (${status})`, {
      shopDomain,
      endpoint,
      httpStatusCode: status,
      duration,
      component: 'api',
      action: 'response',
      ...metadata,
    });
  }

  /**
   * Log a bulk operation event
   */
  logBulkOperation(
    action: string,
    bulkOperationId: string,
    shopDomain: string,
    metadata: ShopifyLogMetadata = {},
  ): void {
    this.log(`Bulk operation ${action}`, {
      shopDomain,
      bulkOperationId,
      component: 'bulkOperation',
      action,
      ...metadata,
    });
  }

  /**
   * Log with a specific level and normalized metadata
   */
  private logWithLevel(level: LogLevel, message: string, metadata: ShopifyLogMetadata = {}): void {
    // Clean up metadata (remove undefined values)
    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([_, v]) => v !== undefined),
    );

    // Add request ID if not present (for correlation)
    if (!cleanMetadata.requestId) {
      cleanMetadata.requestId = this.generateRequestId();
    }

    // Log with Winston
    this.logger.log(level, message, cleanMetadata);
  }

  /**
   * Generate a unique request ID for correlation
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}
