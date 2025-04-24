import { Injectable, Logger } from '@nestjs/common';
import * as natural from 'natural';
import { ConfigService } from '@nestjs/config';
// Using require for modules without type declarations
// @ts-expect-error - No type definitions for stopwords-en
import stopwordsEn from 'stopwords-en';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.Stemmer;
  private tfidf: natural.TfIdf;
  private readonly minTokenLength: number;

  constructor(private readonly configService: ConfigService) {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.tfidf = new natural.TfIdf();
    this.minTokenLength = this.configService.get<number>('nlp.minTokenLength', 2);
  }

  /**
   * Process a natural language query to extract key terms and entities
   * @param query The natural language query
   */
  processQuery(query: string): {
    originalQuery: string;
    processedQuery: string;
    tokens: string[];
    stems: string[];
    entities: { type: string; value: string }[];
    intent: string;
    filters: Record<string, any>;
  } {
    try {
      // Tokenize the query
      const tokens = this.tokenizeAndClean(query);

      // Stem the tokens
      const stems = tokens.map(token => this.stemmer.stem(token));

      // Extract entities (categories, brands, price ranges, etc.)
      const entities = this.extractEntities(query, tokens);

      // Determine the intent (search, filter, sort, etc.)
      const intent = this.determineIntent(query, tokens);

      // Extract filters
      const filters = this.extractFilters(query, entities);

      // Build a processed query for search
      const processedQuery = this.buildProcessedQuery(tokens, entities);

      return {
        originalQuery: query,
        processedQuery,
        tokens,
        stems,
        entities,
        intent,
        filters,
      };
    } catch (error) {
      this.logger.error(`Failed to process query: ${error.message}`);
      return {
        originalQuery: query,
        processedQuery: query,
        tokens: [],
        stems: [],
        entities: [],
        intent: 'search',
        filters: {},
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
   * Extract entities from a query
   * @param query The original query
   * @param tokens The tokenized query
   */
  private extractEntities(query: string, tokens: string[]): { type: string; value: string }[] {
    const entities: { type: string; value: string }[] = [];

    // Extract price ranges
    const priceRangeRegex = /(\$\d+(?:\.\d+)?)\s*(?:to|-)\s*(\$\d+(?:\.\d+)?)/gi;
    const priceMatches = query.match(priceRangeRegex);

    if (priceMatches) {
      priceMatches.forEach(match => {
        const prices = match.match(/\$\d+(?:\.\d+)?/g);
        if (prices && prices.length === 2) {
          const minPrice = parseFloat(prices[0].substring(1));
          const maxPrice = parseFloat(prices[1].substring(1));

          entities.push({ type: 'priceRange', value: `${minPrice}-${maxPrice}` });
        }
      });
    }

    // Extract single price points
    const singlePriceRegex = /(?:under|less than|below|above|over|more than)\s*\$(\d+(?:\.\d+)?)/gi;
    const singlePriceMatches = [...query.matchAll(singlePriceRegex)];

    singlePriceMatches.forEach(match => {
      const price = parseFloat(match[1]);
      const modifier =
        match[0].toLowerCase().includes('under') ||
        match[0].toLowerCase().includes('less than') ||
        match[0].toLowerCase().includes('below')
          ? 'max'
          : 'min';

      entities.push({
        type: modifier === 'max' ? 'maxPrice' : 'minPrice',
        value: price.toString(),
      });
    });

    // Extract categories
    const categoryIndicators = ['category', 'categories', 'in', 'from', 'section'];
    const categoryMatches = this.findEntityAfterIndicator(query, tokens, categoryIndicators);

    categoryMatches.forEach(category => {
      entities.push({ type: 'category', value: category });
    });

    // Extract brands
    const brandIndicators = ['brand', 'by', 'from', 'made by'];
    const brandMatches = this.findEntityAfterIndicator(query, tokens, brandIndicators);

    brandMatches.forEach(brand => {
      entities.push({ type: 'brand', value: brand });
    });

    // Extract values (sustainability, ethical, etc.)
    const valueIndicators = [
      'sustainable',
      'ethical',
      'eco-friendly',
      'organic',
      'fair trade',
      'handmade',
    ];

    valueIndicators.forEach(value => {
      if (query.toLowerCase().includes(value.toLowerCase())) {
        entities.push({ type: 'value', value });
      }
    });

    return entities;
  }

  /**
   * Find entities that appear after indicator words
   * @param query The original query
   * @param tokens The tokenized query
   * @param indicators The indicator words
   */
  private findEntityAfterIndicator(
    query: string,
    tokens: string[],
    indicators: string[],
  ): string[] {
    const entities: string[] = [];
    const words = query.toLowerCase().split(/\s+/);

    indicators.forEach(indicator => {
      const index = words.findIndex(word => word === indicator);

      if (index !== -1 && index < words.length - 1) {
        // Take the next word as the entity
        entities.push(words[index + 1]);

        // Check if there's a multi-word entity
        if (index < words.length - 2 && !indicators.includes(words[index + 2])) {
          entities.push(`${words[index + 1]} ${words[index + 2]}`);
        }
      }
    });

    return entities;
  }

  /**
   * Determine the intent of a query
   * @param query The original query
   * @param tokens The tokenized query
   */
  private determineIntent(query: string, tokens: string[]): string {
    // Check for filter intent
    const filterIndicators = ['filter', 'show', 'find', 'where', 'with'];

    for (const indicator of filterIndicators) {
      if (tokens.includes(indicator)) {
        return 'filter';
      }
    }

    // Check for sort intent
    const sortIndicators = ['sort', 'order', 'arrange'];

    for (const indicator of sortIndicators) {
      if (tokens.includes(indicator)) {
        return 'sort';
      }
    }

    // Default to search intent
    return 'search';
  }

  /**
   * Extract filters from entities
   * @param query The original query
   * @param entities The extracted entities
   */
  private extractFilters(
    query: string,
    entities: { type: string; value: string }[],
  ): Record<string, any> {
    const filters: Record<string, any> = {};

    // Process entities into filters
    entities.forEach(entity => {
      switch (entity.type) {
        case 'priceRange':
          const [min, max] = entity.value.split('-').map(parseFloat);
          filters.priceMin = min;
          filters.priceMax = max;
          break;

        case 'minPrice':
          filters.priceMin = parseFloat(entity.value);
          break;

        case 'maxPrice':
          filters.priceMax = parseFloat(entity.value);
          break;

        case 'category':
          if (!filters.categories) {
            filters.categories = [];
          }
          filters.categories.push(entity.value);
          break;

        case 'brand':
          filters.brandName = entity.value;
          break;

        case 'value':
          if (!filters.values) {
            filters.values = [];
          }
          filters.values.push(entity.value);
          break;
      }
    });

    // Check for in-stock filter
    if (query.toLowerCase().includes('in stock') || query.toLowerCase().includes('available')) {
      filters.inStock = true;
    }

    return filters;
  }

  /**
   * Build a processed query for search
   * @param tokens The tokenized query
   * @param entities The extracted entities
   */
  private buildProcessedQuery(
    tokens: string[],
    entities: { type: string; value: string }[],
  ): string {
    // Remove entity values from tokens
    const entityValues = entities.map(entity => entity.value.toLowerCase());
    const filteredTokens = tokens.filter(token => !entityValues.includes(token));

    // Join tokens back into a query
    return filteredTokens.join(' ');
  }

  /**
   * Analyze text to find keywords
   * @param text The text to analyze
   * @param maxKeywords The maximum number of keywords to return
   */
  extractKeywords(text: string, maxKeywords = 5): string[] {
    try {
      // Create a new TF-IDF instance
      const tfidf = new natural.TfIdf();

      // Add the document
      tfidf.addDocument(text);

      // Get the top terms
      const terms: { term: string; tfidf: number }[] = [];

      tfidf.listTerms(0).forEach(item => {
        // Filter out stopwords and short terms
        if (!stopwordsEn.includes(item.term) && item.term.length > 2) {
          terms.push({ term: item.term, tfidf: item.tfidf });
        }
      });

      // Sort by TF-IDF score and take the top N
      return terms
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, maxKeywords)
        .map(item => item.term);
    } catch (error) {
      this.logger.error(`Failed to extract keywords: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate the similarity between two texts
   * @param text1 The first text
   * @param text2 The second text
   */
  calculateSimilarity(text1: string, text2: string): number {
    try {
      // Tokenize and stem both texts
      const tokens1 = this.tokenizeAndClean(text1).map(token => this.stemmer.stem(token));
      const tokens2 = this.tokenizeAndClean(text2).map(token => this.stemmer.stem(token));

      // Calculate Jaccard similarity
      const set1 = new Set(tokens1);
      const set2 = new Set(tokens2);

      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);

      return intersection.size / union.size;
    } catch (error) {
      this.logger.error(`Failed to calculate similarity: ${error.message}`);
      return 0;
    }
  }

  /**
   * Classify text into predefined categories
   * @param text The text to classify
   * @param categories The predefined categories with example texts
   */
  classifyText(text: string, categories: { name: string; examples: string[] }[]): string {
    try {
      // Calculate similarity with each category
      const similarities = categories.map(category => {
        // Calculate average similarity with all examples
        const avgSimilarity =
          category.examples.reduce((sum, example) => {
            return sum + this.calculateSimilarity(text, example);
          }, 0) / category.examples.length;

        return { category: category.name, similarity: avgSimilarity };
      });

      // Find the category with the highest similarity
      const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];

      return bestMatch.similarity > 0.1 ? bestMatch.category : 'unknown';
    } catch (error) {
      this.logger.error(`Failed to classify text: ${error.message}`);
      return 'unknown';
    }
  }

  /**
   * Generate embeddings for text using a simple bag-of-words approach
   * @param text The text to generate embeddings for
   */
  generateEmbeddings(text: string): number[] {
    try {
      // Create a new TF-IDF instance
      const tfidf = new natural.TfIdf();

      // Add the document
      tfidf.addDocument(text);

      // Get the terms and their scores
      const terms = tfidf.listTerms(0);

      // Create a simple embedding (just the TF-IDF scores)
      return terms.map(term => term.tfidf);
    } catch (error) {
      this.logger.error(`Failed to generate embeddings: ${error.message}`);
      return [];
    }
  }
}
