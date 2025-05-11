'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
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
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var QueryExpansionService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.QueryExpansionService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const natural = __importStar(require('natural'));
const elasticsearch_1 = require('@nestjs/elasticsearch');
let QueryExpansionService = (QueryExpansionService_1 = class QueryExpansionService {
  constructor(configService, elasticsearchService) {
    this.configService = configService;
    this.elasticsearchService = elasticsearchService;
    this.logger = new common_1.Logger(QueryExpansionService_1.name);
    this.wordnet = new natural.WordNet();
    this.synonymSets = new Map();
    this.domainSpecificSynonyms = {
      shirt: ['tee', 't-shirt', 'top', 'blouse'],
      pants: ['trousers', 'jeans', 'slacks', 'leggings'],
      shoes: ['footwear', 'sneakers', 'boots', 'sandals'],
      dress: ['gown', 'frock', 'outfit'],
      jacket: ['coat', 'blazer', 'outerwear'],
      sustainable: ['eco-friendly', 'green', 'ethical', 'environmentally friendly'],
      organic: ['natural', 'chemical-free', 'pesticide-free'],
      vegan: ['plant-based', 'cruelty-free', 'animal-free'],
      handmade: ['artisanal', 'handcrafted', 'custom-made'],
      'fair trade': ['ethically sourced', 'ethical trade', 'fair price'],
      recycled: ['upcycled', 'repurposed', 'reclaimed'],
      local: ['community-made', 'locally sourced', 'locally made'],
      'small batch': ['limited edition', 'artisanal', 'handcrafted'],
      affordable: ['budget', 'inexpensive', 'economical', 'cheap'],
      premium: ['luxury', 'high-end', 'designer', 'exclusive'],
      sale: ['discount', 'clearance', 'reduced', 'deal'],
      new: ['latest', 'fresh', 'just in', 'new arrival'],
      popular: ['trending', 'bestselling', 'hot', 'in demand'],
    };
    this.expansionEnabled = this.configService.get('nlp.enableQueryExpansion', true);
    this.maxSynonymsPerTerm = this.configService.get('nlp.maxSynonymsPerTerm', 3);
    this.maxExpansionTerms = this.configService.get('nlp.maxExpansionTerms', 5);
  }
  async expandQuery(query, tokens) {
    if (!this.expansionEnabled || tokens.length === 0) {
      return {
        expandedQuery: query,
        expandedTerms: [],
        expansionSource: {},
      };
    }
    try {
      const expansionSource = {};
      let expandedTerms = [];
      for (const token of tokens) {
        if (this.domainSpecificSynonyms[token.toLowerCase()]) {
          const synonyms = this.domainSpecificSynonyms[token.toLowerCase()].slice(
            0,
            this.maxSynonymsPerTerm,
          );
          expansionSource[token] = [...(expansionSource[token] || []), ...synonyms];
          expandedTerms = [...expandedTerms, ...synonyms];
        }
      }
      const wordnetSynonyms = await this.getWordNetSynonyms(tokens);
      for (const token in wordnetSynonyms) {
        expansionSource[token] = [...(expansionSource[token] || []), ...wordnetSynonyms[token]];
        expandedTerms = [...expandedTerms, ...wordnetSynonyms[token]];
      }
      const elasticsearchTerms = await this.getElasticsearchRelatedTerms(query);
      if (elasticsearchTerms.length > 0) {
        expansionSource['elasticsearch'] = elasticsearchTerms;
        expandedTerms = [...expandedTerms, ...elasticsearchTerms];
      }
      expandedTerms = [...new Set(expandedTerms)].slice(0, this.maxExpansionTerms);
      const expandedQuery = this.buildExpandedQuery(query, expandedTerms);
      return {
        expandedQuery,
        expandedTerms,
        expansionSource,
      };
    } catch (error) {
      this.logger.error(`Failed to expand query: ${error.message}`);
      return {
        expandedQuery: query,
        expandedTerms: [],
        expansionSource: {},
      };
    }
  }
  getWordNetSynonyms(tokens) {
    return new Promise(resolve => {
      const synonyms = {};
      let pendingRequests = tokens.length;
      if (pendingRequests === 0) {
        resolve(synonyms);
        return;
      }
      for (const token of tokens) {
        if (this.synonymSets.has(token)) {
          synonyms[token] = this.synonymSets.get(token).slice(0, this.maxSynonymsPerTerm);
          pendingRequests--;
          if (pendingRequests === 0) {
            resolve(synonyms);
          }
          continue;
        }
        this.wordnet.lookup(token, results => {
          const tokenSynonyms = new Set();
          for (const result of results) {
            if (result.synonyms) {
              for (const synonym of result.synonyms) {
                if (synonym !== token && !synonym.includes('_')) {
                  tokenSynonyms.add(synonym);
                }
              }
            }
          }
          const tokenSynonymsArray = Array.from(tokenSynonyms).slice(0, this.maxSynonymsPerTerm);
          this.synonymSets.set(token, tokenSynonymsArray);
          synonyms[token] = tokenSynonymsArray;
          pendingRequests--;
          if (pendingRequests === 0) {
            resolve(synonyms);
          }
        });
      }
    });
  }
  async getElasticsearchRelatedTerms(query) {
    try {
      const response = await this.elasticsearchService.search({
        index: 'products',
        size: 0,
        query: {
          match: {
            description: query,
          },
        },
        aggs: {
          significant_terms: {
            significant_terms: {
              field: 'description',
              size: this.maxExpansionTerms,
            },
          },
        },
      });
      let aggregations;
      if ('aggregations' in response && response.aggregations) {
        aggregations = response.aggregations;
      } else {
        const anyResponse = response;
        aggregations = anyResponse.body?.aggregations;
      }
      const buckets = aggregations?.significant_terms?.buckets || [];
      return buckets.map(bucket => bucket.key).slice(0, this.maxExpansionTerms);
    } catch (error) {
      this.logger.error(`Failed to get Elasticsearch related terms: ${error.message}`);
      return [];
    }
  }
  buildExpandedQuery(originalQuery, expansionTerms) {
    if (expansionTerms.length === 0) {
      return originalQuery;
    }
    return `${originalQuery} ${expansionTerms.join(' ')}`;
  }
  async getExpansionInfo(query, tokens) {
    const expansion = await this.expandQuery(query, tokens);
    return {
      originalQuery: query,
      expandedQuery: expansion.expandedQuery,
      expansionTerms: expansion.expandedTerms,
      expansionSources: expansion.expansionSource,
    };
  }
});
exports.QueryExpansionService = QueryExpansionService;
exports.QueryExpansionService =
  QueryExpansionService =
  QueryExpansionService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          elasticsearch_1.ElasticsearchService,
        ]),
      ],
      QueryExpansionService,
    );
//# sourceMappingURL=query-expansion.service.js.map
