import { Injectable, Logger } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { BehaviorType } from '../../personalization/entities/user-behavior.entity';
import { CursorSearchResponseType } from '../graphql/cursor-search-response.type';
import { CursorPaginationInput } from '../graphql/cursor-pagination.type';
import { SearchFiltersInput } from '../graphql/entity-specific-filters.input';
import { OptimizedElasticsearchService } from '../services/optimized-elasticsearch.service';
import { SearchEntityType } from '../enums/search-entity-type.enum';

@Injectable()
@Resolver(() => CursorSearchResponseType)
export class OptimizedSearchResolver {
  constructor(
    private readonly logger: Logger,
    private readonly optimizedElasticsearchService: OptimizedElasticsearchService,
    private readonly analyticsService: AnalyticsService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  @Query(() => CursorSearchResponseType, { name: 'optimizedSearch' })
  async optimizedSearch(
    @Args('query', { nullable: true }) query?: string,
    @Args('pagination', { nullable: true }) pagination?: CursorPaginationInput,
    @Args('filters', { nullable: true }) filters?: SearchFiltersInput,
    @Args('sessionId', { nullable: true }) sessionId?: string,
    @CurrentUser() user?: User,
  ): Promise<CursorSearchResponseType> {
    const startTime = Date.now();
    const limit = pagination?.limit || 20;

    try {
      this.logger.log(
        `Processing optimized search for query "${query}" with cursor pagination`,
        OptimizedSearchResolver.name,
      );

      // Convert GraphQL filters to Elasticsearch filters
      const esFilters = {
        categories: filters?.categories,
        priceMin: filters?.priceRange?.min,
        priceMax: filters?.priceRange?.max,
        merchantId: filters?.merchantId,
        brandName: filters?.brandName,
        inStock: filters?.inStock,
        values: filters?.values,
      };

      // Convert GraphQL sort options
      const esSort = filters?.sortBy
        ? {
            field: this.getSortField(filters.sortBy),
            order: (filters.sortDirection?.toLowerCase() as 'asc' | 'desc') || 'desc',
          }
        : undefined;

      // Execute the optimized search
      const searchResponse = await this.optimizedElasticsearchService.optimizedProductSearch({
        query,
        filters: esFilters,
        cursor: pagination?.cursor,
        limit,
        sort: esSort,
        includeAggregations: true,
      });

      // Transform products to GraphQL entity format
      const results = searchResponse.products.map(product => ({
        id: product.id,
        type: SearchEntityType.PRODUCT,
        name: product.title,
        description: product.description || '',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images || [],
        categories: product.categories || [],
        values: product.values || [],
        brandName: product.brandName || '',
        merchantId: product.merchantId,
        score: product.score || 0,
        isSponsored: false, // Default value
        inStock: product.inStock,
      }));

      // Transform facets for GraphQL response
      const facets = this.transformFacets(searchResponse.facets);

      // Track search analytics
      this.analyticsService
        .trackSearch({
          query,
          userId: user?.id,
          sessionId,
          resultCount: searchResponse.total,
          hasFilters: !!filters && Object.keys(filters).length > 0,
          categoryContext: filters?.categories?.[0],
          deviceType: undefined,
          platform: undefined,
          isNlpEnhanced: false,
          isPersonalized: false,
          experimentId: undefined,
          filterCount: filters ? this.countAppliedFilters(filters) : 0,
          highlightsEnabled: false,
          metadata: {
            responseTimeMs: Date.now() - startTime,
            cursorBased: true,
            hasNextCursor: !!searchResponse.nextCursor,
          },
        })
        .catch(error => {
          this.logger.error(
            `Failed to track search analytics: ${error.message}`,
            error.stack,
            OptimizedSearchResolver.name,
          );
        });

      // Track user behavior for personalization if user is authenticated
      if (user && query) {
        this.personalizationService
          .trackInteractionAndUpdatePreferences(
            user.id,
            BehaviorType.SEARCH,
            query,
            'search',
            query,
          )
          .catch(error => {
            this.logger.error(
              `Failed to track search behavior: ${error.message}`,
              error.stack,
              OptimizedSearchResolver.name,
            );
          });
      }

      // Return the cursor-based search response
      return {
        query,
        pagination: {
          total: searchResponse.total,
          nextCursor: searchResponse.nextCursor,
          hasMore: !!searchResponse.nextCursor,
        },
        results,
        highlightsEnabled: false,
        facets,
        isPersonalized: false,
        experimentId: undefined,
        appliedFilters: this.getAppliedFilters(filters),
      };
    } catch (error) {
      this.logger.error(
        `Optimized search failed for query "${query}": ${error.message}`,
        error.stack,
        OptimizedSearchResolver.name,
      );
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Finished processing optimized search for query "${query}" in ${duration}ms.`,
        OptimizedSearchResolver.name,
      );
    }
  }

  /**
   * Transform facets from the search service to GraphQL facet types
   */
  private transformFacets(searchFacets?: any): any[] {
    if (!searchFacets) {
      return [];
    }

    const facetMap = new Map<string, any>();

    // Process category facets
    if (searchFacets.categories?.length) {
      facetMap.set('category', {
        name: 'category',
        displayName: 'Category',
        values: searchFacets.categories.map((cat: any) => ({
          value: cat.name,
          count: cat.count,
        })),
      });
    }

    // Process brand facets
    if (searchFacets.brands?.length) {
      facetMap.set('brand', {
        name: 'brand',
        displayName: 'Brand',
        values: searchFacets.brands.map((brand: any) => ({
          value: brand.name,
          count: brand.count,
        })),
      });
    }

    // Process value facets
    if (searchFacets.values?.length) {
      searchFacets.values.forEach((valueFacet: any) => {
        let groupName = valueFacet.name;
        let valueName = valueFacet.name;
        const separatorIndex = valueFacet.name.indexOf(':');

        if (separatorIndex !== -1) {
          groupName = valueFacet.name.substring(0, separatorIndex);
          valueName = valueFacet.name.substring(separatorIndex + 1).trim();
        }

        const mapKey = groupName.toLowerCase().replace(/\s+/g, '_');

        if (!facetMap.has(mapKey)) {
          facetMap.set(mapKey, {
            name: mapKey,
            displayName: groupName,
            values: [],
          });
        }

        facetMap.get(mapKey)?.values.push({
          value: valueName,
          count: valueFacet.count,
        });
      });
    }

    // Process price facets
    if (searchFacets.price?.ranges) {
      facetMap.set('price', {
        name: 'price',
        displayName: 'Price',
        values: searchFacets.price.ranges.map((range: any) => ({
          value: `$${range.min.toFixed(0)}-$${range.max === Infinity ? '∞' : range.max.toFixed(0)}`,
          count: range.count,
          min: range.min,
          max: range.max === Infinity ? null : range.max,
        })),
      });
    }

    return Array.from(facetMap.values());
  }

  /**
   * Count how many filters have been applied
   */
  private countAppliedFilters(filters: SearchFiltersInput): number {
    let count = 0;

    if (filters.categories?.length) count++;
    if (filters.brandName) count++;
    if (filters.merchantId) count++;
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++;
    if (filters.values?.length) count++;
    if (filters.inStock !== undefined) count++;

    return count;
  }

  /**
   * Get a list of applied filters for the response
   */
  private getAppliedFilters(filters?: SearchFiltersInput): string[] {
    if (!filters) return [];

    const appliedFilters: string[] = [];

    if (filters.categories?.length) {
      appliedFilters.push(`category:${filters.categories.join(',')}`);
    }

    if (filters.brandName) {
      appliedFilters.push(`brand:${filters.brandName}`);
    }

    if (filters.merchantId) {
      appliedFilters.push(`merchant:${filters.merchantId}`);
    }

    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) {
      const min = filters.priceRange?.min !== undefined ? filters.priceRange.min : '*';
      const max = filters.priceRange?.max !== undefined ? filters.priceRange.max : '*';
      appliedFilters.push(`price:${min}-${max}`);
    }

    if (filters.values?.length) {
      appliedFilters.push(`values:${filters.values.join(',')}`);
    }

    if (filters.inStock !== undefined) {
      appliedFilters.push(`inStock:${filters.inStock}`);
    }

    return appliedFilters;
  }

  /**
   * Convert sort field names from GraphQL to Elasticsearch
   */
  private getSortField(sortBy: string): string {
    switch (sortBy) {
      case 'price':
        return 'price';
      case 'name':
        return 'title.keyword';
      case 'newest':
        return 'createdAt';
      case 'relevance':
        return '_score';
      default:
        return '_score';
    }
  }
}
