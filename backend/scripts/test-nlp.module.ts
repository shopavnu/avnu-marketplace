import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { NlpModule } from '../src/modules/nlp/nlp.module';
import { MockSearchService } from './mock-search.service';

/**
 * Simplified module for testing NLP functionality
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Elasticsearch
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
      },
    }),

    // NLP Module
    NlpModule,
  ],
  providers: [
    // Provide mock search service
    {
      provide: 'SearchService',
      useClass: MockSearchService,
    },
  ],
  exports: ['SearchService'],
})
export class TestNlpModule {}
