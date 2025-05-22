import { Controller, Get, UseGuards, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ShopifyClientService } from '../services/shopify-client.service';
import { ShopifyCircuitBreaker, CircuitState } from '../utils/circuit-breaker';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ShopifyBulkOperationJob } from '../entities/shopify-bulk-operation-job.entity';
import { ShopifyClientExtensions } from '../services/shopify-client-extensions';
import { BulkOperationJobStatus } from '../entities/shopify-bulk-operation-job.entity';

/**
 * Structure of a service health check result
 */
interface ServiceHealth {
  healthy: boolean;
  status?: string;
  details?: any;
  lastChecked?: string;
  error?: string;
}

/**
 * Overall health status response
 */
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

/**
 * Controller for health checks and diagnostics
 *
 * Provides endpoints to check the health of various components
 * of the Shopify integration system.
 */
@Controller('integrations/shopify/health')
export class ShopifyHealthController {
  private readonly logger = new Logger(ShopifyHealthController.name);

  constructor(
    private readonly shopifyClientService: ShopifyClientService,
    private readonly shopifyClientExtensions: ShopifyClientExtensions,
    private readonly circuitBreaker: ShopifyCircuitBreaker,
    private readonly configService: ConfigService,
    @InjectRepository(ShopifyBulkOperationJob)
    private readonly bulkJobRepository: Repository<ShopifyBulkOperationJob>,
  ) {}

  /**
   * Get overall health status of the Shopify integration
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getHealth(): Promise<HealthStatus> {
    // Run health checks in parallel
    const [shopifyApiHealth, databaseHealth, bulkOperationsHealth] = await Promise.all([
      this.checkShopifyApiHealth(),
      this.checkDatabaseHealth(),
      this.checkBulkOperationsHealth(),
    ]);

    // Determine overall status
    const servicesHealthy = [shopifyApiHealth, databaseHealth, bulkOperationsHealth];

    const status = this.determineOverallStatus(servicesHealthy);

    // Get metrics
    const metrics = await this.getHealthMetrics();

    return {
      status,
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV', 'development'),
      services: {
        shopifyApi: shopifyApiHealth,
        database: databaseHealth,
        bulkOperations: bulkOperationsHealth,
      },
      metrics,
    };
  }

  /**
   * Get detailed diagnostics for the shopify integration
   */
  @Get('diagnostics')
  @UseGuards(JwtAuthGuard)
  async getDiagnostics(@Query('merchantId') merchantId?: string): Promise<any> {
    const diagnosticsData: any = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    // Get open circuits
    diagnosticsData.circuits = await this.getCircuitBreakerStatus();

    // Get job statistics
    diagnosticsData.jobs = await this.getJobStatistics(merchantId);

    return diagnosticsData;
  }

  /**
   * Check Shopify API health
   */
  private async checkShopifyApiHealth(): Promise<ServiceHealth> {
    try {
      // Just a simple check to see if we can reach Shopify
      // This is a lightweight call that doesn't need auth
      const isShopifyReachable = await this.shopifyClientExtensions.isShopifyReachable();

      return {
        healthy: isShopifyReachable,
        status: isShopifyReachable ? 'connected' : 'disconnected',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Shopify API health check failed: ${error.message}`);
      return {
        healthy: false,
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    try {
      // Simple query to check if database is responsive
      const queryResult = await this.bulkJobRepository.query('SELECT 1 as health');
      const isHealthy =
        Array.isArray(queryResult) && queryResult.length > 0 && queryResult[0].health === 1;

      return {
        healthy: isHealthy,
        status: isHealthy ? 'connected' : 'disconnected',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        healthy: false,
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check bulk operations health
   */
  private async checkBulkOperationsHealth(): Promise<ServiceHealth> {
    try {
      // Check for any stuck jobs (running for too long)
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const stuckJobs = await this.bulkJobRepository.count({
        where: {
          status: BulkOperationJobStatus.RUNNING,
          updatedAt: LessThan(twoHoursAgo),
        },
      });

      const isHealthy = stuckJobs === 0;

      return {
        healthy: isHealthy,
        status: isHealthy ? 'operational' : 'degraded',
        details: { stuckJobs },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Bulk operations health check failed: ${error.message}`);
      return {
        healthy: false,
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Get circuit breaker status
   */
  private async getCircuitBreakerStatus(): Promise<any> {
    try {
      // This would need to be implemented based on how you expose circuit data
      const allCircuits = await this.circuitBreaker.getAllCircuits();
      const openCircuits = allCircuits.filter(c => c.state === CircuitState.OPEN);

      return {
        total: allCircuits.length,
        open: openCircuits.length,
        openCircuits: openCircuits.map(c => ({
          key: c.key,
          failureCount: c.failureCount,
          nextAttemptTime: new Date(c.nextAttemptTime).toISOString(),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get circuit breaker status: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Get job statistics
   */
  private async getJobStatistics(merchantId?: string): Promise<any> {
    try {
      // Base query
      let query = this.bulkJobRepository.createQueryBuilder('job');

      // Add merchant filter if provided
      if (merchantId) {
        query = query.where('job.merchantId = :merchantId', { merchantId });
      }

      // Get counts by status
      const statusCounts = await query
        .select('job.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('job.status')
        .getRawMany();

      // Format the result
      const formattedCounts = statusCounts.reduce((acc, curr) => {
        acc[curr.status.toLowerCase()] = parseInt(curr.count, 10);
        return acc;
      }, {});

      // Get recent failed jobs
      const recentFailedJobs = await this.bulkJobRepository.find({
        where: { status: BulkOperationJobStatus.FAILED },
        order: { updatedAt: 'DESC' },
        take: 5,
        select: [
          'id',
          'merchantId',
          'description',
          'errorCode',
          'errorDetails',
          'createdAt',
          'updatedAt',
        ],
      });

      return {
        counts: formattedCounts,
        recentFailures: recentFailedJobs,
      };
    } catch (error) {
      this.logger.error(`Failed to get job statistics: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Get health metrics
   */
  private async getHealthMetrics(): Promise<any> {
    try {
      // These would need to be implemented based on your specific metrics collection
      // This is just an example structure
      return {
        activeConnections: 0, // Would come from connection pool manager
        openCircuits: 0, // Would come from circuit breaker
        pendingJobs: await this.bulkJobRepository.count({
          where: { status: BulkOperationJobStatus.RUNNING },
        }),
        failedJobs: await this.bulkJobRepository.count({
          where: { status: BulkOperationJobStatus.FAILED },
        }),
        averageResponseTime: 0, // Would come from metrics service
      };
    } catch (error) {
      this.logger.error(`Failed to get health metrics: ${error.message}`);
      return {};
    }
  }

  /**
   * Determine the overall health status
   */
  private determineOverallStatus(services: ServiceHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = services.filter(s => !s.healthy).length;

    if (unhealthyCount === 0) {
      return 'healthy';
    } else if (unhealthyCount < services.length / 2) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }
}
