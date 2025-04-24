import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as natural from 'natural';
// Using require for modules without type definitions
// @ts-expect-error - No type definitions for stopwords-en
import stopwordsEn from 'stopwords-en';
import { QueryExpansionService } from './query-expansion.service';
import { EntityRecognitionService } from './entity-recognition.service';
import { IntentDetectionService } from './intent-detection.service';

@Injectable()
export class EnhancedNlpService {
  private readonly logger = new Logger(EnhancedNlpService.name);
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.Stemmer;
  private readonly minTokenLength: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly queryExpansionService: QueryExpansionService,
    private readonly entityRecognitionService: EntityRecognitionService,
    private readonly intentDetectionService: IntentDetectionService,
  ) {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.minTokenLength = this.configService.get<number>('nlp.minTokenLength', 2);
  }

  /**
   * Process a natural language query to extract key terms, entities, and intent
   * @param query The natural language query
   */
  async processQuery(query: string): Promise<{
    originalQuery: string;
    processedQuery: string;
    expandedQuery: string;
    tokens: string[];
    stems: string[];
    entities: { type: string; value: string; confidence: number }[];
    intent: {
      primary: string;
      confidence: number;
      secondary: { intent: string; confidence: number }[];
    };
    expansionTerms: string[];
    searchParameters: {
      boost: Record<string, number>;
      sort: { field: string; order: 'asc' | 'desc' }[];
      filters: Record<string, any>;
    };
  }> {
    try {
      // Tokenize the query
      const tokens = this.tokenizeAndClean(query);

      // Stem the tokens
      const stems = tokens.map(token => this.stemmer.stem(token));

      // Extract entities
      const entityResult = this.entityRecognitionService.extractEntities(query, tokens);
      const entities = entityResult.entities;

      // Detect intent
      const intentResult = this.intentDetectionService.detectIntent(query, tokens);
      const intent = {
        primary: intentResult.intent,
        confidence: intentResult.confidence,
        secondary: intentResult.subIntents,
      };

      // Expand query with synonyms and related terms
      const expansionResult = await this.queryExpansionService.expandQuery(query, tokens);
      const expandedQuery = expansionResult.expandedQuery;
      const expansionTerms = expansionResult.expandedTerms;

      // Get search parameters based on intent and entities
      const searchParameters = this.intentDetectionService.getSearchParameters(
        intentResult.intent,
        entities,
      );

      // Build a processed query
      const processedQuery = this.buildProcessedQuery(query, tokens, entities);

      return {
        originalQuery: query,
        processedQuery,
        expandedQuery,
        tokens,
        stems,
        entities,
        intent,
        expansionTerms,
        searchParameters,
      };
    } catch (error) {
      this.logger.error(`Failed to process query: ${error.message}`);
      return {
        originalQuery: query,
        processedQuery: query,
        expandedQuery: query,
        tokens: [],
        stems: [],
        entities: [],
        intent: {
          primary: 'product_search',
          confidence: 0.5,
          secondary: [],
        },
        expansionTerms: [],
        searchParameters: {
          boost: {},
          sort: [],
          filters: {},
        },
      };
    }
  }

  /**
   * Tokenize and clean a query
   * @param query The query to tokenize
   */
  private tokenizeAndClean(query: string): string[] {
    // Tokenize
    const tokens = this.tokenizer.tokenize(query.toLowerCase());

    // Remove stopwords
    return tokens.filter(
      token =>
        !stopwordsEn.includes(token) && token.length > this.minTokenLength && !/^\d+$/.test(token),
    );
  }

  /**
   * Build a processed query for search
   * @param originalQuery The original query
   * @param tokens The tokenized query
   * @param entities The extracted entities
   */
  private buildProcessedQuery(
    originalQuery: string,
    tokens: string[],
    entities: { type: string; value: string; confidence: number }[],
  ): string {
    // For simple cases, just return the original query
    if (entities.length === 0) {
      return originalQuery;
    }

    // Remove entity values from tokens to focus on the main search terms
    const entityValues = entities.map(entity => entity.value.toLowerCase());
    const filteredTokens = tokens.filter(token => !entityValues.includes(token));

    // If we have filtered tokens, use them as the processed query
    if (filteredTokens.length > 0) {
      return filteredTokens.join(' ');
    }

    // If we've filtered out all tokens, return the original query
    return originalQuery;
  }

  /**
   * Get detailed analysis of a query for debugging and analytics
   * @param query The query to analyze
   */
  async analyzeQuery(query: string): Promise<{
    originalQuery: string;
    tokens: string[];
    stems: string[];
    entities: { type: string; value: string; confidence: number }[];
    intent: {
      primary: string;
      confidence: number;
      secondary: { intent: string; confidence: number }[];
    };
    expansion: {
      expandedQuery: string;
      expansionTerms: string[];
      expansionSources: Record<string, string[]>;
    };
    searchParameters: {
      boost: Record<string, number>;
      sort: { field: string; order: 'asc' | 'desc' }[];
      filters: Record<string, any>;
    };
  }> {
    try {
      // Tokenize the query
      const tokens = this.tokenizeAndClean(query);

      // Stem the tokens
      const stems = tokens.map(token => this.stemmer.stem(token));

      // Extract entities
      const entityResult = this.entityRecognitionService.extractEntities(query, tokens);
      const entities = entityResult.entities;

      // Detect intent
      const intentResult = this.intentDetectionService.detectIntent(query, tokens);
      const intent = {
        primary: intentResult.intent,
        confidence: intentResult.confidence,
        secondary: intentResult.subIntents,
      };

      // Get expansion info
      const expansionInfo = await this.queryExpansionService.getExpansionInfo(query, tokens);

      // Get search parameters
      const searchParameters = this.intentDetectionService.getSearchParameters(
        intentResult.intent,
        entities,
      );

      return {
        originalQuery: query,
        tokens,
        stems,
        entities,
        intent,
        expansion: {
          expandedQuery: expansionInfo.expandedQuery,
          expansionTerms: expansionInfo.expansionTerms,
          expansionSources: expansionInfo.expansionSources,
        },
        searchParameters,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze query: ${error.message}`);
      return {
        originalQuery: query,
        tokens: [],
        stems: [],
        entities: [],
        intent: {
          primary: 'product_search',
          confidence: 0.5,
          secondary: [],
        },
        expansion: {
          expandedQuery: query,
          expansionTerms: [],
          expansionSources: {},
        },
        searchParameters: {
          boost: {},
          sort: [],
          filters: {},
        },
      };
    }
  }
}
