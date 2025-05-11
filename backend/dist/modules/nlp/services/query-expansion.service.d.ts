import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
export declare class QueryExpansionService {
  private readonly configService;
  private readonly elasticsearchService;
  private readonly logger;
  private readonly wordnet;
  private readonly synonymSets;
  private readonly domainSpecificSynonyms;
  private readonly expansionEnabled;
  private readonly maxSynonymsPerTerm;
  private readonly maxExpansionTerms;
  constructor(configService: ConfigService, elasticsearchService: ElasticsearchService);
  expandQuery(
    query: string,
    tokens: string[],
  ): Promise<{
    expandedQuery: string;
    expandedTerms: string[];
    expansionSource: Record<string, string[]>;
  }>;
  private getWordNetSynonyms;
  private getElasticsearchRelatedTerms;
  private buildExpandedQuery;
  getExpansionInfo(
    query: string,
    tokens: string[],
  ): Promise<{
    originalQuery: string;
    expandedQuery: string;
    expansionTerms: string[];
    expansionSources: Record<string, string[]>;
  }>;
}
