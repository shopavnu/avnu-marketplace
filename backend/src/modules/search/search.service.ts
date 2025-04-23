import { Injectable } from '@nestjs/common';
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

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly productsService: ProductsService,
    private readonly logger: LoggerService,
    private readonly searchRelevanceService: SearchRelevanceService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly abTestingService: ABTestingService,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly nlpService: NlpService,
    private readonly enhancedNlpService: EnhancedNlpService,
  ) {
    this.logger.setContext(SearchService.name);
  }

  /**
   * Search for products with advanced filtering and sorting
   */
  async searchProducts(
    query: string,
    paginationDto: PaginationDto,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    },
    sort?: { field: string; order: 'asc' | 'desc' },
    options?: {
      enableNlp?: boolean;
      enablePersonalization?: boolean;
      enableABTesting?: boolean;
      enableAnalytics?: boolean;
      personalizationStrength?: number;
      clientId?: string;
      user?: User;
    },
  ): Promise<{ items: Product[]; total: number; metadata?: any }> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const {
        enableNlp = false,
        enablePersonalization = false,
        enableABTesting = false,
        enableAnalytics = false,
        personalizationStrength = 1.0,
        clientId = this.googleAnalyticsService.generateClientId(),
        user = undefined,
      } = options || {};

      // Track search metadata
      const searchMetadata: any = {};
      const startTime = Date.now();

      // Process NLP if enabled
      let nlpData:
        | { intent: string; entities: Array<{ type: string; value: string; confidence: number }> }
        | undefined;
      if (enableNlp && query) {
        try {
          // Use the enhanced NLP service for better query understanding
          const nlpResult = await this.enhancedNlpService.processQuery(query);

          // Extract the primary intent from the NLP result
          const intent =
            typeof nlpResult.intent === 'string'
              ? nlpResult.intent
              : nlpResult.intent?.primary || 'general';

          // Extract entities from the NLP result
          const entities = Array.isArray(nlpResult.entities) ? nlpResult.entities : [];

          nlpData = {
            intent,
            entities: entities.map(e => ({
              type: e.type || 'unknown',
              value: e.value || '',
              confidence: e.confidence || 0.5,
            })),
          };

          searchMetadata.nlpProcessed = true;
          searchMetadata.intent = nlpData.intent;
          searchMetadata.entitiesDetected = nlpData.entities.length;
        } catch (nlpError) {
          this.logger.warn(`NLP processing failed: ${nlpError.message}`);
          searchMetadata.nlpProcessed = false;
        }
      }

      // Determine if we should use A/B testing
      let testInfo;
      let scoringProfile = 'standard';

      if (enableABTesting && user) {
        // Get the active test for search relevance
        testInfo = this.abTestingService.assignUserToVariant(
          'search-relevance-test-001',
          user.id,
          clientId,
        );

        if (testInfo) {
          scoringProfile = testInfo.algorithm;
          searchMetadata.abTest = {
            testId: testInfo.testId,
            variantId: testInfo.variantId,
            algorithm: testInfo.algorithm,
          };
        }
      }

      // Build the search query with filters
      const searchQuery = this.elasticsearchService.buildProductSearchQuery(
        query,
        filters,
        page,
        limit,
        sort,
      );

      // Apply search relevance enhancements
      let enhancedQuery = searchQuery;

      if (enableNlp && nlpData) {
        // Apply intent-based scoring if NLP data is available
        enhancedQuery = this.searchRelevanceService.applyScoringProfile(
          searchQuery,
          'intent',
          user,
          nlpData.intent,
          nlpData.entities,
        );
        searchMetadata.relevanceProfile = 'intent';
      } else if (enableABTesting && testInfo) {
        // Apply the selected scoring profile from A/B testing
        enhancedQuery = this.searchRelevanceService.applyScoringProfile(
          searchQuery,
          scoringProfile,
          user,
        );
        searchMetadata.relevanceProfile = scoringProfile;
      } else if (enablePersonalization && user) {
        // Apply user preference-based scoring
        const userPreferences = await this.userPreferenceService.getUserPreferences(user.id);
        if (userPreferences) {
          enhancedQuery = this.userPreferenceService.applyPreferencesToQuery(
            searchQuery,
            userPreferences,
            personalizationStrength,
          );
          searchMetadata.relevanceProfile = 'personalized';
          searchMetadata.personalizationStrength = personalizationStrength;
        }
      }

      // Execute the enhanced search query
      const result = await this.elasticsearchService.performSearch('products', enhancedQuery);

      // Convert Elasticsearch results to Product entities
      const productIds = result.items.map(item => item.id);

      // If no products found, return empty array
      if (productIds.length === 0) {
        return { items: [], total: 0 };
      }

      // Fetch actual Product entities from database
      const products = await this.productsService.findByIds(productIds);

      // Sort products to match the order from Elasticsearch
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean) as Product[];

      // Calculate search duration
      const endTime = Date.now();
      searchMetadata.searchDuration = endTime - startTime;

      // Track search in Google Analytics if enabled
      if (enableAnalytics) {
        try {
          await this.googleAnalyticsService.trackSearch(
            clientId,
            query,
            sortedProducts.length,
            testInfo,
            user?.id,
          );
        } catch (analyticsError) {
          this.logger.warn(`Failed to track search in analytics: ${analyticsError.message}`);
        }
      }

      return {
        items: sortedProducts,
        total: result.total,
        metadata: searchMetadata,
      };
    } catch (error) {
      this.logger.error(`Failed to search products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get product suggestions for autocomplete
   */
  async getProductSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      return this.elasticsearchService.getProductSuggestions(query, limit);
    } catch (error) {
      this.logger.error(`Failed to get product suggestions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get related products based on categories, tags, and values
   */
  async getRelatedProducts(productId: string, limit = 5): Promise<Product[]> {
    try {
      const result = await this.elasticsearchService.getRelatedProducts(productId, limit);

      // Convert Elasticsearch results to Product entities
      const productIds = result.map(item => item.id);

      // If no products found, return empty array
      if (productIds.length === 0) {
        return [];
      }

      // Fetch actual Product entities from database
      const products = await this.productsService.findByIds(productIds);

      // Sort products to match the order from Elasticsearch
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean) as Product[];

      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get related products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit = 10): Promise<Product[]> {
    try {
      const result = await this.elasticsearchService.getTrendingProducts(limit);

      // Convert Elasticsearch results to Product entities
      const productIds = result.map(item => item.id);

      // If no products found, return empty array
      if (productIds.length === 0) {
        return [];
      }

      // Fetch actual Product entities from database
      const products = await this.productsService.findByIds(productIds);

      // Sort products to match the order from Elasticsearch
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean) as Product[];

      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get discovery products with personalization
   */
  async getDiscoveryProducts(userId?: string, limit = 10, values?: string[]): Promise<Product[]> {
    try {
      const result = await this.elasticsearchService.getDiscoveryProducts(userId, limit, values);

      // Convert Elasticsearch results to Product entities
      const productIds = result.map(item => item.id);

      // If no products found, return empty array
      if (productIds.length === 0) {
        return [];
      }

      // Fetch actual Product entities from database
      const products = await this.productsService.findByIds(productIds);

      // Sort products to match the order from Elasticsearch
      const sortedProducts = productIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean) as Product[];

      return sortedProducts;
    } catch (error) {
      this.logger.error(`Failed to get discovery products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reindex all products
   */
  async reindexAllProducts(): Promise<void> {
    try {
      // Fetch all products from database
      const products = await this.productsService.findAllForIndexing();

      // Reindex all products
      await this.elasticsearchService.reindexAllProducts(products);

      this.logger.log(`Reindexed ${products.length} products`);
    } catch (error) {
      this.logger.error(`Failed to reindex all products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Index a single product
   */
  async indexProduct(product: Product): Promise<void> {
    try {
      await this.elasticsearchService.indexProduct(product);
    } catch (error) {
      this.logger.error(`Failed to index product: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a product in the index
   */
  async updateProduct(product: Product): Promise<void> {
    try {
      await this.elasticsearchService.updateProduct(product);
    } catch (error) {
      this.logger.error(`Failed to update product in index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a product from the index
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.elasticsearchService.deleteProduct(productId);
    } catch (error) {
      this.logger.error(`Failed to delete product from index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Natural language search for products
   * Enhanced with NLP capabilities for better relevance
   */
  async naturalLanguageSearch(
    query: string,
    paginationDto: PaginationDto,
    user?: User,
    clientId?: string,
  ): Promise<{ items: Product[]; total: number; metadata?: any }> {
    try {
      this.logger.log(`Performing natural language search for query: "${query}"`);

      // Process the query with enhanced NLP
      const nlpResult = await this.enhancedNlpService.processQuery(query);

      // Extract the primary intent
      const intent =
        typeof nlpResult.intent === 'string'
          ? nlpResult.intent
          : nlpResult.intent?.primary || 'general';

      // Extract entities
      const entities = Array.isArray(nlpResult.entities) ? nlpResult.entities : [];

      this.logger.log(`NLP processing complete. Intent: ${intent}, Entities: ${entities.length}`);

      // Extract filters from NLP entities
      const filters: any = {};

      // Map NLP entities to search filters
      for (const entity of entities) {
        switch (entity.type) {
          case 'category':
            if (!filters.categories) filters.categories = [];
            filters.categories.push(entity.value);
            break;
          case 'brand':
            filters.brandName = entity.value;
            break;
          case 'price':
            if (entity.value.includes('-')) {
              const [min, max] = entity.value.split('-').map(Number);
              filters.priceMin = min;
              filters.priceMax = max;
            }
            break;
          case 'value':
            if (!filters.values) filters.values = [];
            filters.values.push(entity.value);
            break;
        }
      }

      // Determine sort based on intent
      let sort;
      if (intent === 'recommendation') {
        sort = { field: 'rating', order: 'desc' };
      } else if (intent === 'sort' && query.includes('price')) {
        if (query.includes('high to low')) {
          sort = { field: 'price', order: 'desc' };
        } else {
          sort = { field: 'price', order: 'asc' };
        }
      }

      // Perform the search with NLP-enhanced parameters
      return this.searchProducts(query, paginationDto, filters, sort, {
        enableNlp: true,
        enablePersonalization: !!user,
        enableABTesting: !!user,
        enableAnalytics: true,
        clientId,
        user,
      });
    } catch (error) {
      this.logger.error(`Failed to perform natural language search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search across all entities (products, merchants, brands)
   */
  async searchAll(
    query: string,
    paginationDto: PaginationDto,
    user?: User,
    clientId?: string,
    options?: {
      enableNlp?: boolean;
      enablePersonalization?: boolean;
      enableABTesting?: boolean;
      enableAnalytics?: boolean;
    },
  ): Promise<{
    products: { items: Product[]; total: number };
    merchants: { items: any[]; total: number };
    brands: { items: any[]; total: number };
  }> {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      // Search products with relevance enhancements if options provided
      const productsPromise = this.searchProducts(query, { page, limit }, undefined, undefined, {
        enableNlp: options?.enableNlp ?? false,
        enablePersonalization: options?.enablePersonalization ?? false,
        enableABTesting: options?.enableABTesting ?? false,
        enableAnalytics: options?.enableAnalytics ?? false,
        user,
        clientId,
      });

      // Search merchants
      const merchantsPromise = this.elasticsearchService.searchMerchants(query, page, limit);

      // Search brands
      const brandsPromise = this.elasticsearchService.searchBrands(query, page, limit);

      // Wait for all searches to complete
      const [products, merchants, brands] = await Promise.all([
        productsPromise,
        merchantsPromise,
        brandsPromise,
      ]);

      return { products, merchants, brands };
    } catch (error) {
      this.logger.error(`Failed to search all entities: ${error.message}`);
      throw error;
    }
  }
}
