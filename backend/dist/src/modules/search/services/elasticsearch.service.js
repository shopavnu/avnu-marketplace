'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var ElasticsearchService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ElasticsearchService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const elasticsearch_1 = require('@elastic/elasticsearch');
let ElasticsearchService = (ElasticsearchService_1 = class ElasticsearchService {
  constructor(configService) {
    this.configService = configService;
    this._logger = new common_1.Logger(ElasticsearchService_1.name);
    this._client = new elasticsearch_1.Client({
      node: this.configService.get('ELASTICSEARCH_NODE'),
      auth: {
        username: this.configService.get('ELASTICSEARCH_USERNAME'),
        password: this.configService.get('ELASTICSEARCH_PASSWORD'),
      },
    });
  }
  async onModuleInit() {
    try {
      await this._client.ping();
      this._logger.log('Successfully connected to Elasticsearch');
      await this._createIndices();
    } catch (error) {
      this._logger.error(`Failed to connect to Elasticsearch: ${error.message}`);
    }
  }
  async _createIndices() {
    const indices = ['products', 'merchants', 'brands'];
    for (const index of indices) {
      const exists = await this.indexExists(index);
      if (!exists) {
        await this.createIndex(index);
        this._logger.log(`Created index: ${index}`);
      }
    }
  }
  _getMappingForIndex(index) {
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
  async indexProduct(product) {
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
  async bulkIndexProducts(products) {
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
  async updateProduct(product) {
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
  async deleteProduct(productId) {
    try {
      await this.deleteDocument('products', productId);
    } catch (error) {
      this._logger.error(`Failed to delete product ${productId}: ${error.message}`);
      throw error;
    }
  }
  async searchProducts(query, filters, page = 1, limit = 10, sort) {
    try {
      const searchQuery = this.buildProductSearchQuery(query, filters, page, limit, sort);
      return await this.performSearch('products', searchQuery);
    } catch (error) {
      this._logger.error(`Failed to search products: ${error.message}`);
      throw error;
    }
  }
  async getProductSuggestions(query, limit = 5) {
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
      let suggestions = [];
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
  async reindexAllProducts(products) {
    try {
      const exists = await this.indexExists('products');
      if (exists) {
        await this.deleteIndex('products');
        this._logger.log('Deleted existing products index.');
      }
      await this.createIndex('products');
      this._logger.log('Created new products index.');
      await this.bulkIndexProducts(products);
      this._logger.log(`Successfully reindexed ${products.length} products.`);
    } catch (error) {
      this._logger.error(`Failed during reindexing: ${error.message}`);
      throw error;
    }
  }
  async getRelatedProducts(productId, limit = 5) {
    try {
      const productResponse = await this._client.get({
        index: 'products',
        id: productId,
      });
      if (!productResponse._source) {
        this._logger.warn(`Product ${productId} not found for related search.`);
        return [];
      }
      const sourceProduct = productResponse._source;
      const likeTexts = [
        sourceProduct.title,
        sourceProduct.description,
        ...(sourceProduct.categories || []),
        ...(sourceProduct.tags || []),
      ].filter(Boolean);
      if (likeTexts.length === 0) {
        return [];
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
      if (error && error.meta?.statusCode === 404) {
        this._logger.warn(`Product ${productId} not found for related search.`);
        return [];
      }
      this._logger.error(`Failed to get related products for ${productId}: ${error.message}`);
      throw error;
    }
  }
  async getTrendingProducts(limit = 10) {
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
  async getDiscoveryProducts(userId, limit = 10, values) {
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
  buildProductSearchQuery(query, filters, page = 1, limit = 10, sort) {
    const from = (page - 1) * limit;
    const must = [];
    const filter = [];
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
      must.push({ match_all: {} });
    }
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        filter.push({
          terms: { 'categories.keyword': filters.categories },
        });
      }
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const range = {};
        if (filters.priceMin !== undefined) {
          range.gte = filters.priceMin;
        }
        if (filters.priceMax !== undefined) {
          range.lte = filters.priceMax;
        }
        filter.push({ range: { price: range } });
      }
      if (filters.merchantId) {
        filter.push({
          term: { merchantId: filters.merchantId },
        });
      }
      if (filters.inStock !== undefined) {
        filter.push({
          term: { inStock: filters.inStock },
        });
      }
      if (filters.values && filters.values.length > 0) {
        filter.push({
          terms: { 'values.keyword': filters.values },
        });
      }
      if (filters.brandName) {
        filter.push({
          term: { 'brandName.keyword': filters.brandName },
        });
      }
    }
    filter.push({
      term: { isActive: true },
    });
    const queryBody = {
      from,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      highlight: {
        fields: {
          title: {},
          description: {},
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
    };
    if (sort) {
      queryBody.sort = [{ [sort.field]: { order: sort.order } }];
    } else if (!query || query.trim() === '') {
      queryBody.sort = [{ createdAt: { order: 'desc' } }];
    }
    return queryBody;
  }
  async performSearch(index, body) {
    try {
      const response = await this._client.search({
        index,
        body,
      });
      const hits = response.hits?.hits || [];
      const total = response.hits?.total
        ? typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total.value
        : 0;
      const items = hits.map(hit => {
        const source = hit._source;
        const highlight = hit.highlight;
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
  async searchMerchants(query, page = 1, limit = 10) {
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
  async searchBrands(query, page = 1, limit = 10) {
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
  async indexDocument(index, id, body, refresh = false) {
    try {
      return await this._client.index({ index, id, body, refresh });
    } catch (error) {
      this._logger.error(`Failed to index document ${id} in index ${index}: ${error.message}`);
      throw error;
    }
  }
  async updateDocument(index, id, body, refresh = false) {
    try {
      return await this._client.update({ index, id, body, refresh });
    } catch (error) {
      this._logger.error(`Failed to update document ${id} in index ${index}: ${error.message}`);
      throw error;
    }
  }
  async deleteDocument(index, id, refresh = false) {
    try {
      return await this._client.delete({ index, id, refresh });
    } catch (error) {
      this._logger.error(`Failed to delete document ${id} from index ${index}: ${error.message}`);
      throw error;
    }
  }
  async bulkOperation(body, refresh = false) {
    try {
      return await this._client.bulk({ body, refresh });
    } catch (error) {
      this._logger.error(`Failed to perform bulk operation: ${error.message}`);
      throw error;
    }
  }
  async indexExists(index) {
    try {
      await this._client.indices.exists({ index });
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && error.meta?.statusCode === 404) {
        return false;
      }
      this._logger.error(`Failed to check existence of index ${index}: ${error.message}`);
      throw error;
    }
  }
  async createIndex(index, mappings, settings) {
    try {
      const body = {};
      if (settings) {
        body.settings = settings;
      }
      body.mappings = mappings ?? (await this._getMappingForIndex(index));
      return await this._client.indices.create({ index, body });
    } catch (error) {
      this._logger.error(`Failed to create index ${index}: ${error.message}`);
      throw error;
    }
  }
  async deleteIndex(index) {
    try {
      return await this._client.indices.delete({ index });
    } catch (error) {
      if (error && error.meta?.statusCode === 404) {
        this._logger.warn(`Index ${index} not found, skipping deletion.`);
        return null;
      }
      this._logger.error(`Failed to delete index ${index}: ${error.message}`);
      throw error;
    }
  }
  async updateAliases(body) {
    try {
      return await this._client.indices.updateAliases({ body });
    } catch (error) {
      this._logger.error(`Failed to update aliases: ${error.message}`);
      throw error;
    }
  }
  async getIndexMapping(index) {
    return this._getMappingForIndex(index);
  }
  async updateIndexSettings(index, body) {
    try {
      return await this._client.indices.putSettings({ index, body });
    } catch (error) {
      this._logger.error(`Failed to update settings for index ${index}: ${error.message}`);
      throw error;
    }
  }
  async refreshIndex(index) {
    try {
      return await this._client.indices.refresh({ index });
    } catch (error) {
      this._logger.error(`Failed to refresh index ${index}: ${error.message}`);
      throw error;
    }
  }
});
exports.ElasticsearchService = ElasticsearchService;
exports.ElasticsearchService =
  ElasticsearchService =
  ElasticsearchService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      ElasticsearchService,
    );
//# sourceMappingURL=elasticsearch.service.js.map
