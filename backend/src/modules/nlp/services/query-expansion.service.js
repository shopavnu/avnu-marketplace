'use strict';
var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context,
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.QueryExpansionService = void 0;
var common_1 = require('@nestjs/common');
var natural = require('natural');
var QueryExpansionService = (function () {
  var _classDecorators = [(0, common_1.Injectable)()];
  var _classDescriptor;
  var _classExtraInitializers = [];
  var _classThis;
  var QueryExpansionService = (_classThis = /** @class */ (function () {
    function QueryExpansionService_1(configService, elasticsearchService) {
      this.configService = configService;
      this.elasticsearchService = elasticsearchService;
      this.logger = new common_1.Logger(QueryExpansionService.name);
      // Initialize WordNet
      this.wordnet = new natural.WordNet();
      // Initialize synonym sets
      this.synonymSets = new Map();
      // Load domain-specific synonyms
      this.domainSpecificSynonyms = {
        // Fashion/Clothing
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
      // Configuration
      this.expansionEnabled = this.configService.get('nlp.enableQueryExpansion', true);
      this.maxSynonymsPerTerm = this.configService.get('nlp.maxSynonymsPerTerm', 3);
      this.maxExpansionTerms = this.configService.get('nlp.maxExpansionTerms', 5);
    }
    /**
     * Expand a query with synonyms and related terms
     * @param query The original query
     * @param tokens The tokenized query
     */
    QueryExpansionService_1.prototype.expandQuery = function (query, tokens) {
      return __awaiter(this, void 0, void 0, function () {
        var expansionSource,
          expandedTerms,
          _i,
          tokens_1,
          token,
          synonyms,
          wordnetSynonyms,
          token,
          elasticsearchTerms,
          expandedQuery,
          error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!this.expansionEnabled || tokens.length === 0) {
                return [
                  2 /*return*/,
                  {
                    expandedQuery: query,
                    expandedTerms: [],
                    expansionSource: {},
                  },
                ];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              expansionSource = {};
              expandedTerms = [];
              // 1. Domain-specific synonyms (highest priority)
              for (_i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
                token = tokens_1[_i];
                if (this.domainSpecificSynonyms[token.toLowerCase()]) {
                  synonyms = this.domainSpecificSynonyms[token.toLowerCase()].slice(
                    0,
                    this.maxSynonymsPerTerm,
                  );
                  expansionSource[token] = __spreadArray(
                    __spreadArray([], expansionSource[token] || [], true),
                    synonyms,
                    true,
                  );
                  expandedTerms = __spreadArray(
                    __spreadArray([], expandedTerms, true),
                    synonyms,
                    true,
                  );
                }
              }
              return [4 /*yield*/, this.getWordNetSynonyms(tokens)];
            case 2:
              wordnetSynonyms = _a.sent();
              for (token in wordnetSynonyms) {
                expansionSource[token] = __spreadArray(
                  __spreadArray([], expansionSource[token] || [], true),
                  wordnetSynonyms[token],
                  true,
                );
                expandedTerms = __spreadArray(
                  __spreadArray([], expandedTerms, true),
                  wordnetSynonyms[token],
                  true,
                );
              }
              return [4 /*yield*/, this.getElasticsearchRelatedTerms(query)];
            case 3:
              elasticsearchTerms = _a.sent();
              if (elasticsearchTerms.length > 0) {
                expansionSource['elasticsearch'] = elasticsearchTerms;
                expandedTerms = __spreadArray(
                  __spreadArray([], expandedTerms, true),
                  elasticsearchTerms,
                  true,
                );
              }
              // Deduplicate and limit
              expandedTerms = __spreadArray([], new Set(expandedTerms), true).slice(
                0,
                this.maxExpansionTerms,
              );
              expandedQuery = this.buildExpandedQuery(query, expandedTerms);
              return [
                2 /*return*/,
                {
                  expandedQuery: expandedQuery,
                  expandedTerms: expandedTerms,
                  expansionSource: expansionSource,
                },
              ];
            case 4:
              error_1 = _a.sent();
              this.logger.error('Failed to expand query: '.concat(error_1.message));
              return [
                2 /*return*/,
                {
                  expandedQuery: query,
                  expandedTerms: [],
                  expansionSource: {},
                },
              ];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    };
    /**
     * Get synonyms from WordNet
     * @param tokens The tokens to get synonyms for
     */
    QueryExpansionService_1.prototype.getWordNetSynonyms = function (tokens) {
      var _this = this;
      return new Promise(function (resolve) {
        var synonyms = {};
        var pendingRequests = tokens.length;
        if (pendingRequests === 0) {
          resolve(synonyms);
          return;
        }
        var _loop_1 = function (token) {
          // Check if we already have synonyms for this token
          if (_this.synonymSets.has(token)) {
            synonyms[token] = _this.synonymSets.get(token).slice(0, _this.maxSynonymsPerTerm);
            pendingRequests--;
            if (pendingRequests === 0) {
              resolve(synonyms);
            }
            return 'continue';
          }
          // Look up synonyms in WordNet
          _this.wordnet.lookup(token, function (results) {
            var tokenSynonyms = new Set();
            for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
              var result = results_1[_i];
              if (result.synonyms) {
                for (var _a = 0, _b = result.synonyms; _a < _b.length; _a++) {
                  var synonym = _b[_a];
                  // Filter out multi-word synonyms and the original token
                  if (synonym !== token && !synonym.includes('_')) {
                    tokenSynonyms.add(synonym);
                  }
                }
              }
            }
            var tokenSynonymsArray = Array.from(tokenSynonyms).slice(0, _this.maxSynonymsPerTerm);
            _this.synonymSets.set(token, tokenSynonymsArray);
            synonyms[token] = tokenSynonymsArray;
            pendingRequests--;
            if (pendingRequests === 0) {
              resolve(synonyms);
            }
          });
        };
        for (var _i = 0, tokens_2 = tokens; _i < tokens_2.length; _i++) {
          var token = tokens_2[_i];
          _loop_1(token);
        }
      });
    };
    /**
     * Get related terms from Elasticsearch
     * @param query The original query
     */
    QueryExpansionService_1.prototype.getElasticsearchRelatedTerms = function (query) {
      return __awaiter(this, void 0, void 0, function () {
        var response, aggregations, anyResponse, buckets, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                this.elasticsearchService.search({
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
                }),
              ];
            case 1:
              response = _c.sent();
              aggregations = void 0;
              // TypeScript-safe way to check for properties
              if ('aggregations' in response && response.aggregations) {
                // Elasticsearch 8.x format
                aggregations = response.aggregations;
              } else {
                anyResponse = response;
                aggregations =
                  (_a = anyResponse.body) === null || _a === void 0 ? void 0 : _a.aggregations;
              }
              buckets =
                ((_b =
                  aggregations === null || aggregations === void 0
                    ? void 0
                    : aggregations.significant_terms) === null || _b === void 0
                  ? void 0
                  : _b.buckets) || [];
              return [
                2 /*return*/,
                buckets
                  .map(function (bucket) {
                    return bucket.key;
                  })
                  .slice(0, this.maxExpansionTerms),
              ];
            case 2:
              error_2 = _c.sent();
              this.logger.error(
                'Failed to get Elasticsearch related terms: '.concat(error_2.message),
              );
              return [2 /*return*/, []];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    };
    /**
     * Build an expanded query with original query and expansion terms
     * @param originalQuery The original query
     * @param expansionTerms The expansion terms
     */
    QueryExpansionService_1.prototype.buildExpandedQuery = function (
      originalQuery,
      expansionTerms,
    ) {
      if (expansionTerms.length === 0) {
        return originalQuery;
      }
      // Build Elasticsearch-style expanded query
      // Original query gets higher boost, expansion terms get lower boost
      return ''.concat(originalQuery, ' ').concat(expansionTerms.join(' '));
    };
    /**
     * Get expansion information for debugging and analytics
     * @param query The original query
     * @param tokens The tokenized query
     */
    QueryExpansionService_1.prototype.getExpansionInfo = function (query, tokens) {
      return __awaiter(this, void 0, void 0, function () {
        var expansion;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, this.expandQuery(query, tokens)];
            case 1:
              expansion = _a.sent();
              return [
                2 /*return*/,
                {
                  originalQuery: query,
                  expandedQuery: expansion.expandedQuery,
                  expansionTerms: expansion.expandedTerms,
                  expansionSources: expansion.expansionSource,
                },
              ];
          }
        });
      });
    };
    return QueryExpansionService_1;
  })());
  __setFunctionName(_classThis, 'QueryExpansionService');
  (function () {
    var _metadata = typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers,
    );
    QueryExpansionService = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (QueryExpansionService = _classThis);
})();
exports.QueryExpansionService = QueryExpansionService;
