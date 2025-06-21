import { Module, OnModuleInit, Optional } from '@nestjs/common';
// Skip Elasticsearch wiring in CI/e2e to avoid external dependency failures
const DISABLE_EXT_SERVICES = process.env.DISABLE_EXT_SERVICES === '1';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IndicesConfigService } from './indices.config';
import { LoggerService } from '@common/services/logger.service';

@Module({
  imports: DISABLE_EXT_SERVICES
    ? []
    : [
        ElasticsearchModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
            auth: {
              apiKey: configService.get<string>('ELASTICSEARCH_API_KEY') || '',
            },
            tls: { rejectUnauthorized: false },
            maxRetries: 10,
            requestTimeout: 60000,
          }),
          inject: [ConfigService],
        }),
      ],

  providers: DISABLE_EXT_SERVICES ? [LoggerService] : [IndicesConfigService, LoggerService],
  exports: DISABLE_EXT_SERVICES ? [] : [ElasticsearchModule, IndicesConfigService],
})
export class ElasticsearchConfigModule implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @Optional() private readonly indicesConfigService?: IndicesConfigService,
  ) {
    this.logger.setContext('ElasticsearchConfigModule');
  }

  async onModuleInit() {
    if (DISABLE_EXT_SERVICES) {
      this.logger.warn('Elasticsearch integrations disabled via DISABLE_EXT_SERVICES flag');
      return;
    }
    try {
      if (!this.indicesConfigService) {
        return;
      }
      this.logger.log('Initializing Elasticsearch indices...');
      await this.indicesConfigService.initIndices();
      this.logger.log('Elasticsearch indices initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Elasticsearch indices: ${error.message}`,
        error.stack,
      );
      // We don't want to fail application startup if indices creation fails
      // This allows the application to start even if Elasticsearch is temporarily unavailable
    }
  }
}
