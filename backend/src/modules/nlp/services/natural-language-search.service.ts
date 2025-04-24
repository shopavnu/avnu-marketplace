import { Injectable, Logger } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { SearchService } from '../../search/search.service';
import { Product } from '../../products/entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class NaturalLanguageSearchService {
  private readonly logger = new Logger(NaturalLanguageSearchService.name);

  constructor(
    private readonly nlpService: NlpService,
    private readonly searchService: SearchService,
  ) {}

  /**
   * Perform a natural language search for products
   * @param query The natural language query
   * @param paginationDto Pagination parameters
   */
  async searchProducts(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Product[];
    total: number;
    enhancedQuery: string;
    detectedFilters: Record<string, any>;
  }> {
    try {
      // Process the query using NLP
      const processedQuery = this.nlpService.processQuery(query);

      this.logger.log(`Processed query: ${JSON.stringify(processedQuery)}`);

      // Perform search with processed query and extracted filters
      const searchResults = await this.searchService.searchProducts(
        processedQuery.processedQuery,
        paginationDto,
        processedQuery.filters,
      );

      return {
        ...searchResults,
        enhancedQuery: processedQuery.processedQuery,
        detectedFilters: processedQuery.filters,
      };
    } catch (error) {
      this.logger.error(`Failed to perform natural language search: ${error.message}`);

      // Fallback to regular search
      const searchResults = await this.searchService.searchProducts(query, paginationDto);

      return {
        ...searchResults,
        enhancedQuery: query,
        detectedFilters: {},
      };
    }
  }

  /**
   * Get product recommendations based on a natural language description
   * @param description The natural language description
   * @param limit The maximum number of recommendations to return
   */
  async getRecommendationsFromDescription(description: string, limit = 10): Promise<Product[]> {
    try {
      // Extract keywords from the description
      const keywords = this.nlpService.extractKeywords(description, 5);

      this.logger.log(`Extracted keywords: ${keywords.join(', ')}`);

      // Use the keywords to search for products
      const searchResults = await this.searchService.searchProducts(keywords.join(' '), {
        page: 1,
        limit,
      });

      return searchResults.items;
    } catch (error) {
      this.logger.error(`Failed to get recommendations from description: ${error.message}`);
      return [];
    }
  }

  /**
   * Classify a product search query into predefined categories
   * @param query The search query
   */
  classifySearchQuery(query: string): string {
    try {
      // Define categories with example queries
      const categories = [
        {
          name: 'specific_product',
          examples: [
            'black leather jacket',
            'red dress size medium',
            'wireless headphones',
            'organic cotton t-shirt',
          ],
        },
        {
          name: 'category_browse',
          examples: [
            "women's dresses",
            'kitchen appliances',
            'outdoor furniture',
            'sustainable clothing',
          ],
        },
        {
          name: 'price_sensitive',
          examples: [
            'affordable shoes under $50',
            'budget friendly gifts',
            'cheap laptops',
            'best value smartphones',
          ],
        },
        {
          name: 'brand_specific',
          examples: ['nike running shoes', 'apple iphone', "levi's jeans", 'patagonia jackets'],
        },
        {
          name: 'value_driven',
          examples: [
            'sustainable fashion brands',
            'eco-friendly cleaning products',
            'fair trade coffee',
            'ethical jewelry',
          ],
        },
      ];

      // Classify the query
      return this.nlpService.classifyText(query, categories);
    } catch (error) {
      this.logger.error(`Failed to classify search query: ${error.message}`);
      return 'unknown';
    }
  }

  /**
   * Get personalized search results based on user preferences and query
   * @param query The search query
   * @param userPreferences The user's preferences
   * @param paginationDto Pagination parameters
   */
  async getPersonalizedSearchResults(
    query: string,
    userPreferences: {
      favoriteCategories?: string[];
      favoriteValues?: string[];
      priceSensitivity?: 'low' | 'medium' | 'high';
    },
    paginationDto: PaginationDto,
  ): Promise<{ items: Product[]; total: number }> {
    try {
      // Process the query using NLP
      const processedQuery = this.nlpService.processQuery(query);

      // Merge user preferences with detected filters
      const mergedFilters = { ...processedQuery.filters };

      // Add user's favorite categories if no categories were detected
      if (!mergedFilters.categories && userPreferences.favoriteCategories?.length) {
        mergedFilters.categories = userPreferences.favoriteCategories;
      }

      // Add user's favorite values if no values were detected
      if (!mergedFilters.values && userPreferences.favoriteValues?.length) {
        mergedFilters.values = userPreferences.favoriteValues;
      }

      // Adjust price range based on user's price sensitivity
      if (userPreferences.priceSensitivity && !mergedFilters.priceMin && !mergedFilters.priceMax) {
        switch (userPreferences.priceSensitivity) {
          case 'low':
            mergedFilters.priceMax = 50;
            break;
          case 'medium':
            mergedFilters.priceMin = 50;
            mergedFilters.priceMax = 150;
            break;
          case 'high':
            mergedFilters.priceMin = 150;
            break;
        }
      }

      // Perform search with processed query and merged filters
      return this.searchService.searchProducts(
        processedQuery.processedQuery,
        paginationDto,
        mergedFilters,
      );
    } catch (error) {
      this.logger.error(`Failed to get personalized search results: ${error.message}`);

      // Fallback to regular search
      return this.searchService.searchProducts(query, paginationDto);
    }
  }

  /**
   * Generate search suggestions based on a partial query
   * @param partialQuery The partial query
   * @param limit The maximum number of suggestions to return
   */
  async generateSearchSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    try {
      // Get basic suggestions from Elasticsearch
      const basicSuggestions = await this.searchService.getProductSuggestions(partialQuery, limit);

      // Process the partial query using NLP
      const processedQuery = this.nlpService.processQuery(partialQuery);

      // If we have detected entities, generate enhanced suggestions
      if (processedQuery.entities.length > 0) {
        const enhancedSuggestions = this.generateEnhancedSuggestions(
          processedQuery.tokens,
          processedQuery.entities,
          limit,
        );

        // Combine and deduplicate suggestions
        return [...new Set([...enhancedSuggestions, ...basicSuggestions])].slice(0, limit);
      }

      return basicSuggestions;
    } catch (error) {
      this.logger.error(`Failed to generate search suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate enhanced search suggestions based on tokens and entities
   * @param tokens The query tokens
   * @param entities The detected entities
   * @param limit The maximum number of suggestions to return
   */
  private generateEnhancedSuggestions(
    tokens: string[],
    entities: { type: string; value: string }[],
    limit = 5,
  ): string[] {
    const suggestions: string[] = [];

    // Generate suggestions based on entity types
    const categoryEntities = entities.filter(entity => entity.type === 'category');
    const brandEntities = entities.filter(entity => entity.type === 'brand');
    const valueEntities = entities.filter(entity => entity.type === 'value');

    // Combine tokens with entities to form suggestions
    if (categoryEntities.length > 0) {
      suggestions.push(`${tokens.join(' ')} in ${categoryEntities[0].value}`);
    }

    if (brandEntities.length > 0) {
      suggestions.push(`${tokens.join(' ')} by ${brandEntities[0].value}`);
    }

    if (valueEntities.length > 0) {
      suggestions.push(`${valueEntities[0].value} ${tokens.join(' ')}`);
    }

    // Add price-based suggestions
    suggestions.push(`${tokens.join(' ')} under $50`);
    suggestions.push(`${tokens.join(' ')} under $100`);

    return suggestions.slice(0, limit);
  }
}
