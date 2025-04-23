import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly _logger = new Logger(ElasticsearchService.name);
  private _client: Client;

  constructor(private readonly configService: ConfigService) {
    this._client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
      },
    });
  }

  async onModuleInit() {
    try {
      // Check if Elasticsearch is running
      await this._client.ping();
      this._logger.log('Successfully connected to Elasticsearch');

      // Create indices if they don't exist
      await this._createIndices();
    } catch (error) {
      this._logger.error(`Failed to connect to Elasticsearch: ${error.message}`);
    }
  }

  private async _createIndices() {
    const indices = ['products', 'merchants', 'brands'];

    for (const index of indices) {
      const exists = await this.indexExists(index);

      if (!exists) {
        await this.createIndex(index);
        this._logger.log(`Created index: ${index}`);
      }
    }
  }

  private _getMappingForIndex(index: string) {
    switch (index) {
      case 'products':
        return {
          properties: {
            id: { type: 'keyword' },
            title: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'custom_analyzer',
            },
            price: { type: 'float' },
            compareAtPrice: { type: 'float' },
            categories: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            tags: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            merchantId: { type: 'keyword' },
            brandName: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            isActive: { type: 'boolean' },
            inStock: { type: 'boolean' },
            quantity: { type: 'integer' },
            values: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            isOnSale: { type: 'boolean' },
          },
        };
      case 'merchants':
        return {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'custom_analyzer',
            },
            location: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            values: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            categories: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        };
      case 'brands':
        return {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'custom_analyzer',
            },
            location: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            values: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            categories: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        };
      default:
        return {};
    }
  }

  async indexProduct(product: Product): Promise<void> {
    try {
      await this.indexDocument('products', product.id, {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        categories: product.categories,
        tags: product.tags,
        merchantId: product.merchantId,
        brandName: product.brandName,
        isActive: product.isActive,
        inStock: product.inStock,
        quantity: product.quantity,
        values: product.values,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        isOnSale: product.compareAtPrice !== null && product.price < product.compareAtPrice,
      });
    } catch (error) {
      this._logger.error(`Failed to index product ${product.id}: ${error.message}`);
      throw error;
    }
  }

  async bulkIndexProducts(products: Product[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const body = products.flatMap(product => [
      { index: { _index: 'products', _id: product.id } },
      {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        categories: product.categories,
        tags: product.tags,
        merchantId: product.merchantId,
        brandName: product.brandName,
        isActive: product.isActive,
        inStock: product.inStock,
        quantity: product.quantity,
        values: product.values,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        isOnSale: product.compareAtPrice !== null && product.price < product.compareAtPrice,
      },
    ]);

    try {
      await this.bulkOperation(body, true);
    } catch (error) {
      this._logger.error(`Failed to bulk index products: ${error.message}`);
      throw error;
    }
  }

  async updateProduct(product: Product): Promise<void> {
    try {
      await this.updateDocument('products', product.id, {
        doc: {
          title: product.title,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          categories: product.categories,
          tags: product.tags,
          merchantId: product.merchantId,
          brandName: product.brandName,
          isActive: product.isActive,
          inStock: product.inStock,
          quantity: product.quantity,
          values: product.values,
          updatedAt: product.updatedAt,
          isOnSale: product.compareAtPrice !== null && product.price < product.compareAtPrice,
        },
      });
    } catch (error) {
      this._logger.error(`Failed to update product ${product.id}: ${error.message}`);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.deleteDocument('products', productId);
    } catch (error) {
      this._logger.error(`Failed to delete product ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for products with advanced filtering and sorting
   */
  public async searchProducts(
    query: string,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    },
    page = 1,
    limit = 10,
    sort?: { field: string; order: 'asc' | 'desc' },
  ): Promise<{ items: any[]; total: number }> {
    try {
      // Use the buildProductSearchQuery method to create the query
      const searchQuery = this.buildProductSearchQuery(query, filters, page, limit, sort);

      // Execute the search query
      return await this.performSearch('products', searchQuery);
    } catch (error) {
      this._logger.error(`Failed to search products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get product suggestions for autocomplete
   */
  public async getProductSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      const response = await this._client.search({
        index: 'products',
        body: {
          size: 0,
          suggest: {
            text: query,
            title_suggestions: {
              term: {
                field: 'title',
                suggest_mode: 'always',
                sort: 'frequency',
                size: limit,
              },
            },
          },
        },
      });

      // Extract suggestions from response
      let suggestions: any[] = [];
      if (response.suggest) {
        Object.values(response.suggest).forEach(suggestionCategory => {
          if (Array.isArray(suggestionCategory)) {
            suggestions = suggestions.concat(
              suggestionCategory.flatMap(suggestion => suggestion.options),
            );
          }
        });
      }

      return suggestions.map(option => option.text) || [];
    } catch (error) {
      this._logger.error(`Failed to get product suggestions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reindex all products
   */
  public async reindexAllProducts(products: Product[]): Promise<void> {
    try {
      // 1. Delete the existing index
      const exists = await this.indexExists('products');
      if (exists) {
        await this.deleteIndex('products');
        this._logger.log('Deleted existing products index.');
      }

      // 2. Create a new index with the mapping
      await this.createIndex('products');
      this._logger.log('Created new products index.');

      // 3. Bulk index all products
      await this.bulkIndexProducts(products);
      this._logger.log(`Successfully reindexed ${products.length} products.`);
    } catch (error) {
      this._logger.error(`Failed during reindexing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get related products based on a source product
   */
  public async getRelatedProducts(productId: string, limit = 5): Promise<any[]> {
    try {
      // First, get the source product to find related terms (e.g., categories, tags)
      const productResponse = await this._client.get({
        index: 'products',
        id: productId,
      });

      if (!productResponse._source) {
        this._logger.warn(`Product ${productId} not found for related search.`);
        return [];
      }

      const sourceProduct = productResponse._source as any;
      const likeTexts = [
        sourceProduct.title,
        sourceProduct.description,
        ...(sourceProduct.categories || []),
        ...(sourceProduct.tags || []),
      ].filter(Boolean);

      if (likeTexts.length === 0) {
        return []; // Cannot perform More Like This without fields
      }

      const searchQuery = {
        size: limit,
        query: {
          bool: {
            must_not: [
              {
                term: {
                  id: productId,
                },
              },
            ],
            should: [
              {
                more_like_this: {
                  fields: ['title', 'description', 'categories', 'tags'],
                  like: likeTexts,
                  min_term_freq: 1,
                  max_query_terms: 12,
                },
              },
            ],
            filter: [
              {
                term: {
                  isActive: true,
                },
              },
              {
                term: {
                  inStock: true,
                },
              },
            ],
          },
        },
      };

      const result = await this.performSearch('products', searchQuery);
      return result.items;
    } catch (error) {
      // If the error is 'Not Found', it's expected if the product doesn't exist
      if (error && error.meta?.statusCode === 404) {
        this._logger.warn(`Product ${productId} not found for related search.`);
        return [];
      }
      this._logger.error(`Failed to get related products for ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get trending products
   */
  public async getTrendingProducts(limit = 10): Promise<any[]> {
    // Simple trending: recently added active products
    try {
      const searchQuery = {
        size: limit,
        query: {
          bool: {
            filter: [
              {
                term: {
                  isActive: true,
                },
              },
            ],
          },
        },
        sort: [
          {
            createdAt: {
              order: 'desc',
            },
          },
        ],
      };

      const result = await this.performSearch('products', searchQuery);
      return result.items;
    } catch (error) {
      this._logger.error(`Failed to get trending products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get discovery products with personalization
   */
  public async getDiscoveryProducts(
    userId?: string,
    limit = 10,
    values?: string[],
  ): Promise<any[]> {
    // In a real implementation, this would use user behavior data
    // For now, we'll return a mix of products with priority on values
    try {
      const should = [];

      if (values && values.length > 0) {
        should.push({
          terms: {
            'values.keyword': values,
            boost: 2.0,
          },
        });
      }

      const searchQuery = {
        size: limit,
        query: {
          function_score: {
            query: {
              bool: {
                filter: [
                  {
                    term: {
                      isActive: true,
                    },
                  },
                ],
                should,
              },
            },
            functions: [
              {
                random_score: {
                  seed: userId || Date.now().toString(),
                },
                weight: 1.5,
              },
            ],
            score_mode: 'sum',
            boost_mode: 'multiply',
          },
        },
      };

      const result = await this.performSearch('products', searchQuery);
      return result.items;
    } catch (error) {
      this._logger.error(`Failed to get discovery products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Builds a product search query with filters, pagination, and sorting
   * This is separated from searchProducts to allow for query enhancement before execution
   *
   * @param query The search query string
   * @param filters Optional filters to apply to the search
   * @param page The page number for pagination
   * @param limit The number of results per page
   * @param sort Optional sorting parameters
   * @returns An Elasticsearch query body object
   */
  public buildProductSearchQuery(
    query: string,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
      brandName?: string;
    },
    page = 1,
    limit = 10,
    sort?: { field: string; order: 'asc' | 'desc' },
  ): any {
    // Calculate from for pagination
    const from = (page - 1) * limit;

    // Build the query
    const must: any[] = [];
    const filter: any[] = [];

    // Add text search if query is provided
    if (query && query.trim() !== '') {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description^2', 'brandName^2', 'categories', 'tags', 'values'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    } else {
      // If no query, match all documents
      must.push({ match_all: {} });
    }

    // Add filters if provided
    if (filters) {
      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        filter.push({
          terms: { 'categories.keyword': filters.categories },
        });
      }

      // Filter by price range
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const range: any = {};
        if (filters.priceMin !== undefined) {
          range.gte = filters.priceMin;
        }
        if (filters.priceMax !== undefined) {
          range.lte = filters.priceMax;
        }
        filter.push({ range: { price: range } });
      }

      // Filter by merchant
      if (filters.merchantId) {
        filter.push({
          term: { merchantId: filters.merchantId },
        });
      }

      // Filter by stock status
      if (filters.inStock !== undefined) {
        filter.push({
          term: { inStock: filters.inStock },
        });
      }

      // Filter by values (product attributes)
      if (filters.values && filters.values.length > 0) {
        filter.push({
          terms: { 'values.keyword': filters.values },
        });
      }

      // Filter by brand name
      if (filters.brandName) {
        filter.push({
          term: { 'brandName.keyword': filters.brandName },
        });
      }
    }

    // Always filter for active products
    filter.push({
      term: { isActive: true },
    });

    // Build the full query
    const queryBody: any = {
      from,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      // Add highlighting
      highlight: {
        fields: {
          title: {},
          description: {},
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
    };

    // Add sorting if provided
    if (sort) {
      queryBody.sort = [{ [sort.field]: { order: sort.order } }];
    } else if (!query || query.trim() === '') {
      // Default sort by createdAt desc if no query
      queryBody.sort = [{ createdAt: { order: 'desc' } }];
    }

    return queryBody;
  }

  /**
   * Performs a generic search query against Elasticsearch.
   * Used internally by other services that need direct search access.
   *
   * @param index The Elasticsearch index to search against.
   * @param body The Elasticsearch query body.
   * @returns The raw Elasticsearch search response.
   */
  public async performSearch(index: string, body: any): Promise<any> {
    try {
      const response = await this._client.search({
        index,
        body,
      });

      // Process the response to return a standardized format
      const hits = response.hits?.hits || [];
      const total = response.hits?.total
        ? typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total.value
        : 0;

      const items = hits.map((hit: any) => {
        const source = hit._source;
        const highlight = hit.highlight;

        // Add score and highlight information to the result
        return {
          ...source,
          _score: hit._score,
          highlight: highlight || {},
        };
      });

      return { items, total };
    } catch (error) {
      this._logger.error(`Failed to perform search on index ${index}: ${error.message}`);
      throw error;
    }
  }

  async searchMerchants(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: any[]; total: number }> {
    try {
      const from = (page - 1) * limit;

      const response = await this._client.search({
        index: 'merchants',
        body: {
          from,
          size: limit,
          query: {
            bool: {
              must: query
                ? [
                    {
                      multi_match: {
                        query,
                        fields: ['name^3', 'description', 'location', 'values', 'categories'],
                        fuzziness: 'AUTO',
                      },
                    },
                  ]
                : [],
              filter: [
                {
                  term: {
                    isActive: true,
                  },
                },
              ],
            },
          },
          sort: [
            {
              createdAt: {
                order: 'desc',
              },
            },
          ],
        },
      });

      const hits = response.hits.hits;

      const items = hits.map(hit => hit._source);

      return { items, total: hits.length };
    } catch (error) {
      this._logger.error(`Failed to search merchants: ${error.message}`);
      throw error;
    }
  }

  async searchBrands(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: any[]; total: number }> {
    try {
      const from = (page - 1) * limit;

      const response = await this._client.search({
        index: 'brands',
        body: {
          from,
          size: limit,
          query: {
            bool: {
              must: query
                ? [
                    {
                      multi_match: {
                        query,
                        fields: ['name^3', 'description', 'location', 'values', 'categories'],
                        fuzziness: 'AUTO',
                      },
                    },
                  ]
                : [],
              filter: [
                {
                  term: {
                    isActive: true,
                  },
                },
              ],
            },
          },
          sort: [
            {
              createdAt: {
                order: 'desc',
              },
            },
          ],
        },
      });

      const hits = response.hits.hits;

      const items = hits.map(hit => hit._source);

      return { items, total: hits.length };
    } catch (error) {
      this._logger.error(`Failed to search brands: ${error.message}`);
      throw error;
    }
  }

  // --- Document Operations ---

  /**
   * Index a single document.
   */
  public async indexDocument(
    index: string,
    id: string,
    body: any,
    refresh: boolean | 'wait_for' = false,
  ): Promise<any> {
    try {
      return await this._client.index({ index, id, body, refresh });
    } catch (error) {
      this._logger.error(`Failed to index document ${id} in index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a single document.
   */
  public async updateDocument(
    index: string,
    id: string,
    body: any, // Should contain { doc: ... } or script
    refresh: boolean | 'wait_for' = false,
  ): Promise<any> {
    try {
      return await this._client.update({ index, id, body, refresh });
    } catch (error) {
      // Specific handling for 404 might be needed in the caller
      this._logger.error(`Failed to update document ${id} in index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a single document.
   */
  public async deleteDocument(
    index: string,
    id: string,
    refresh: boolean | 'wait_for' = false,
  ): Promise<any> {
    try {
      return await this._client.delete({ index, id, refresh });
    } catch (error) {
      // Specific handling for 404 might be needed in the caller
      this._logger.error(`Failed to delete document ${id} from index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform a bulk operation.
   */
  public async bulkOperation(body: any[], refresh: boolean | 'wait_for' = false): Promise<any> {
    try {
      return await this._client.bulk({ body, refresh });
    } catch (error) {
      this._logger.error(`Failed to perform bulk operation: ${error.message}`);
      throw error;
    }
  }

  // --- Indices Operations ---

  /**
   * Check if an index exists.
   */
  public async indexExists(index: string): Promise<boolean> {
    try {
      await this._client.indices.exists({ index });
      return true;
    } catch (error) {
      // A 404 status code means it doesn't exist, not an error in this context
      // Safely check for the 404 status code by checking property existence
      if (error && typeof error === 'object' && error.meta?.statusCode === 404) {
        return false;
      }
      this._logger.error(`Failed to check existence of index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create an index.
   */
  public async createIndex(
    index: string,
    mappings?: Record<string, any>,
    settings?: Record<string, any>,
  ): Promise<any> {
    try {
      const body: any = {};
      if (settings) {
        body.settings = settings;
      }
      // Use the internal _getMappingForIndex to ensure consistency
      body.mappings = mappings ?? (await this._getMappingForIndex(index));

      return await this._client.indices.create({ index, body });
    } catch (error) {
      this._logger.error(`Failed to create index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an index.
   */
  public async deleteIndex(index: string): Promise<any> {
    try {
      return await this._client.indices.delete({ index });
    } catch (error) {
      // Ignore 404 if index doesn't exist
      if (error && error.meta?.statusCode === 404) {
        this._logger.warn(`Index ${index} not found, skipping deletion.`);
        return null; // Or indicate success differently
      }
      this._logger.error(`Failed to delete index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update index aliases.
   */
  public async updateAliases(body: any): Promise<any> {
    try {
      return await this._client.indices.updateAliases({ body });
    } catch (error) {
      this._logger.error(`Failed to update aliases: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the mapping for a specific index.
   */
  public async getIndexMapping(index: string): Promise<Record<string, any>> {
    // Simply call the existing private method
    return this._getMappingForIndex(index);
  }

  /**
   * Update index settings.
   */
  public async updateIndexSettings(index: string, body: any): Promise<any> {
    try {
      return await this._client.indices.putSettings({ index, body });
    } catch (error) {
      this._logger.error(`Failed to update settings for index ${index}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refresh an index.
   */
  public async refreshIndex(index: string): Promise<any> {
    try {
      return await this._client.indices.refresh({ index });
    } catch (error) {
      this._logger.error(`Failed to refresh index ${index}: ${error.message}`);
      throw error;
    }
  }
}
