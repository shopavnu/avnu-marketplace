import { NaturalLanguageSearchService } from './services/natural-language-search.service';
import { NlpService } from './services/nlp.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NlpController {
  private readonly naturalLanguageSearchService;
  private readonly nlpService;
  constructor(naturalLanguageSearchService: NaturalLanguageSearchService, nlpService: NlpService);
  searchProducts(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: import('../products').Product[];
    total: number;
    enhancedQuery: string;
    detectedFilters: Record<string, any>;
  }>;
  analyzeQuery(query: string): {
    originalQuery: string;
    processedQuery: string;
    tokens: string[];
    stems: string[];
    entities: {
      type: string;
      value: string;
    }[];
    intent: string;
    filters: Record<string, any>;
  };
  generateSearchSuggestions(query: string, limit?: number): Promise<string[]>;
  classifySearchQuery(query: string): {
    category: string;
  };
  getRecommendationsFromDescription(body: {
    description: string;
    limit?: number;
  }): Promise<import('../products').Product[]>;
  getPersonalizedSearchResults(body: {
    query: string;
    userPreferences: {
      favoriteCategories?: string[];
      favoriteValues?: string[];
      priceSensitivity?: 'low' | 'medium' | 'high';
    };
    pagination?: PaginationDto;
  }): Promise<{
    items: import('../products').Product[];
    total: number;
  }>;
  extractKeywords(body: { text: string; maxKeywords?: number }): {
    keywords: string[];
  };
  calculateSimilarity(body: { text1: string; text2: string }): {
    similarity: number;
  };
}
