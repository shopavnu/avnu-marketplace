import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as natural from 'natural';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class QueryExpansionService {
  private readonly logger = new Logger(QueryExpansionService.name);
  private readonly wordnet: any;
  private readonly synonymSets: Map<string, string[]>;
  private readonly domainSpecificSynonyms: Record<string, string[]>;
  private readonly expansionEnabled: boolean;
  private readonly maxSynonymsPerTerm: number;
  private readonly maxExpansionTerms: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    // Initialize WordNet
    this.wordnet = new natural.WordNet();

    // Initialize synonym sets
    this.synonymSets = new Map<string, string[]>();

    // Load domain-specific synonyms
    this.domainSpecificSynonyms = {
      // Fashion/Clothing
      shirt: ['tee', 't-shirt', 'top', 'blouse'],
      pants: ['trousers', 'jeans', 'slacks', 'leggings'],
      shoes: ['footwear', 'sneakers', 'boots', 'sandals'],
      dress: ['gown', 'frock', 'outfit'],
      jacket: ['coat', 'blazer', 'outerwear'],
      sustainable: ['eco-friendly', 'green', 'ethical', 'environmentally friendly'],
      organic: ['natural', 'chemical-free', 'pesticide-free'],
      vegan: ['plant-based', 'cruelty-free', 'animal-free'],
      handmade: ['artisanal', 'handcrafted', 'custom-made'],
      'fair trade': ['ethically sourced', 'ethical trade', 'fair price'],
      recycled: ['upcycled', 'repurposed', 'reclaimed'],
      local: ['community-made', 'locally sourced', 'locally made'],
      'small batch': ['limited edition', 'artisanal', 'handcrafted'],
      affordable: ['budget', 'inexpensive', 'economical', 'cheap'],
      premium: ['luxury', 'high-end', 'designer', 'exclusive'],
      sale: ['discount', 'clearance', 'reduced', 'deal'],
      new: ['latest', 'fresh', 'just in', 'new arrival'],
      popular: ['trending', 'bestselling', 'hot', 'in demand'],
    };

    // Configuration
    this.expansionEnabled = this.configService.get<boolean>('nlp.enableQueryExpansion', true);
    this.maxSynonymsPerTerm = this.configService.get<number>('nlp.maxSynonymsPerTerm', 3);
    this.maxExpansionTerms = this.configService.get<number>('nlp.maxExpansionTerms', 5);
  }

  /**
   * Expand a query with synonyms and related terms
   * @param query The original query
   * @param tokens The tokenized query
   */
  async expandQuery(
    query: string,
    tokens: string[],
  ): Promise<{
    expandedQuery: string;
    expandedTerms: string[];
    expansionSource: Record<string, string[]>;
  }> {
    if (!this.expansionEnabled || tokens.length === 0) {
      return {
        expandedQuery: query,
        expandedTerms: [],
        expansionSource: {},
      };
    }

    try {
      const expansionSource: Record<string, string[]> = {};
      let expandedTerms: string[] = [];

      // 1. Domain-specific synonyms (highest priority)
      for (const token of tokens) {
        if (this.domainSpecificSynonyms[token.toLowerCase()]) {
          const synonyms = this.domainSpecificSynonyms[token.toLowerCase()].slice(
            0,
            this.maxSynonymsPerTerm,
          );
          expansionSource[token] = [...(expansionSource[token] || []), ...synonyms];
          expandedTerms = [...expandedTerms, ...synonyms];
        }
      }

      // 2. WordNet synonyms
      const wordnetSynonyms = await this.getWordNetSynonyms(tokens);
      for (const token in wordnetSynonyms) {
        expansionSource[token] = [...(expansionSource[token] || []), ...wordnetSynonyms[token]];
        expandedTerms = [...expandedTerms, ...wordnetSynonyms[token]];
      }

      // 3. Elasticsearch related terms (if available)
      const elasticsearchTerms = await this.getElasticsearchRelatedTerms(query);
      if (elasticsearchTerms.length > 0) {
        expansionSource['elasticsearch'] = elasticsearchTerms;
        expandedTerms = [...expandedTerms, ...elasticsearchTerms];
      }

      // Deduplicate and limit
      expandedTerms = [...new Set(expandedTerms)].slice(0, this.maxExpansionTerms);

      // Build expanded query
      const expandedQuery = this.buildExpandedQuery(query, expandedTerms);

      return {
        expandedQuery,
        expandedTerms,
        expansionSource,
      };
    } catch (error) {
      this.logger.error(`Failed to expand query: ${error.message}`);
      return {
        expandedQuery: query,
        expandedTerms: [],
        expansionSource: {},
      };
    }
  }

  /**
   * Get synonyms from WordNet
   * @param tokens The tokens to get synonyms for
   */
  private getWordNetSynonyms(tokens: string[]): Promise<Record<string, string[]>> {
    return new Promise(resolve => {
      const synonyms: Record<string, string[]> = {};
      let pendingRequests = tokens.length;

      if (pendingRequests === 0) {
        resolve(synonyms);
        return;
      }

      for (const token of tokens) {
        // Check if we already have synonyms for this token
        if (this.synonymSets.has(token)) {
          synonyms[token] = this.synonymSets.get(token)!.slice(0, this.maxSynonymsPerTerm);
          pendingRequests--;

          if (pendingRequests === 0) {
            resolve(synonyms);
          }
          continue;
        }

        // Look up synonyms in WordNet
        this.wordnet.lookup(token, (results: any[]) => {
          const tokenSynonyms = new Set<string>();

          for (const result of results) {
            if (result.synonyms) {
              for (const synonym of result.synonyms) {
                // Filter out multi-word synonyms and the original token
                if (synonym !== token && !synonym.includes('_')) {
                  tokenSynonyms.add(synonym);
                }
              }
            }
          }

          const tokenSynonymsArray = Array.from(tokenSynonyms).slice(0, this.maxSynonymsPerTerm);
          this.synonymSets.set(token, tokenSynonymsArray);
          synonyms[token] = tokenSynonymsArray;

          pendingRequests--;
          if (pendingRequests === 0) {
            resolve(synonyms);
          }
        });
      }
    });
  }

  /**
   * Get related terms from Elasticsearch
   * @param query The original query
   */
  private async getElasticsearchRelatedTerms(query: string): Promise<string[]> {
    try {
      // Use Elasticsearch's More Like This query to find related terms
      const response = await this.elasticsearchService.search({
        index: 'products',
        size: 0,
        query: {
          match: {
            description: query,
          },
        },
        aggs: {
          significant_terms: {
            significant_terms: {
              field: 'description',
              size: this.maxExpansionTerms,
            },
          },
        },
      });

      // Extract terms from the response
      // Handle Elasticsearch 8.x response format (response is the direct result)
      // and 7.x format (response has a body property)
      // Check if response has aggregations directly or needs to be accessed differently
      let aggregations;

      // TypeScript-safe way to check for properties
      if ('aggregations' in response && response.aggregations) {
        // Elasticsearch 8.x format
        aggregations = response.aggregations;
      } else {
        // For older Elasticsearch versions or different response formats
        // Use type assertion to avoid TypeScript errors
        const anyResponse = response as any;
        aggregations = anyResponse.body?.aggregations;
      }

      const buckets = aggregations?.significant_terms?.buckets || [];
      return buckets.map((bucket: any) => bucket.key).slice(0, this.maxExpansionTerms);
    } catch (error) {
      this.logger.error(`Failed to get Elasticsearch related terms: ${error.message}`);
      return [];
    }
  }

  /**
   * Build an expanded query with original query and expansion terms
   * @param originalQuery The original query
   * @param expansionTerms The expansion terms
   */
  private buildExpandedQuery(originalQuery: string, expansionTerms: string[]): string {
    if (expansionTerms.length === 0) {
      return originalQuery;
    }

    // Build Elasticsearch-style expanded query
    // Original query gets higher boost, expansion terms get lower boost
    return `${originalQuery} ${expansionTerms.join(' ')}`;
  }

  /**
   * Get expansion information for debugging and analytics
   * @param query The original query
   * @param tokens The tokenized query
   */
  async getExpansionInfo(
    query: string,
    tokens: string[],
  ): Promise<{
    originalQuery: string;
    expandedQuery: string;
    expansionTerms: string[];
    expansionSources: Record<string, string[]>;
  }> {
    const expansion = await this.expandQuery(query, tokens);

    return {
      originalQuery: query,
      expandedQuery: expansion.expandedQuery,
      expansionTerms: expansion.expandedTerms,
      expansionSources: expansion.expansionSource,
    };
  }
}
