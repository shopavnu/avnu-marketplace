import { Injectable, Logger } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { NlpSearchService } from '../services/nlp-search.service';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import {
  EnhancedSearchInput,
  EntitySortOptionInput as _EntitySortOptionInput,
} from '../graphql/entity-specific-filters.input';
import {
  SearchResponseType,
  FacetType,
  FacetValueType,
  SearchResultUnion,
} from '../graphql/search-response.type';
import {
  SearchOptionsInput,
  FilterOption,
  RangeFilterOption,
  SortOption,
} from '../dto/search-options.dto';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { BehaviorType } from '../../personalization/entities/user-behavior.entity';
import {
  ProductSearchResult,
  MerchantSearchResult,
  BrandSearchResult,
  SearchFacets,
  CategoryFacet,
  ValueFacet,
  PriceFacet,
} from '../dto/search-response.dto';

@Injectable()
@Resolver(() => SearchResponseType)
export class MultiEntitySearchResolver {
  constructor(
    private readonly logger: Logger,
    private readonly nlpSearchService: NlpSearchService,
    private readonly analyticsService: AnalyticsService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  private transformFacets(searchFacets?: SearchFacets): FacetType[] {
    if (!searchFacets) {
      return [];
    }

    const facetMap = new Map<string, FacetType>();

    const categories: CategoryFacet[] | undefined = searchFacets.categories;
    const valueFacets: ValueFacet[] | undefined = searchFacets.values;
    const priceFacet: PriceFacet | undefined = searchFacets.price;

    if (categories?.length) {
      facetMap.set('category', {
        name: 'category',
        displayName: 'Category',
        values: categories.map(
          (cat): FacetValueType => ({
            value: cat.name,
            count: cat.count,
          }),
        ),
      });
    }

    if (valueFacets?.length) {
      valueFacets.forEach(valueFacet => {
        let groupName = valueFacet.name;
        let valueName = valueFacet.name;
        const separatorIndex = valueFacet.name.indexOf(':');

        if (separatorIndex !== -1) {
          groupName = valueFacet.name.substring(0, separatorIndex);
          valueName = valueFacet.name.substring(separatorIndex + 1).trim(); // Get the part after ':'
        }

        const mapKey = groupName.toLowerCase().replace(/\s+/g, '_');

        if (!facetMap.has(mapKey)) {
          facetMap.set(mapKey, {
            name: mapKey,
            displayName: groupName, // Use the cleaner group name for display
            values: [],
          });
        }

        facetMap.get(mapKey)?.values.push({
          value: valueName, // Use the parsed value name
          count: valueFacet.count,
        });
      });
    }

    if (priceFacet) {
      // Convert price facet to a FacetType
      facetMap.set('price', {
        name: 'price',
        displayName: 'Price',
        values: priceFacet.ranges.map(
          (range): FacetValueType => ({
            // Format the price range as a string (e.g., "$10-$50")
            value: `$${range.min.toFixed(0)}-$${range.max.toFixed(0)}`,
            count: range.count,
          }),
        ),
      });
    }

    return Array.from(facetMap.values());
  }

  @Query(() => SearchResponseType, { name: 'multiEntitySearch' })
  async multiEntitySearch(
    @Args('input') input: EnhancedSearchInput,
    @CurrentUser() user?: User,
  ): Promise<SearchResponseType> {
    this.logger.log(
      `Received multi-entity search request: ${JSON.stringify(input)}`,
      MultiEntitySearchResolver.name,
    );
    const startTime = Date.now();
    let searchResponseForLogging: SearchResponseType | null = null;

    try {
      // Initialize filter arrays
      const filters: FilterOption[] = [];
      const rangeFilters: RangeFilterOption[] = [];

      // Process product filters
      if (input.productFilters) {
        const pf = input.productFilters;

        // Add category filters
        if (pf.categories?.length) {
          filters.push({
            field: 'category',
            values: pf.categories,
            exact: true,
          });
        }

        // Add tag filters
        if (pf.tags?.length) {
          filters.push({
            field: 'tags',
            values: pf.tags,
            exact: false, // Allow partial matching for tags
          });
        }

        // Add value filters (e.g., attributes like color, size)
        if (pf.values?.length) {
          filters.push({
            field: 'values',
            values: pf.values,
            exact: true,
          });
        }

        // Add brand filters
        if (pf.brandIds?.length) {
          filters.push({
            field: 'brandId',
            values: pf.brandIds,
            exact: true,
          });
        }

        // Add merchant filters
        if (pf.merchantIds?.length) {
          filters.push({
            field: 'merchantId',
            values: pf.merchantIds,
            exact: true,
          });
        }

        // Add color filters
        if (pf.colors?.length) {
          filters.push({
            field: 'color',
            values: pf.colors,
            exact: false, // Allow partial matching for colors
          });
        }

        // Add size filters
        if (pf.sizes?.length) {
          filters.push({
            field: 'size',
            values: pf.sizes,
            exact: true,
          });
        }

        // Add material filters
        if (pf.materials?.length) {
          filters.push({
            field: 'material',
            values: pf.materials,
            exact: false, // Allow partial matching for materials
          });
        }

        // Add boolean filters
        if (pf.inStock !== undefined) {
          filters.push({
            field: 'inStock',
            values: [pf.inStock.toString()],
            exact: true,
          });
        }

        if (pf.onSale !== undefined) {
          filters.push({
            field: 'onSale',
            values: [pf.onSale.toString()],
            exact: true,
          });
        }

        // Add price range filter
        if (pf.minPrice !== undefined || pf.maxPrice !== undefined) {
          rangeFilters.push({
            field: 'price',
            min: pf.minPrice,
            max: pf.maxPrice,
          });
        }

        // Add rating range filter
        if (pf.minRating !== undefined) {
          rangeFilters.push({
            field: 'rating',
            min: pf.minRating,
            max: undefined,
          });
        }
      }

      // Process merchant filters
      if (input.merchantFilters) {
        const mf = input.merchantFilters;

        // Add merchant category filters
        if (mf.categories?.length) {
          filters.push({
            field: 'merchantCategory',
            values: mf.categories,
            exact: true,
          });
        }

        // Add merchant value filters
        if (mf.values?.length) {
          filters.push({
            field: 'merchantValues',
            values: mf.values,
            exact: true,
          });
        }

        // Add location filters
        if (mf.locations?.length) {
          filters.push({
            field: 'merchantLocation',
            values: mf.locations,
            exact: false, // Allow partial matching for locations
          });
        }

        // Add boolean filters
        if (mf.verifiedOnly !== undefined) {
          filters.push({
            field: 'merchantVerified',
            values: [mf.verifiedOnly.toString()],
            exact: true,
          });
        }

        if (mf.activeOnly !== undefined) {
          filters.push({
            field: 'merchantActive',
            values: [mf.activeOnly.toString()],
            exact: true,
          });
        }

        // Add product count range filter
        if (mf.minProductCount !== undefined) {
          rangeFilters.push({
            field: 'merchantProductCount',
            min: mf.minProductCount,
            max: undefined,
          });
        }

        // Add rating range filter
        if (mf.minRating !== undefined) {
          rangeFilters.push({
            field: 'merchantRating',
            min: mf.minRating,
            max: undefined,
          });
        }
      }

      // Process brand filters
      if (input.brandFilters) {
        const bf = input.brandFilters;

        // Add brand category filters
        if (bf.categories?.length) {
          filters.push({
            field: 'brandCategory',
            values: bf.categories,
            exact: true,
          });
        }

        // Add brand value filters
        if (bf.values?.length) {
          filters.push({
            field: 'brandValues',
            values: bf.values,
            exact: true,
          });
        }

        // Add location filters
        if (bf.locations?.length) {
          filters.push({
            field: 'brandLocation',
            values: bf.locations,
            exact: false, // Allow partial matching for locations
          });
        }

        // Add boolean filters
        if (bf.verifiedOnly !== undefined) {
          filters.push({
            field: 'brandVerified',
            values: [bf.verifiedOnly.toString()],
            exact: true,
          });
        }

        if (bf.activeOnly !== undefined) {
          filters.push({
            field: 'brandActive',
            values: [bf.activeOnly.toString()],
            exact: true,
          });
        }

        // Add founded year range filter
        if (bf.minFoundedYear !== undefined || bf.maxFoundedYear !== undefined) {
          rangeFilters.push({
            field: 'brandFoundedYear',
            min: bf.minFoundedYear,
            max: bf.maxFoundedYear,
          });
        }

        // Add product count range filter
        if (bf.minProductCount !== undefined) {
          rangeFilters.push({
            field: 'brandProductCount',
            min: bf.minProductCount,
            max: undefined,
          });
        }
      }

      // Map sort options from input to search options
      let sortOptions: SortOption[] | undefined;
      if (input.sortOptions?.length) {
        sortOptions = input.sortOptions.map(option => ({
          field: option.field,
          order: option.order,
        }));
      }

      // Base search options without personalization
      const searchOptions: SearchOptionsInput = {
        query: input.query,
        page: input.page,
        limit: input.limit,
        filters: filters.length > 0 ? filters : undefined,
        rangeFilters: rangeFilters.length > 0 ? rangeFilters : undefined,
        sort: sortOptions,
        entityType: SearchEntityType.ALL,
        enableNlp: true,
        personalized: input.personalized,
        boostByValues: input.boostByValues,
        includeSponsoredContent: input.includeSponsoredContent,
        experimentId: input.experimentId,
        // Add highlighting options
        enableHighlighting: input.enableHighlighting || false,
        highlightFields: input.highlightFields,
        highlightPreTag: input.highlightPreTag,
        highlightPostTag: input.highlightPostTag,
        highlightFragmentSize: input.highlightFragmentSize,
      };

      // Apply personalization if enabled and user is authenticated
      if (input.personalized && user) {
        try {
          // Get personalized filters based on user preferences
          const personalizedFilters = await this.personalizationService.generatePersonalizedFilters(
            user.id,
          );

          // Get personalized boosts based on user behavior
          const personalizedBoosts = await this.personalizationService.generatePersonalizedBoosts(
            user.id,
          );

          // Merge personalized filters with existing filters
          if (personalizedFilters && Object.keys(personalizedFilters).length > 0) {
            // Convert personalized filters to FilterOption format
            const userFilters: FilterOption[] = [];

            // Add category filters
            if (personalizedFilters.categories?.length) {
              userFilters.push({
                field: 'category',
                values: personalizedFilters.categories,
                exact: false, // Use fuzzy matching for personalized categories
              });
            }

            // Add brand filters
            if (personalizedFilters.brands?.length) {
              userFilters.push({
                field: 'brandId',
                values: personalizedFilters.brands,
                exact: true,
              });
            }

            // Add size filters
            if (personalizedFilters.sizes?.length) {
              userFilters.push({
                field: 'size',
                values: personalizedFilters.sizes,
                exact: true,
              });
            }

            // Add color filters
            if (personalizedFilters.colors?.length) {
              userFilters.push({
                field: 'color',
                values: personalizedFilters.colors,
                exact: false, // Use fuzzy matching for colors
              });
            }

            // Add material filters
            if (personalizedFilters.materials?.length) {
              userFilters.push({
                field: 'material',
                values: personalizedFilters.materials,
                exact: false, // Use fuzzy matching for materials
              });
            }

            // Add value-based filters
            const valueFilters = [];
            if (personalizedFilters.sustainable) valueFilters.push('sustainable');
            if (personalizedFilters.ethical) valueFilters.push('ethical');
            if (personalizedFilters.local) valueFilters.push('local');

            if (valueFilters.length > 0) {
              userFilters.push({
                field: 'values',
                values: valueFilters,
                exact: true,
              });
            }

            // Merge with existing filters
            if (searchOptions.filters) {
              searchOptions.filters = [...searchOptions.filters, ...userFilters];
            } else {
              searchOptions.filters = userFilters;
            }
          }

          // Add personalized boosts to metadata
          if (personalizedBoosts) {
            if (!searchOptions.metadata) {
              searchOptions.metadata = {};
            }
            searchOptions.metadata.personalizedBoosts = personalizedBoosts;
          }

          this.logger.log(
            `Applied personalization for user ${user.id}`,
            MultiEntitySearchResolver.name,
          );
        } catch (error) {
          this.logger.error(
            `Failed to apply personalization: ${error.message}`,
            error.stack,
            MultiEntitySearchResolver.name,
          );
          // Continue with non-personalized search if personalization fails
        }
      }

      const nlpResponse = await this.nlpSearchService.searchAsync(searchOptions, user);

      this.logger.log(
        `Search completed in ${Date.now() - startTime}ms`,
        MultiEntitySearchResolver.name,
      );

      const allResults: (typeof SearchResultUnion)[] = [
        ...(nlpResponse.products?.map((p: ProductSearchResult) => ({
          ...p,
          __typename: 'ProductResultType',
          relevanceScore: p.score,
          inStock: true,
        })) ?? []),
        ...(nlpResponse.merchants?.map((m: MerchantSearchResult) => ({
          ...m,
          __typename: 'MerchantResultType',
          relevanceScore: m.score,
        })) ?? []),
        ...(nlpResponse.brands?.map((b: BrandSearchResult) => ({
          ...b,
          __typename: 'BrandResultType',
          relevanceScore: b.score,
        })) ?? []),
      ];

      allResults.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

      const transformedFacets = this.transformFacets(nlpResponse.facets);

      const finalResponse: SearchResponseType = {
        query: input.query,
        pagination: nlpResponse.pagination,
        results: allResults,
        facets: transformedFacets,
        relevanceScores: undefined,
        entityDistribution: undefined,
        isNlpEnabled: true,
        isPersonalized: searchOptions.personalized ?? false,
        experimentId: searchOptions.experimentId,
        appliedFilters:
          searchOptions.filters || searchOptions.rangeFilters
            ? Object.keys({ ...searchOptions.filters, ...searchOptions.rangeFilters })
            : undefined,
        highlightsEnabled: nlpResponse.highlightsEnabled || false,
      };
      searchResponseForLogging = finalResponse;

      /**
       * Enhanced Search Analytics Tracking
       *
       * This section captures detailed analytics about search behavior including:
       * - Filter usage patterns
       * - Sorting preferences
       * - Entity distribution in results
       * - Facet availability and usage
       * - Performance metrics
       *
       * Note: Future integration with Google Analytics is planned.
       * See /docs/search-analytics.md for more details.
       */

      // Get current search parameters from search options
      const currentFilters = searchOptions.filters;
      const currentRangeFilters = searchOptions.rangeFilters;
      const currentSortOptions = searchOptions.sort;

      /**
       * Filter Usage Tracking
       *
       * Captures which filters are being used and how they're configured.
       * For exact filters: tracks field, type, value count, and values
       * For range filters: tracks field, type, min, and max values
       */
      const filterUsage = {};
      if (currentFilters?.length) {
        currentFilters.forEach(filter => {
          filterUsage[filter.field] = {
            type: 'exact',
            valueCount: filter.values.length,
            values: filter.values,
          };
        });
      }

      // Track range filter usage (price, rating, etc.)
      if (currentRangeFilters?.length) {
        currentRangeFilters.forEach(filter => {
          filterUsage[filter.field] = {
            type: 'range',
            min: filter.min,
            max: filter.max,
          };
        });
      }

      /**
       * Sort Options Tracking
       *
       * Captures sorting preferences including:
       * - Which fields are being sorted by
       * - Sort order (ascending/descending)
       * - Sort priority (primary, secondary, etc.)
       */
      const sortUsage = {};
      if (currentSortOptions?.length) {
        currentSortOptions.forEach((sort, index) => {
          sortUsage[sort.field] = {
            order: sort.order,
            priority: index + 1, // 1-based priority (1 = primary sort)
          };
        });
      }

      /**
       * Entity Filter Count Tracking
       *
       * Counts how many filters are applied to each entity type:
       * - Product filters (categories, price, etc.)
       * - Merchant filters (location, rating, etc.)
       * - Brand filters (founded year, etc.)
       */
      const productFilterCount = input.productFilters
        ? Object.keys(input.productFilters).filter(key => input.productFilters[key] !== undefined)
            .length
        : 0;
      const merchantFilterCount = input.merchantFilters
        ? Object.keys(input.merchantFilters).filter(key => input.merchantFilters[key] !== undefined)
            .length
        : 0;
      const brandFilterCount = input.brandFilters
        ? Object.keys(input.brandFilters).filter(key => input.brandFilters[key] !== undefined)
            .length
        : 0;

      /**
       * Entity Distribution Tracking
       *
       * Captures how results are distributed across entity types:
       * - Number of products in results
       * - Number of merchants in results
       * - Number of brands in results
       */
      const entityDistribution = {
        products: nlpResponse.products?.length || 0,
        merchants: nlpResponse.merchants?.length || 0,
        brands: nlpResponse.brands?.length || 0,
      };

      /**
       * Facet Usage Tracking
       *
       * Captures which facets are available in search results:
       * - Category facets (name, count)
       * - Value facets (name, count)
       * - Price facets (min, max, range count)
       */
      const facetUsage = {};
      if (nlpResponse.facets) {
        if (nlpResponse.facets.categories?.length) {
          facetUsage['categories'] = {
            count: nlpResponse.facets.categories.length,
            values: nlpResponse.facets.categories.map(c => ({ name: c.name, count: c.count })),
          };
        }
        if (nlpResponse.facets.values?.length) {
          facetUsage['values'] = {
            count: nlpResponse.facets.values.length,
            values: nlpResponse.facets.values.map(v => ({ name: v.name, count: v.count })),
          };
        }
        if (nlpResponse.facets.price) {
          facetUsage['price'] = {
            min: nlpResponse.facets.price.min,
            max: nlpResponse.facets.price.max,
            rangeCount: nlpResponse.facets.price.ranges?.length || 0,
          };
        }
      }

      /**
       * Track Search Analytics
       *
       * Sends the enhanced analytics data to the analytics service.
       * Includes basic search information and detailed metadata about
       * filters, sorting, entity distribution, and facet usage.
       */
      this.analyticsService
        .trackSearch({
          query: input.query,
          userId: user?.id,
          sessionId: undefined,
          resultCount: nlpResponse.pagination.total,
          hasFilters: Object.keys(filterUsage).length > 0,
          filters: Object.keys(filterUsage).length > 0 ? JSON.stringify(filterUsage) : undefined,
          categoryContext: undefined,
          deviceType: undefined,
          platform: undefined,
          isNlpEnhanced: true,
          isPersonalized: finalResponse.isPersonalized,
          experimentId: finalResponse.experimentId,
          filterCount: Object.keys(filterUsage).length,
          highlightsEnabled: finalResponse.highlightsEnabled,
          metadata: {
            // Performance metrics
            responseTimeMs: Date.now() - startTime,

            // Sorting preferences
            sortOptions: Object.keys(sortUsage).length > 0 ? sortUsage : undefined,

            // Result distribution
            entityDistribution,

            // Facet availability
            facetUsage,

            // Filter usage by entity type
            entityFilterCounts: {
              product: productFilterCount,
              merchant: merchantFilterCount,
              brand: brandFilterCount,
            },

            // Query and pagination metrics
            queryLength: input.query?.length || 0,
            page: input.page,
            limit: input.limit,
            totalPages: nlpResponse.pagination.totalPages,
            hasNext: nlpResponse.pagination.hasNext,
            hasPrevious: nlpResponse.pagination.hasPrevious,
          },
        })
        .catch(error => {
          this.logger.error(
            `Failed to track search analytics: ${error.message}`,
            error.stack,
            MultiEntitySearchResolver.name,
          );
        });

      // Track user behavior for personalization if user is authenticated
      if (user && input.query) {
        this.personalizationService
          .trackInteractionAndUpdatePreferences(
            user.id,
            BehaviorType.SEARCH,
            input.query,
            'search',
            input.query,
          )
          .catch(error => {
            this.logger.error(
              `Failed to track search behavior: ${error.message}`,
              error.stack,
              MultiEntitySearchResolver.name,
            );
          });
      }

      return finalResponse;
    } catch (error) {
      this.logger.error(
        `Multi-entity search failed for query "${input.query}": ${error.message}`,
        error.stack,
        MultiEntitySearchResolver.name,
      );
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.logger.log(
        `Finished processing multi-entity search for query "${input.query}" in ${duration}ms. Results: ${searchResponseForLogging?.results?.length ?? 'N/A'}`,
        MultiEntitySearchResolver.name,
      );
    }
  }
}
