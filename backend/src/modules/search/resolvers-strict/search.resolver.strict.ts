// @ts-strict-mode: enabled
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { SearchOptions, SortOrder } from '../dto/search-options.dto';
import { Logger } from '@nestjs/common';
import {
  SearchResponseType,
  ProductResultType,
  MerchantResultType,
  BrandResultType,
  PaginationType,
  FacetType as _FacetType,
} from '../graphql/search-response.type';
import { Product } from '../../products/entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Category as _Category } from '../../categories/entities/category.entity';

/**
 * Search resolver for GraphQL with strict typing
 */
@Resolver()
export class SearchResolverStrict {
  private readonly logger = new Logger(SearchResolverStrict.name);

  constructor(private readonly searchService: ElasticsearchService) {}

  /**
   * Search query for all entities
   * @param query Search query string
   * @param options Search options
   * @returns Search response with typed entities
   */
  @Query(() => SearchResponseType)
  async search(
    @Args('query') query: string,
    @Args('options', { nullable: true }) options?: SearchOptions,
  ): Promise<SearchResponseType> {
    this.logger.log(`GraphQL Search query: ${query}, options: ${JSON.stringify(options)}`);

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const serviceFilters: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    } = {};

    if (options?.filters) {
      for (const filter of options.filters) {
        if (filter.field === 'categories' && filter.values) {
          serviceFilters.categories = filter.values;
        } else if (filter.field === 'merchantId' && filter.values && filter.values.length > 0) {
          serviceFilters.merchantId = filter.values[0];
        } else if (filter.field === 'inStock' && filter.values && filter.values.length > 0) {
          serviceFilters.inStock = filter.values[0].toLowerCase() === 'true';
        } else if (filter.field === 'brandName' && filter.values && filter.values.length > 0) {
          serviceFilters.brandName = filter.values[0];
        } else if (filter.field === 'values' && filter.values) {
          // Generic values filter
          serviceFilters.values = filter.values;
        }
      }
    }

    if (options?.rangeFilters) {
      for (const rangeFilter of options.rangeFilters) {
        if (rangeFilter.field === 'price') {
          if (typeof rangeFilter.min === 'number') serviceFilters.priceMin = rangeFilter.min;
          if (typeof rangeFilter.max === 'number') serviceFilters.priceMax = rangeFilter.max;
        }
      }
    }

    let serviceSort: { field: string; order: 'asc' | 'desc' } | undefined = undefined;
    if (options?.sort && options.sort.length > 0) {
      const sortOption = options.sort[0];
      serviceSort = {
        field: sortOption.field,
        order: sortOption.order || SortOrder.DESC, // Default to DESC if not provided
      };
    }

    const { items, total } = await this.searchService.searchProducts(
      query,
      serviceFilters,
      page,
      limit,
      serviceSort,
    );

    const response = new SearchResponseType();
    response.query = query;

    response.pagination = new PaginationType();
    response.pagination.page = page;
    response.pagination.limit = limit;
    response.pagination.total = total;
    response.pagination.totalPages = Math.ceil(total / limit);

    // Assuming 'items' are Product entities and need mapping to ProductResultType
    // The mapping function mapProductsToProductType will be renamed and updated in a subsequent step
    const productEntities = items as Product[];
    response.results = this.mapProductsToResultType(productEntities);

    // Placeholders for fields not directly provided by searchProducts
    response.facets = []; // TODO: Populate facets if/when available from searchProducts or another service
    response.highlightsEnabled = false;
    // Other SearchResponseType fields (relevanceScores, entityDistribution, etc.) will use their default values or be undefined

    return response;
  }

  /**
   * Search suggestions query
   * @param prefix Text prefix to get suggestions for
   * @param limit Maximum number of suggestions
   * @returns Array of suggestion strings
   */
  @Query(() => [String])
  async searchSuggestions(
    @Args('prefix') prefix: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<string[]> {
    this.logger.log(`GraphQL SearchSuggestions query: ${prefix}`);
    return this.searchService.getProductSuggestions(prefix, limit);
  }

  /**
   * Map database Product entities to GraphQL ProductType objects
   * @param products The product entities
   * @returns Mapped product types
   */
  private mapProductsToResultType(products: Product[]): ProductResultType[] {
    return products.map(product => {
      const productResult = new ProductResultType();
      productResult.id = String(product.id);
      productResult.title = product.title || ''; // Use title instead of name
      productResult.description = product.description || '';
      productResult.price = product.price || 0;
      productResult.inStock = product.inStock; // Directly use inStock boolean from entity
      productResult.merchantId = product.merchantId ? String(product.merchantId) : undefined;
      productResult.brandName = product.brandName || undefined;

      // product.categories is string[] in entity, ProductResultType.categories is string[]
      productResult.categories = Array.isArray(product.categories) ? product.categories : [];
      productResult.tags = Array.isArray(product.tags) ? product.tags : [];
      productResult.images = Array.isArray(product.images) ? product.images : [];
      productResult.thumbnailImage = product.thumbnail || undefined;

      // Other ProductResultType fields can be mapped here if data is available in Product entity
      // productResult.highlights = undefined;
      // productResult.salePrice = undefined;
      // productResult.onSale = product.isOnSale; // If using getter from entity
      // productResult.rating = undefined;
      // productResult.reviewCount = undefined;
      // productResult.values = product.values || [];
      // productResult.brandId = undefined; // If brandInfo is an object with id
      // productResult.merchantName = undefined;
      // productResult.colors = undefined;
      // productResult.sizes = undefined;
      // productResult.materials = undefined;
      // productResult.relevanceScore = undefined;
      // productResult.sponsored = undefined;

      return productResult;
    });
  }

  /**
   * Map database Merchant entities to GraphQL MerchantType objects
   * @param merchants The merchant entities
   * @returns Mapped merchant types
   */
  private mapMerchantsToResultType(merchants: Merchant[]): MerchantResultType[] {
    return merchants.map(merchant => {
      const merchantResult = new MerchantResultType();
      merchantResult.id = String(merchant.id);
      merchantResult.name = merchant.name || '';
      merchantResult.description = merchant.description || '';
      merchantResult.logo = (merchant as any).logo || undefined; // Assuming 'logo' exists on Merchant entity
      // merchantResult.coverImage = undefined;
      // merchantResult.images = [];
      // merchantResult.categories = [];
      // merchantResult.values = [];
      // merchantResult.location = undefined;
      // merchantResult.rating = undefined;
      // merchantResult.reviewCount = undefined;
      // merchantResult.verified = undefined;
      merchantResult.active = (merchant as any).isActive ?? true;
      // merchantResult.productCount = undefined;
      // merchantResult.relevanceScore = undefined;
      // merchantResult.sponsored = undefined;
      // merchantResult.highlights = undefined;
      return merchantResult;
    });
  }

  /**
   * Map database Brand entities to GraphQL BrandResultType objects
   * @param brands The brand entities
   * @returns Mapped brand types
   */
  private mapBrandsToResultType(brands: any[]): BrandResultType[] {
    return brands.map(brand => {
      const brandResult = new BrandResultType();
      brandResult.id = String(brand.id);
      brandResult.name = brand.name || '';
      return brandResult;
    });
  }
}
