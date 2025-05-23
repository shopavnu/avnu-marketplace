import { NaturalLanguageSearchService } from './services/natural-language-search.service';
import { NlpService } from './services/nlp.service';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
declare class UserPreferencesInput {
    favoriteCategories?: string[];
    favoriteValues?: string[];
    priceSensitivity?: 'low' | 'medium' | 'high';
}
export declare class NlpResolver {
    private readonly naturalLanguageSearchService;
    private readonly nlpService;
    constructor(naturalLanguageSearchService: NaturalLanguageSearchService, nlpService: NlpService);
    searchProducts(query: string, paginationDto: PaginationDto): Promise<{
        items: Product[];
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
    getRecommendationsFromDescription(description: string, limit?: number): Promise<Product[]>;
    getPersonalizedSearchResults(query: string, userPreferences: UserPreferencesInput, paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
    }>;
    extractKeywords(text: string, maxKeywords?: number): {
        keywords: string[];
    };
    calculateSimilarity(text1: string, text2: string): {
        similarity: number;
    };
}
export {};
