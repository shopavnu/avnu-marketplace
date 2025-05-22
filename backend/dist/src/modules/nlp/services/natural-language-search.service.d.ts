import { NlpService } from './nlp.service';
import { SearchService } from '../../search/search.service';
import { Product } from '../../products/entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class NaturalLanguageSearchService {
  private readonly nlpService;
  private readonly searchService;
  private readonly logger;
  constructor(nlpService: NlpService, searchService: SearchService);
  searchProducts(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Product[];
    total: number;
    enhancedQuery: string;
    detectedFilters: Record<string, any>;
  }>;
  getRecommendationsFromDescription(description: string, limit?: number): Promise<Product[]>;
  classifySearchQuery(query: string): string;
  getPersonalizedSearchResults(
    query: string,
    userPreferences: {
      favoriteCategories?: string[];
      favoriteValues?: string[];
      priceSensitivity?: 'low' | 'medium' | 'high';
    },
    paginationDto: PaginationDto,
  ): Promise<{
    items: Product[];
    total: number;
  }>;
  generateSearchSuggestions(partialQuery: string, limit?: number): Promise<string[]>;
  private generateEnhancedSuggestions;
}
