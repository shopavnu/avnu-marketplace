// @ts-strict-mode: enabled
import { Args, Query, Resolver } from '@nestjs/graphql';
import { SearchService } from '../services/search.service.fixed.v4';
import { SearchResponseType } from '../types/search-response.type';
import { SearchOptions } from '../dto/search-options.dto';
import { Logger } from '@nestjs/common';
import { ProductType } from '../../products/types/product.type';
import { MerchantType } from '../../merchants/types/merchant.type';
import { CategoryType } from '../../categories/types/category.type';
import { Product } from '../../products/entities/product.entity.fixed';
import { Merchant } from '../../merchants/entities/merchant.entity.fixed';
import { Category } from '../../categories/entities/category.entity.fixed';

/**
 * Search resolver for GraphQL with strict typing
 */
@Resolver()
export class SearchResolverStrict {
  private readonly logger = new Logger(SearchResolverStrict.name);

  constructor(private readonly searchService: SearchService) {}

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
    this.logger.log(`GraphQL Search query: ${query}`);
    const result = await this.searchService.search(query, options || {});

    // Create proper mappings from entity types to GraphQL types
    const response = new SearchResponseType();
    response.query = result.query;
    response.totalHits = result.totalHits;
    response.took = result.took;

    // First convert any search results to their appropriate entity types,
    // then use our mapping methods to transform them into GraphQL types
    const productEntities = result.products ? (result.products as unknown as Product[]) : [];
    const merchantEntities = result.merchants ? (result.merchants as unknown as Merchant[]) : [];
    const categoryEntities = result.categories ? (result.categories as unknown as Category[]) : [];

    response.products = this.mapProductsToProductType(productEntities);
    response.merchants = this.mapMerchantsToMerchantType(merchantEntities);
    response.categories = this.mapCategoriesToCategoryType(categoryEntities);
    response.facets = result.facets || {};

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
    return this.searchService.getSuggestions(prefix, limit);
  }

  /**
   * Map database Product entities to GraphQL ProductType objects
   * @param products The product entities
   * @returns Mapped product types
   */
  private mapProductsToProductType(products: Product[]): ProductType[] {
    return products.map(product => {
      const productType = new ProductType();
      // Ensure all ID fields are converted to strings for GraphQL
      productType.id = String(product.id);
      productType.name = product.name || '';
      productType.description = product.description || '';
      productType.price = product.price || 0;
      productType.inStock = product.quantity ? product.quantity > 0 : false;
      productType.merchantId = product.merchantId ? String(product.merchantId) : '';

      // Safely handle categories mapping with proper type checking
      if (Array.isArray(product.categories)) {
        productType.categoryIds = product.categories
          .filter(cat => cat && typeof cat === 'object' && 'id' in cat)
          .map(cat => String((cat as any).id));
      } else {
        productType.categoryIds = [];
      }

      productType.tags = Array.isArray(product.tags) ? product.tags : [];
      productType.createdAt = product.createdAt || new Date();
      productType.updatedAt = product.updatedAt || new Date();

      return productType;
    });
  }

  /**
   * Map database Merchant entities to GraphQL MerchantType objects
   * @param merchants The merchant entities
   * @returns Mapped merchant types
   */
  private mapMerchantsToMerchantType(merchants: Merchant[]): MerchantType[] {
    return merchants.map(merchant => {
      const merchantType = new MerchantType();
      // Convert all IDs to strings
      merchantType.id = String(merchant.id);
      merchantType.name = merchant.name || '';
      merchantType.description = merchant.description || '';

      // Handle different property names between entity and type
      merchantType.websiteUrl = merchant.website || '';
      merchantType.logoUrl = merchant.logo || '';
      merchantType.isActive = merchant.isActive ?? true;

      // Safely handle the tags field
      // TypeScript may not recognize the tags field if it's dynamically added
      // or if the entity definition doesn't match runtime behavior
      merchantType.tags = [];
      // Use type assertion to handle potentially missing properties
      const merchantAny = merchant as any;
      if (merchantAny.tags && Array.isArray(merchantAny.tags)) {
        merchantType.tags = merchantAny.tags;
      }

      merchantType.createdAt = merchant.createdAt || new Date();
      merchantType.updatedAt = merchant.updatedAt || new Date();

      return merchantType;
    });
  }

  /**
   * Map database Category entities to GraphQL CategoryType objects
   * @param categories The category entities
   * @returns Mapped category types
   */
  private mapCategoriesToCategoryType(categories: Category[]): CategoryType[] {
    return categories.map(category => {
      const categoryType = new CategoryType();
      // Convert all IDs to strings
      categoryType.id = String(category.id);
      categoryType.name = category.name || '';
      categoryType.description = category.description || '';

      // Convert parentId to string and handle null/undefined cases
      categoryType.parentId = category.parentId ? String(category.parentId) : undefined;
      categoryType.createdAt = category.createdAt || new Date();
      categoryType.updatedAt = category.updatedAt || new Date();

      return categoryType;
    });
  }
}
