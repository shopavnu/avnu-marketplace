import { ElasticsearchService } from './services/elasticsearch.service';
import { ProductsService } from '@modules/products/products.service';
import { Product } from '@modules/products';
import { PaginationDto } from '@common/dto/pagination.dto';
import { LoggerService } from '@common/services/logger.service';
import { SearchRelevanceService } from './services/search-relevance.service';
import { UserPreferenceService } from './services/user-preference.service';
import { ABTestingService } from './services/ab-testing.service';
import { GoogleAnalyticsService } from '../analytics/services/google-analytics.service';
import { User } from '../users/entities/user.entity';
import { NlpService } from '../nlp/services/nlp.service';
import { EnhancedNlpService } from '../nlp/services/enhanced-nlp.service';
export declare class SearchService {
    private readonly elasticsearchService;
    private readonly productsService;
    private readonly logger;
    private readonly searchRelevanceService;
    private readonly userPreferenceService;
    private readonly abTestingService;
    private readonly googleAnalyticsService;
    private readonly nlpService;
    private readonly enhancedNlpService;
    constructor(elasticsearchService: ElasticsearchService, productsService: ProductsService, logger: LoggerService, searchRelevanceService: SearchRelevanceService, userPreferenceService: UserPreferenceService, abTestingService: ABTestingService, googleAnalyticsService: GoogleAnalyticsService, nlpService: NlpService, enhancedNlpService: EnhancedNlpService);
    searchProducts(query: string, paginationDto: PaginationDto, filters?: {
        categories?: string[];
        priceMin?: number;
        priceMax?: number;
        merchantId?: string;
        inStock?: boolean;
        values?: string[];
        brandName?: string;
    }, sort?: {
        field: string;
        order: 'asc' | 'desc';
    }, options?: {
        enableNlp?: boolean;
        enablePersonalization?: boolean;
        enableABTesting?: boolean;
        enableAnalytics?: boolean;
        personalizationStrength?: number;
        clientId?: string;
        user?: User;
    }): Promise<{
        items: Product[];
        total: number;
        metadata?: any;
    }>;
    getProductSuggestions(query: string, limit?: number): Promise<string[]>;
    getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
    getTrendingProducts(limit?: number): Promise<Product[]>;
    getDiscoveryProducts(userId?: string, limit?: number, values?: string[]): Promise<Product[]>;
    reindexAllProducts(): Promise<void>;
    indexProduct(product: Product): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    naturalLanguageSearch(query: string, paginationDto: PaginationDto, user?: User, clientId?: string): Promise<{
        items: Product[];
        total: number;
        metadata?: any;
    }>;
    searchAll(query: string, paginationDto: PaginationDto, user?: User, clientId?: string, options?: {
        enableNlp?: boolean;
        enablePersonalization?: boolean;
        enableABTesting?: boolean;
        enableAnalytics?: boolean;
    }): Promise<{
        products: {
            items: Product[];
            total: number;
        };
        merchants: {
            items: any[];
            total: number;
        };
        brands: {
            items: any[];
            total: number;
        };
    }>;
}
