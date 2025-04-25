import { Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IndicesConfigService } from './indices.config';
import { LoggerService } from '@common/services/logger.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        auth: {
          username: configService.get<string>('ELASTICSEARCH_USERNAME') || '',
          password: configService.get<string>('ELASTICSEARCH_PASSWORD') || '',
        },
        tls: {
          rejectUnauthorized: false,
        },
        maxRetries: 10,
        requestTimeout: 60000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IndicesConfigService, LoggerService],
  exports: [ElasticsearchModule, IndicesConfigService],
})
export class ElasticsearchConfigModule implements OnModuleInit {
  constructor(
    private readonly indicesConfigService: IndicesConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('ElasticsearchConfigModule');
  }

  async onModuleInit() {
    try {
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
