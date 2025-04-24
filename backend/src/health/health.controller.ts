import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/services/logger.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(HealthController.name);
  }

  @Get()
  @HealthCheck()
  async check() {
    this.logger.debug('Performing health check');
    return this.health
      .check([
        // Database health check
        () => this.db.pingCheck('database'),

        // Memory usage check
        () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB

        // Elasticsearch health check
        () =>
          this.http.pingCheck(
            'elasticsearch',
            this.configService.get<string>('ELASTICSEARCH_NODE'),
          ),

        // Redis health check - if we have a Redis client service, we could use a custom health indicator
      ])
      .then(result => {
        this.logger.debug('Health check completed successfully');
        return result;
      })
      .catch(error => {
        this.logger.error(`Health check failed: ${error.message}`, error.stack);
        throw error;
      });
  }
}
