'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.SearchRelevanceService = exports.RelevanceAlgorithm = void 0;
var common_1 = require('@nestjs/common');
/**
 * Types of search relevance algorithms that can be tested
 */
var RelevanceAlgorithm;
(function (RelevanceAlgorithm) {
  RelevanceAlgorithm['STANDARD'] = 'standard';
  RelevanceAlgorithm['INTENT_BOOSTED'] = 'intent';
  RelevanceAlgorithm['USER_PREFERENCE'] = 'preference';
  RelevanceAlgorithm['HYBRID'] = 'hybrid';
  RelevanceAlgorithm['SEMANTIC'] = 'semantic'; // Semantic similarity-based
})(RelevanceAlgorithm || (exports.RelevanceAlgorithm = RelevanceAlgorithm = {}));
/**
 * Service for enhancing search relevance with advanced scoring,
 * user preference-based boosting, and A/B testing capabilities
 */
var SearchRelevanceService = (function () {
  var _classDecorators = [(0, common_1.Injectable)()];
  var _classDescriptor;
  var _classExtraInitializers = [];
  var _classThis;
  var SearchRelevanceService = (_classThis = /** @class */ (function () {
    function SearchRelevanceService_1(configService, elasticsearchService) {
      this.configService = configService;
      this.elasticsearchService = elasticsearchService;
      this.logger = new common_1.Logger(SearchRelevanceService.name);
      this.scoringProfiles = new Map();
      this.activeABTests = [];
      this.userPreferencesCache = new Map();
      this.initializeScoringProfiles();
      this.loadActiveABTests();
    }
    /**
     * Initialize default scoring profiles
     */
    SearchRelevanceService_1.prototype.initializeScoringProfiles = function () {
      // Standard profile - basic BM25 with field boosts
      this.scoringProfiles.set('standard', {
        name: 'standard',
        boostFactors: {
          name: 3.0,
          description: 1.0,
          categories: 2.0,
          brand: 1.5,
          tags: 1.2,
        },
        functions: [],
        scoreMode: 'multiply',
        boostMode: 'multiply',
      });
      // Popularity profile - incorporates view count and rating
      this.scoringProfiles.set('popularity', {
        name: 'popularity',
        boostFactors: {
          name: 2.0,
          description: 0.8,
          categories: 1.5,
          brand: 1.2,
        },
        functions: [
          {
            type: 'field_value_factor',
            field: 'viewCount',
            factor: 0.1,
            modifier: 'log1p',
            weight: 1.0,
          },
          {
            type: 'field_value_factor',
            field: 'rating',
            factor: 1.0,
            modifier: 'sqrt',
            weight: 2.0,
          },
        ],
        scoreMode: 'sum',
        boostMode: 'multiply',
      });
      // Recency profile - boosts newer products
      this.scoringProfiles.set('recency', {
        name: 'recency',
        boostFactors: {
          name: 2.0,
          description: 1.0,
          categories: 1.5,
        },
        functions: [
          {
            type: 'decay',
            field: 'createdAt',
            factor: 0.5,
            modifier: 'none',
            weight: 2.0,
            params: {
              scale: '30d',
              offset: '0d',
              decay: 0.5,
            },
          },
        ],
        scoreMode: 'multiply',
        boostMode: 'multiply',
      });
      // Intent-based profile - dynamically adjusted based on detected intent
      this.scoringProfiles.set('intent', {
        name: 'intent',
        boostFactors: {
          name: 2.0,
          description: 1.0,
          categories: 1.5,
          brand: 1.2,
          values: 1.0,
        },
        functions: [],
        scoreMode: 'multiply',
        boostMode: 'multiply',
      });
      this.logger.log('Initialized '.concat(this.scoringProfiles.size, ' scoring profiles'));
    };
    /**
     * Load active A/B tests from configuration
     */
    SearchRelevanceService_1.prototype.loadActiveABTests = function () {
      // In a real implementation, these would be loaded from a database or configuration service
      var currentDate = new Date();
      this.activeABTests.push({
        id: 'search-relevance-test-001',
        name: 'Basic vs. Intent-Based Relevance',
        description: 'Testing standard BM25 algorithm against intent-based boosting',
        variants: [
          {
            id: 'control',
            algorithm: RelevanceAlgorithm.STANDARD,
            weight: 50,
          },
          {
            id: 'intent-boosted',
            algorithm: RelevanceAlgorithm.INTENT_BOOSTED,
            weight: 50,
          },
        ],
        startDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        isActive: true,
        analyticsEventName: 'search_relevance_test_001',
      });
      this.activeABTests.push({
        id: 'user-preference-test-001',
        name: 'User Preference Boosting',
        description: 'Testing effectiveness of user preference-based boosting',
        variants: [
          {
            id: 'control',
            algorithm: RelevanceAlgorithm.STANDARD,
            weight: 33,
          },
          {
            id: 'preference-light',
            algorithm: RelevanceAlgorithm.USER_PREFERENCE,
            weight: 33,
            params: {
              preferenceWeight: 0.5,
            },
          },
          {
            id: 'preference-heavy',
            algorithm: RelevanceAlgorithm.USER_PREFERENCE,
            weight: 34,
            params: {
              preferenceWeight: 1.5,
            },
          },
        ],
        startDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endDate: new Date(currentDate.getTime() + 27 * 24 * 60 * 60 * 1000), // 27 days from now
        isActive: true,
        analyticsEventName: 'user_preference_test_001',
      });
      this.logger.log('Loaded '.concat(this.activeABTests.length, ' active A/B tests'));
    };
    /**
     * Get user preferences for personalization
     * In a real implementation, this would fetch from a database or user service
     */
    SearchRelevanceService_1.prototype.getUserPreferences = function (userId) {
      return __awaiter(this, void 0, void 0, function () {
        var mockPreferences;
        return __generator(this, function (_a) {
          // Check cache first
          if (this.userPreferencesCache.has(userId)) {
            return [2 /*return*/, this.userPreferencesCache.get(userId)];
          }
          try {
            mockPreferences = {
              categories: {
                clothing: 0.8,
                accessories: 0.6,
                home: 0.3,
              },
              brands: {
                'eco collective': 0.9,
                'sustainable threads': 0.7,
              },
              priceRanges: [
                { min: 0, max: 50, weight: 0.6 },
                { min: 50, max: 100, weight: 0.8 },
              ],
              values: {
                sustainable: 0.9,
                organic: 0.7,
                vegan: 0.5,
              },
              recentSearches: ['organic cotton t-shirts', 'sustainable dresses', 'recycled denim'],
              recentlyViewedProducts: ['prod-123', 'prod-456', 'prod-789'],
              purchaseHistory: [
                { productId: 'prod-111', timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
              ],
            };
            // Cache the preferences
            this.userPreferencesCache.set(userId, mockPreferences);
            return [2 /*return*/, mockPreferences];
          } catch (error) {
            this.logger.error(
              'Failed to get user preferences for user '.concat(userId, ': ').concat(error.message),
            );
            return [2 /*return*/, null];
          }
          return [2 /*return*/];
        });
      });
    };
    /**
     * Apply scoring profile to Elasticsearch query
     */
    SearchRelevanceService_1.prototype.applyScoringProfile = function (
      query,
      profileName,
      user,
      intent,
      entities,
    ) {
      var profile = this.scoringProfiles.get(profileName);
      if (!profile) {
        this.logger.warn("Scoring profile '".concat(profileName, "' not found, using standard"));
        return query;
      }
      // Create a deep copy of the query to avoid modifying the original
      var scoredQuery = JSON.parse(JSON.stringify(query));
      // Apply field boosts
      if (!scoredQuery.query.bool) {
        scoredQuery.query = {
          bool: {
            must: [scoredQuery.query],
          },
        };
      }
      // Add function score if there are functions or we need to apply boosts
      if (profile.functions.length > 0 || Object.keys(profile.boostFactors).length > 0) {
        var functionScoreQuery = {
          function_score: {
            query: scoredQuery.query,
            functions: __spreadArray([], profile.functions, true),
            score_mode: profile.scoreMode,
            boost_mode: profile.boostMode,
          },
        };
        // Add field-specific boost functions
        for (var _i = 0, _a = Object.entries(profile.boostFactors); _i < _a.length; _i++) {
          var _b = _a[_i],
            field = _b[0],
            boost = _b[1];
          functionScoreQuery.function_score.functions.push(
            __assign(__assign({}, { filter: { exists: { field: field } } }), { weight: boost }),
          );
        }
        // Apply user preference boosting if user is provided
        if (user && profileName === 'preference') {
          this.applyUserPreferenceBoosts(functionScoreQuery, user);
        }
        // Apply intent-based boosting if intent is provided
        if (intent && profileName === 'intent') {
          this.applyIntentBasedBoosts(functionScoreQuery, intent, entities);
        }
        scoredQuery.query = functionScoreQuery;
      }
      return scoredQuery;
    };
    /**
     * Apply user preference-based boosts to the query
     */
    SearchRelevanceService_1.prototype.applyUserPreferenceBoosts = function (query, user) {
      return __awaiter(this, void 0, void 0, function () {
        var preferences,
          functions,
          _i,
          _a,
          _b,
          category,
          weight,
          _c,
          _d,
          _e,
          brand,
          weight,
          _f,
          _g,
          _h,
          value,
          weight,
          _j,
          _k,
          range;
        return __generator(this, function (_l) {
          switch (_l.label) {
            case 0:
              if (!user.id) return [2 /*return*/];
              return [4 /*yield*/, this.getUserPreferences(user.id)];
            case 1:
              preferences = _l.sent();
              if (!preferences) return [2 /*return*/];
              functions = query.function_score.functions;
              // Boost based on category preferences
              for (_i = 0, _a = Object.entries(preferences.categories); _i < _a.length; _i++) {
                (_b = _a[_i]), (category = _b[0]), (weight = _b[1]);
                if (weight > 0) {
                  functions.push({
                    filter: {
                      match: {
                        categories: category,
                      },
                    },
                    weight: weight * 1.5,
                  });
                }
              }
              // Boost based on brand preferences
              for (_c = 0, _d = Object.entries(preferences.brands); _c < _d.length; _c++) {
                (_e = _d[_c]), (brand = _e[0]), (weight = _e[1]);
                if (weight > 0) {
                  functions.push({
                    filter: {
                      match: {
                        brand: brand,
                      },
                    },
                    weight: weight * 1.3,
                  });
                }
              }
              // Boost based on value preferences
              for (_f = 0, _g = Object.entries(preferences.values); _f < _g.length; _f++) {
                (_h = _g[_f]), (value = _h[0]), (weight = _h[1]);
                if (weight > 0) {
                  functions.push({
                    filter: {
                      match: {
                        values: value,
                      },
                    },
                    weight: weight * 1.2,
                  });
                }
              }
              // Boost based on price range preferences
              for (_j = 0, _k = preferences.priceRanges; _j < _k.length; _j++) {
                range = _k[_j];
                functions.push({
                  filter: {
                    range: {
                      price: {
                        gte: range.min,
                        lte: range.max,
                      },
                    },
                  },
                  weight: range.weight,
                });
              }
              // Boost recently viewed products
              if (preferences.recentlyViewedProducts.length > 0) {
                functions.push({
                  filter: {
                    terms: {
                      _id: preferences.recentlyViewedProducts,
                    },
                  },
                  weight: 2.0,
                });
              }
              return [2 /*return*/];
          }
        });
      });
    };
    /**
     * Apply intent-based boosts to the query
     */
    SearchRelevanceService_1.prototype.applyIntentBasedBoosts = function (query, intent, entities) {
      var functions = query.function_score.functions;
      // Adjust boosts based on intent
      switch (intent) {
        case 'product_search':
          // Standard product search - already covered by default boosts
          break;
        case 'category_browse':
          // Boost category matches
          functions.push({
            filter: { exists: { field: 'categories' } },
            weight: 3.0,
          });
          break;
        case 'brand_specific':
          // Boost brand matches
          functions.push({
            filter: { exists: { field: 'brand' } },
            weight: 3.0,
          });
          break;
        case 'value_driven':
          // Boost value-related fields
          functions.push({
            filter: { exists: { field: 'values' } },
            weight: 3.0,
          });
          break;
        case 'comparison':
          // For comparison, ensure both items appear
          // This is handled at the query level, not in scoring
          break;
        case 'recommendation':
          // Sort by rating for recommendations
          functions.push({
            field_value_factor: {
              field: 'rating',
              factor: 2.0,
              modifier: 'sqrt',
              missing: 1,
            },
          });
          functions.push({
            field_value_factor: {
              field: 'reviewCount',
              factor: 0.1,
              modifier: 'log1p',
              missing: 1,
            },
          });
          break;
        case 'sort':
          // Sorting is handled separately, not in scoring
          break;
      }
      // Apply entity-specific boosts
      if (entities) {
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
          var entity = entities_1[_i];
          if (entity.confidence < 0.5) continue; // Skip low confidence entities
          switch (entity.type) {
            case 'category':
              functions.push({
                filter: {
                  match: {
                    categories: entity.value,
                  },
                },
                weight: entity.confidence * 2.0,
              });
              break;
            case 'brand':
              functions.push({
                filter: {
                  match: {
                    brand: entity.value,
                  },
                },
                weight: entity.confidence * 2.0,
              });
              break;
            case 'value':
              functions.push({
                filter: {
                  match: {
                    values: entity.value,
                  },
                },
                weight: entity.confidence * 1.5,
              });
              break;
            case 'color':
              functions.push({
                filter: {
                  match: {
                    'attributes.color': entity.value,
                  },
                },
                weight: entity.confidence * 1.5,
              });
              break;
            case 'material':
              functions.push({
                filter: {
                  match: {
                    'attributes.material': entity.value,
                  },
                },
                weight: entity.confidence * 1.3,
              });
              break;
          }
        }
      }
    };
    /**
     * Select an A/B test variant for a user
     * @param testId The A/B test ID
     * @param userId The user ID (for consistent variant assignment)
     * @returns The selected variant or null if test not found
     */
    SearchRelevanceService_1.prototype.selectABTestVariant = function (testId, userId) {
      var test = this.activeABTests.find(function (t) {
        return t.id === testId && t.isActive;
      });
      if (!test) return null;
      // Use a hash of the user ID and test ID to consistently assign the same variant
      // to the same user for the duration of the test
      var hash = this.hashString(''.concat(userId, '-').concat(testId));
      var normalizedHash = hash % 100; // 0-99
      var cumulativeWeight = 0;
      for (var _i = 0, _a = test.variants; _i < _a.length; _i++) {
        var variant = _a[_i];
        cumulativeWeight += variant.weight;
        if (normalizedHash < cumulativeWeight) {
          return {
            testId: test.id,
            variantId: variant.id,
            algorithm: variant.algorithm,
            params: variant.params,
            analyticsEventName: test.analyticsEventName,
          };
        }
      }
      // Fallback to first variant if weights don't add up to 100
      return {
        testId: test.id,
        variantId: test.variants[0].id,
        algorithm: test.variants[0].algorithm,
        params: test.variants[0].params,
        analyticsEventName: test.analyticsEventName,
      };
    };
    /**
     * Generate Google Analytics event data for A/B test tracking
     */
    SearchRelevanceService_1.prototype.generateAnalyticsData = function (
      testInfo,
      searchQuery,
      resultCount,
    ) {
      return {
        event: testInfo.analyticsEventName,
        event_category: 'search',
        event_label: searchQuery,
        ab_test_id: testInfo.testId,
        variant_id: testInfo.variantId,
        result_count: resultCount,
        timestamp: new Date().toISOString(),
      };
    };
    /**
     * Simple string hash function for consistent variant assignment
     */
    SearchRelevanceService_1.prototype.hashString = function (str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    /**
     * Get all available scoring profiles
     */
    SearchRelevanceService_1.prototype.getScoringProfiles = function () {
      return Array.from(this.scoringProfiles.keys());
    };
    /**
     * Get all active A/B tests
     */
    SearchRelevanceService_1.prototype.getActiveABTests = function () {
      return this.activeABTests.filter(function (test) {
        return test.isActive;
      });
    };
    return SearchRelevanceService_1;
  })());
  __setFunctionName(_classThis, 'SearchRelevanceService');
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
    SearchRelevanceService = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (SearchRelevanceService = _classThis);
})();
exports.SearchRelevanceService = SearchRelevanceService;
