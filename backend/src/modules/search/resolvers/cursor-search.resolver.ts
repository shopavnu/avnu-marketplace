import { Injectable, Logger } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { NlpSearchService } from '../services/nlp-search.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { BehaviorType } from '../../personalization/entities/user-behavior.entity';
import { CursorSearchResponseType } from '../graphql/cursor-search-response.type';
import {} from /* CursorPaginationInput */ '../graphql/cursor-pagination.type';
import { EnhancedSearchInput } from '../graphql/entity-specific-filters.input';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { FacetType } from '../graphql/search-response.type';

/**
 * Input type for cursor-based search
 */
class _CursorSearchInput {
  query?: string;
  cursor?: string;
  limit?: number;
  filters?: any;
  sortOptions?: any;
  enableNlp?: boolean;
  personalized?: boolean;
  includeSponsoredContent?: boolean;
}

@Injectable()
@Resolver(() => CursorSearchResponseType)
export class CursorSearchResolver {
  constructor(
    private readonly logger: Logger,
    private readonly nlpSearchService: NlpSearchService,
    private readonly analyticsService: AnalyticsService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  /**
   * Transform facets from the search service to GraphQL facet types
   */
  private transformFacets(searchFacets?: any): FacetType[] {
    if (!searchFacets) {
      return [];
    }

    const facetMap = new Map<string, FacetType>();

    const categories = searchFacets.categories;
    const valueFacets = searchFacets.values;
    const priceFacet = searchFacets.price;

    if (categories?.length) {
      facetMap.set('category', {
        name: 'category',
        displayName: 'Category',
        values: categories.map((cat): any => ({
          value: cat.name,
          count: cat.count,
        })),
      });
    }

    if (valueFacets?.length) {
      valueFacets.forEach(valueFacet => {
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

    if (priceFacet) {
      facetMap.set('price', {
        name: 'price',
        displayName: 'Price',
        values: priceFacet.ranges.map((range): any => ({
          value: `$${range.min.toFixed(0)}-$${range.max.toFixed(0)}`,
          count: range.count,
        })),
      });
    }

    return Array.from(facetMap.values());
  }

  /**
   * Generate a cursor from an item's ID and other metadata
   */
  private generateCursor(item: any, index: number): string {
    // Create a cursor that encodes the item's ID and position
    const cursorData = {
      id: item.id,
      index: index,
      timestamp: Date.now(),
    };

    // Encode the cursor data as a base64 string
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * Decode a cursor to extract the item's ID and metadata
   */
  private decodeCursor(cursor: string): any {
    if (!cursor) return null;

    try {
      // Decode the base64 cursor string
      const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decodedString);
    } catch (error) {
      this.logger.error(`Failed to decode cursor: ${error.message}`, error.stack);
      return null;
    }
  }

  @Query(() => CursorSearchResponseType, { name: 'search' })
  async cursorSearch(
    @Args('query', { nullable: true }) query?: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit?: number,
    @Args('sessionId', { nullable: true }) sessionId?: string,
    @CurrentUser() user?: User,
  ): Promise<CursorSearchResponseType> {
    this.logger.log(
      `Received cursor-based search request: query=${query}, cursor=${cursor}, limit=${limit}, sessionId=${sessionId || 'none'}`,
      CursorSearchResolver.name,
    );
    const startTime = Date.now();

    try {
      // Convert cursor-based pagination to offset-based for the search service
      let page = 0;
      let decodedCursor = null;

      if (cursor) {
        decodedCursor = this.decodeCursor(cursor);
        if (decodedCursor) {
          // If we have a valid cursor, calculate the page based on the index and limit
          page = Math.floor(decodedCursor.index / limit) + 1;
        }
      }

      // Create a search input for the NLP search service
      const _searchInput: EnhancedSearchInput = {
        query,
        page,
        limit,
        enableNlp: true,
        personalized: !!user,
        includeSponsoredContent: true,
        boostByValues: false, // Required by EnhancedSearchInput type
      };

      // Execute the search using the searchAsync method which is available in NlpSearchService
      const searchOptions = {
        query: query || '',
        page,
        limit,
        filters: [],
        entityTypes: [SearchEntityType.PRODUCT, SearchEntityType.MERCHANT, SearchEntityType.BRAND],
        enableNlp: true,
        enableHighlighting: false,
        sessionId, // Include sessionId for session-based personalization
      };

      // Pass sessionId to searchAsync for session-based personalization
      const searchResponse = await this.nlpSearchService.searchAsync(
        searchOptions,
        user,
        sessionId,
      );

      // Create a simplified array of search results with common properties
      const results = [];

      // Add products to results
      if (searchResponse.products && searchResponse.products.length > 0) {
        searchResponse.products.forEach(product => {
          results.push({
            id: product.id,
            type: SearchEntityType.PRODUCT,
            title: product.title,
            description: product.description || '',
            price: product.price,
            // Use a default currency since product.currency might not exist
            currency: 'USD',
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            categories: product.categories || [],
            values: product.values || [],
            brandName: product.brandName || '',
            score: product.score || 0,
            isSponsored: product.isSponsored || false,
            inStock: true, // Default value for required field
          });
        });
      }

      // Add merchants to results
      if (searchResponse.merchants && searchResponse.merchants.length > 0) {
        searchResponse.merchants.forEach(merchant => {
          results.push({
            id: merchant.id,
            type: SearchEntityType.MERCHANT,
            name: merchant.name,
            description: merchant.description || '',
            logo: merchant.logo || '',
            categories: merchant.categories || [],
            values: merchant.values || [],
            location: merchant.location || '',
            rating: merchant.rating || 0,
            reviewCount: merchant.reviewCount || 0,
            score: merchant.score || 0,
            isSponsored: merchant.isSponsored || false,
            inStock: true, // Default value for required field
          });
        });
      }

      // Add brands to results
      if (searchResponse.brands && searchResponse.brands.length > 0) {
        searchResponse.brands.forEach(brand => {
          results.push({
            id: brand.id,
            type: SearchEntityType.BRAND,
            name: brand.name,
            description: brand.description || '',
            logo: brand.logo || '',
            categories: brand.categories || [],
            values: brand.values || [],
            location: brand.location || '',
            foundedYear: brand.foundedYear,
            score: brand.score || 0,
            isSponsored: brand.isSponsored || false,
            inStock: true, // Default value for required field
          });
        });
      }
      const hasMore = page < searchResponse.pagination.totalPages - 1;

      // Generate the next cursor based on the last item in the results
      let nextCursor = null;
      if (hasMore && results.length > 0) {
        const lastItem = results[results.length - 1];
        const lastIndex = page * limit + results.length - 1;
        nextCursor = this.generateCursor(lastItem, lastIndex);
      }

      // Track search analytics
      this.analyticsService
        .trackSearch({
          query,
          userId: user?.id,
          sessionId: undefined,
          resultCount: searchResponse.pagination.total,
          hasFilters: false,
          categoryContext: undefined,
          deviceType: undefined,
          platform: undefined,
          isNlpEnhanced: true,
          isPersonalized: false, // Default value since SearchResponseDto doesn't have this property
          experimentId: undefined,
          filterCount: 0,
          highlightsEnabled: searchResponse.highlightsEnabled,
          metadata: {
            responseTimeMs: Date.now() - startTime,
            cursorBased: true,
            hasNextCursor: !!nextCursor,
          },
        })
        .catch(error => {
          this.logger.error(
            `Failed to track search analytics: ${error.message}`,
            error.stack,
            CursorSearchResolver.name,
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
              CursorSearchResolver.name,
            );
          });
      }

      // Return the cursor-based search response
      return {
        query,
        pagination: {
          total: searchResponse.pagination.total,
          nextCursor,
          hasMore,
        },
        results,
        highlightsEnabled: false,
        facets: this.transformFacets(searchResponse.facets),
        isPersonalized: false, // Default value since SearchResponseDto doesn't have this property
        experimentId: undefined,
        appliedFilters: [],
      };
    } catch (error) {
      this.logger.error(
        `Cursor-based search failed for query "${query}": ${error.message}`,
        error.stack,
        CursorSearchResolver.name,
      );
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Finished processing cursor-based search for query "${query}" in ${duration}ms.`,
        CursorSearchResolver.name,
      );
    }
  }
}
