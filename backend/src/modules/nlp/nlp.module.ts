import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchConfigModule } from '../search/elasticsearch/elasticsearch.module';
import { SearchModule } from '../search/search.module';
import { NlpService } from './services/nlp.service';
import { EnhancedNlpService } from './services/enhanced-nlp.service';
import { QueryExpansionService } from './services/query-expansion.service';
import { EntityRecognitionService } from './services/entity-recognition.service';
import { IntentDetectionService } from './services/intent-detection.service';
import { NaturalLanguageSearchService } from './services/natural-language-search.service';
import { NlpController } from './nlp.controller';
import { NlpResolver } from './nlp.resolver';

@Module({
  imports: [ConfigModule, ElasticsearchConfigModule, forwardRef(() => SearchModule)],
  controllers: [NlpController],
  providers: [
    NlpService,
    EnhancedNlpService,
    QueryExpansionService,
    EntityRecognitionService,
    IntentDetectionService,
    NaturalLanguageSearchService,
    NlpResolver,
  ],
  exports: [
    NlpService,
    EnhancedNlpService,
    QueryExpansionService,
    EntityRecognitionService,
    IntentDetectionService,
    NaturalLanguageSearchService,
  ],
})
export class NlpModule {}
