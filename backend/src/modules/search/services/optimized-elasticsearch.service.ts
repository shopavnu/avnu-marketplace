import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class OptimizedElasticsearchService {
  private readonly logger = new Logger(OptimizedElasticsearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Enhanced product search with optimized query structure and performance
   * - Uses function_score for better relevance
   * - Includes nested aggregations for faceted search
   * - Supports cursor-based pagination
   */
  async optimizedProductSearch({
    query,
    filters,
    cursor,
    limit = 20,
    sort,
    includeAggregations = true,
  }: {
    query?: string;
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      brandName?: string;
      inStock?: boolean;
      values?: string[];
    };
    cursor?: string;
    limit?: number;
    sort?: { field: string; order: 'asc' | 'desc' };
    includeAggregations?: boolean;
  }) {
    try {
      // Start timing for performance monitoring
      const startTime = Date.now();

      // Decode cursor if provided
      let searchAfter;
      let decodedCursor;
      if (cursor) {
        try {
          decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
          searchAfter = decodedCursor.sort;
        } catch (error) {
          this.logger.error(`Failed to decode cursor: ${error.message}`);
        }
      }

      // Build the query
      const esQuery: any = {
        index: 'products',
        body: {
          size: limit,
          track_total_hits: true,
          _source: {
            includes: [
              'id',
              'title',
              'description',
              'price',
              'compareAtPrice',
              'categories',
              'tags',
              'merchantId',
              'brandName',
              'isActive',
              'inStock',
              'quantity',
              'values',
              'createdAt',
              'updatedAt',
              'isOnSale',
              'images',
            ],
          },
          query: {
            function_score: {
              query: {
                bool: {
                  must: query
                    ? [
                        {
                          multi_match: {
                            query,
                            type: 'best_fields',
                            fields: [
                              'title^3',
                              'description^1.5',
                              'categories^2',
                              'tags^1.8',
                              'brandName^2.5',
                              'values^1.2',
                            ],
                            fuzziness: 'AUTO',
                            prefix_length: 1,
                            tie_breaker: 0.3,
                          },
                        },
                      ]
                    : [
                        {
                          match_all: {},
                        },
                      ],
                  filter: [{ term: { isActive: true } }],
                },
              },
              functions: [
                {
                  filter: { term: { inStock: true } },
                  weight: 1.2,
                },
                {
                  filter: { term: { isOnSale: true } },
                  weight: 1.1,
                },
                {
                  gauss: {
                    createdAt: {
                      origin: 'now',
                      scale: '30d',
                      offset: '5d',
                      decay: 0.5,
                    },
                  },
                  weight: 1.5,
                },
              ],
              score_mode: 'sum',
              boost_mode: 'multiply',
            },
          },
        },
      };

      // Add sort criteria
      if (sort) {
        esQuery.body.sort = [
          { [sort.field]: { order: sort.order } },
          { _score: { order: 'desc' } },
          { id: { order: 'asc' } },
        ];
      } else {
        esQuery.body.sort = [
          { _score: { order: 'desc' } },
          { createdAt: { order: 'desc' } },
          { id: { order: 'asc' } },
        ];
      }

      // Add search_after for cursor pagination
      if (searchAfter) {
        esQuery.body.search_after = searchAfter;
      }

      // Add filters
      if (filters) {
        const boolFilter = esQuery.body.query.function_score.query.bool.filter;

        if (filters.categories?.length) {
          boolFilter.push({
            terms: { 'categories.keyword': filters.categories },
          });
        }

        if (filters.values?.length) {
          boolFilter.push({
            terms: { 'values.keyword': filters.values },
          });
        }

        if (filters.brandName) {
          boolFilter.push({
            term: { 'brandName.keyword': filters.brandName },
          });
        }

        if (filters.merchantId) {
          boolFilter.push({
            term: { merchantId: filters.merchantId },
          });
        }

        if (filters.inStock !== undefined) {
          boolFilter.push({
            term: { inStock: filters.inStock },
          });
        }

        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
          const priceRange: any = {
            range: {
              price: {},
            },
          };

          if (filters.priceMin !== undefined) {
            priceRange.range.price.gte = filters.priceMin;
          }

          if (filters.priceMax !== undefined) {
            priceRange.range.price.lte = filters.priceMax;
          }

          boolFilter.push(priceRange);
        }
      }

      // Add aggregations (facets) if requested
      if (includeAggregations) {
        esQuery.body.aggs = {
          categories: {
            terms: {
              field: 'categories.keyword',
              size: 20,
            },
          },
          brands: {
            terms: {
              field: 'brandName.keyword',
              size: 20,
            },
          },
          values: {
            terms: {
              field: 'values.keyword',
              size: 50,
            },
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { to: 25 },
                { from: 25, to: 50 },
                { from: 50, to: 100 },
                { from: 100, to: 200 },
                { from: 200 },
              ],
            },
          },
          // Additional metrics for insights
          avg_price: {
            avg: {
              field: 'price',
            },
          },
          min_price: {
            min: {
              field: 'price',
            },
          },
          max_price: {
            max: {
              field: 'price',
            },
          },
        };
      }

      // Execute the query
      const response = await this.elasticsearchService.performSearch('products', esQuery.body);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Process results
      const hits = response.hits.hits;
      const total = response.hits.total.value;

      // Map hits to product objects
      const products = hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
        highlight: hit.highlight,
      }));

      // Generate next cursor
      let nextCursor = null;
      if (hits.length === limit && hits.length > 0) {
        const lastHit = hits[hits.length - 1];
        const sortValues = lastHit.sort || [
          lastHit._score,
          lastHit._source.createdAt,
          lastHit._source.id,
        ];

        nextCursor = Buffer.from(
          JSON.stringify({
            sort: sortValues,
            timestamp: Date.now(),
          }),
        ).toString('base64');
      }

      // Process aggregations
      let facets = null;
      if (includeAggregations && response.aggregations) {
        facets = {
          categories: response.aggregations.categories.buckets.map((bucket: any) => ({
            name: bucket.key,
            count: bucket.doc_count,
          })),
          brands: response.aggregations.brands.buckets.map((bucket: any) => ({
            name: bucket.key,
            count: bucket.doc_count,
          })),
          values: response.aggregations.values.buckets.map((bucket: any) => ({
            name: bucket.key,
            count: bucket.doc_count,
          })),
          price: {
            ranges: response.aggregations.price_ranges.buckets.map((bucket: any) => ({
              min: bucket.from || 0,
              max: bucket.to || Infinity,
              count: bucket.doc_count,
            })),
            stats: {
              avg: response.aggregations.avg_price.value,
              min: response.aggregations.min_price.value,
              max: response.aggregations.max_price.value,
            },
          },
        };
      }

      // Log performance metrics
      this.logger.log(`Optimized search completed in ${duration}ms with ${total} results`);

      return {
        products,
        total,
        nextCursor,
        facets,
        meta: {
          took: duration,
          query: esQuery.body.query,
        },
      };
    } catch (error) {
      this.logger.error(`Optimized search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get product by ID with similar products
   */
  async getProductWithSimilar(productId: string, similarLimit = 6) {
    try {
      // First get the product
      const product = await this.elasticsearchService.performSearch('products', {
        query: {
          term: { id: productId },
        },
      });

      if (!product.hits.hits.length) {
        return { product: null, similar: [] };
      }

      const productSource = product.hits.hits[0]._source;

      // Then get similar products
      const similar = await this.elasticsearchService.performSearch('products', {
        query: {
          bool: {
            must_not: [{ term: { id: productId } }],
            should: [
              { terms: { 'categories.keyword': productSource.categories || [] } },
              { terms: { 'values.keyword': productSource.values || [] } },
              { term: { 'brandName.keyword': productSource.brandName } },
              {
                range: {
                  price: {
                    gte: productSource.price * 0.7,
                    lte: productSource.price * 1.3,
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        size: similarLimit,
      });

      return {
        product: productSource,
        similar: similar.hits.hits.map((hit: any) => hit._source),
      };
    } catch (error) {
      this.logger.error(`Failed to get product with similar: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get facets for dynamic filtering
   */
  async getFilterFacets(query?: string) {
    try {
      const response = await this.elasticsearchService.performSearch('products', {
        size: 0,
        query: query
          ? {
              multi_match: {
                query,
                fields: ['title^2', 'description', 'categories', 'tags', 'brandName'],
              },
            }
          : {
              match_all: {},
            },
        aggs: {
          categories: {
            terms: {
              field: 'categories.keyword',
              size: 30,
            },
          },
          brands: {
            terms: {
              field: 'brandName.keyword',
              size: 30,
            },
          },
          values: {
            terms: {
              field: 'values.keyword',
              size: 50,
            },
          },
          price_stats: {
            stats: {
              field: 'price',
            },
          },
          // Group values by prefix before colon (e.g., "Material: Cotton" -> "Material")
          value_groups: {
            terms: {
              script: {
                source:
                  "def value = doc['values.keyword'].value; def colonIndex = value.indexOf(':'); if (colonIndex > 0) { return value.substring(0, colonIndex); } else { return value; }",
                lang: 'painless',
              },
              size: 20,
            },
          },
        },
      });

      return {
        categories: response.aggregations.categories.buckets,
        brands: response.aggregations.brands.buckets,
        values: response.aggregations.values.buckets,
        valueGroups: response.aggregations.value_groups.buckets,
        priceStats: response.aggregations.price_stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get filter facets: ${error.message}`, error.stack);
      throw error;
    }
  }
}
