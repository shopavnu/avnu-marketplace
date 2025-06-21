import { Global, Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

/**
 * ExternalMocksModule provides no-op mocks for external providers that are
 * disabled during e2e/CI runs. Marked as @Global so the mocked providers are
 * visible across the entire Nest dependency graph without needing explicit
 * exports/imports in each feature module.
 */
@Global()
@Module({
  providers: [
    {
      provide: ElasticsearchService,
      useValue: {},
    },
  ],
  exports: [ElasticsearchService],
})
export class ExternalMocksModule {}
