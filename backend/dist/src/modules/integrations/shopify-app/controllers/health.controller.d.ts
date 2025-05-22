import { ShopifyClientService } from '../services/shopify-client.service';
import { ShopifyCircuitBreaker } from '../utils/circuit-breaker';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';
import { ShopifyClientExtensions } from '../services/shopify-client-extensions';
interface ServiceHealth {
  healthy: boolean;
  status?: string;
  details?: any;
  lastChecked?: string;
  error?: string;
}
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  services: {
    shopifyApi: ServiceHealth;
    database: ServiceHealth;
    redis?: ServiceHealth;
    bulkOperations?: ServiceHealth;
    webhooks?: ServiceHealth;
  };
  metrics?: {
    activeConnections: number;
    openCircuits: number;
    pendingJobs: number;
    failedJobs: number;
    averageResponseTime: number;
  };
}
export declare class ShopifyHealthController {
  private readonly shopifyClientService;
  private readonly shopifyClientExtensions;
  private readonly circuitBreaker;
  private readonly configService;
  private readonly bulkJobRepository;
  private readonly logger;
  constructor(
    shopifyClientService: ShopifyClientService,
    shopifyClientExtensions: ShopifyClientExtensions,
    circuitBreaker: ShopifyCircuitBreaker,
    configService: ConfigService,
    bulkJobRepository: Repository<ShopifyBulkOperationJob>,
  );
  getHealth(): Promise<HealthStatus>;
  getDiagnostics(merchantId?: string): Promise<any>;
  private checkShopifyApiHealth;
  private checkDatabaseHealth;
  private checkBulkOperationsHealth;
  private getCircuitBreakerStatus;
  private getJobStatistics;
  private getHealthMetrics;
  private determineOverallStatus;
}
export {};
