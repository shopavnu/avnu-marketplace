"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
var common_1 = require("@nestjs/common");
var SearchService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SearchService = _classThis = /** @class */ (function () {
        function SearchService_1(elasticsearchService, productsService, logger, searchRelevanceService, userPreferenceService, abTestingService, googleAnalyticsService, nlpService, enhancedNlpService) {
            this.elasticsearchService = elasticsearchService;
            this.productsService = productsService;
            this.logger = logger;
            this.searchRelevanceService = searchRelevanceService;
            this.userPreferenceService = userPreferenceService;
            this.abTestingService = abTestingService;
            this.googleAnalyticsService = googleAnalyticsService;
            this.nlpService = nlpService;
            this.enhancedNlpService = enhancedNlpService;
            this.logger.setContext(SearchService.name);
        }
        /**
         * Search for products with advanced filtering and sorting
         */
        SearchService_1.prototype.searchProducts = function (query, paginationDto, filters, sort, options) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, page, _b, limit, _c, _d, enableNlp, _e, enablePersonalization, _f, enableABTesting, _g, enableAnalytics, _h, personalizationStrength, _j, clientId, _k, user, searchMetadata, startTime, nlpData, nlpResult, intent, entities, nlpError_1, testInfo, scoringProfile, searchQuery, enhancedQuery, userPreferences, result, productIds, products_1, sortedProducts, endTime, analyticsError_1, error_1;
                var _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            _m.trys.push([0, 15, , 16]);
                            _a = paginationDto.page, page = _a === void 0 ? 1 : _a, _b = paginationDto.limit, limit = _b === void 0 ? 10 : _b;
                            _c = options || {}, _d = _c.enableNlp, enableNlp = _d === void 0 ? false : _d, _e = _c.enablePersonalization, enablePersonalization = _e === void 0 ? false : _e, _f = _c.enableABTesting, enableABTesting = _f === void 0 ? false : _f, _g = _c.enableAnalytics, enableAnalytics = _g === void 0 ? false : _g, _h = _c.personalizationStrength, personalizationStrength = _h === void 0 ? 1.0 : _h, _j = _c.clientId, clientId = _j === void 0 ? this.googleAnalyticsService.generateClientId() : _j, _k = _c.user, user = _k === void 0 ? undefined : _k;
                            searchMetadata = {};
                            startTime = Date.now();
                            nlpData = void 0;
                            if (!(enableNlp && query)) return [3 /*break*/, 4];
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.enhancedNlpService.processQuery(query)];
                        case 2:
                            nlpResult = _m.sent();
                            intent = typeof nlpResult.intent === 'string' ?
                                nlpResult.intent :
                                (((_l = nlpResult.intent) === null || _l === void 0 ? void 0 : _l.primary) || 'general');
                            entities = Array.isArray(nlpResult.entities) ?
                                nlpResult.entities :
                                [];
                            nlpData = {
                                intent: intent,
                                entities: entities.map(function (e) { return ({
                                    type: e.type || 'unknown',
                                    value: e.value || '',
                                    confidence: e.confidence || 0.5
                                }); })
                            };
                            searchMetadata.nlpProcessed = true;
                            searchMetadata.intent = nlpData.intent;
                            searchMetadata.entitiesDetected = nlpData.entities.length;
                            return [3 /*break*/, 4];
                        case 3:
                            nlpError_1 = _m.sent();
                            this.logger.warn("NLP processing failed: ".concat(nlpError_1.message));
                            searchMetadata.nlpProcessed = false;
                            return [3 /*break*/, 4];
                        case 4:
                            testInfo = void 0;
                            scoringProfile = 'standard';
                            if (enableABTesting && user) {
                                // Get the active test for search relevance
                                testInfo = this.abTestingService.assignUserToVariant('search-relevance-test-001', user.id, clientId);
                                if (testInfo) {
                                    scoringProfile = testInfo.algorithm;
                                    searchMetadata.abTest = {
                                        testId: testInfo.testId,
                                        variantId: testInfo.variantId,
                                        algorithm: testInfo.algorithm
                                    };
                                }
                            }
                            searchQuery = this.elasticsearchService.buildProductSearchQuery(query, filters, page, limit, sort);
                            enhancedQuery = searchQuery;
                            if (!(enableNlp && nlpData)) return [3 /*break*/, 5];
                            // Apply intent-based scoring if NLP data is available
                            enhancedQuery = this.searchRelevanceService.applyScoringProfile(searchQuery, 'intent', user, nlpData.intent, nlpData.entities);
                            searchMetadata.relevanceProfile = 'intent';
                            return [3 /*break*/, 8];
                        case 5:
                            if (!(enableABTesting && testInfo)) return [3 /*break*/, 6];
                            // Apply the selected scoring profile from A/B testing
                            enhancedQuery = this.searchRelevanceService.applyScoringProfile(searchQuery, scoringProfile, user);
                            searchMetadata.relevanceProfile = scoringProfile;
                            return [3 /*break*/, 8];
                        case 6:
                            if (!(enablePersonalization && user)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.userPreferenceService.getUserPreferences(user.id)];
                        case 7:
                            userPreferences = _m.sent();
                            if (userPreferences) {
                                enhancedQuery = this.userPreferenceService.applyPreferencesToQuery(searchQuery, userPreferences, personalizationStrength);
                                searchMetadata.relevanceProfile = 'personalized';
                                searchMetadata.personalizationStrength = personalizationStrength;
                            }
                            _m.label = 8;
                        case 8: return [4 /*yield*/, this.elasticsearchService.performSearch('products', enhancedQuery)];
                        case 9:
                            result = _m.sent();
                            productIds = result.items.map(function (item) { return item.id; });
                            // If no products found, return empty array
                            if (productIds.length === 0) {
                                return [2 /*return*/, { items: [], total: 0 }];
                            }
                            return [4 /*yield*/, this.productsService.findByIds(productIds)];
                        case 10:
                            products_1 = _m.sent();
                            sortedProducts = productIds
                                .map(function (id) { return products_1.find(function (product) { return product.id === id; }); })
                                .filter(Boolean);
                            endTime = Date.now();
                            searchMetadata.searchDuration = endTime - startTime;
                            if (!enableAnalytics) return [3 /*break*/, 14];
                            _m.label = 11;
                        case 11:
                            _m.trys.push([11, 13, , 14]);
                            return [4 /*yield*/, this.googleAnalyticsService.trackSearch(clientId, query, sortedProducts.length, testInfo, user === null || user === void 0 ? void 0 : user.id)];
                        case 12:
                            _m.sent();
                            return [3 /*break*/, 14];
                        case 13:
                            analyticsError_1 = _m.sent();
                            this.logger.warn("Failed to track search in analytics: ".concat(analyticsError_1.message));
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/, {
                                items: sortedProducts,
                                total: result.total,
                                metadata: searchMetadata
                            }];
                        case 15:
                            error_1 = _m.sent();
                            this.logger.error("Failed to search products: ".concat(error_1.message));
                            throw error_1;
                        case 16: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get product suggestions for autocomplete
         */
        SearchService_1.prototype.getProductSuggestions = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                if (limit === void 0) { limit = 5; }
                return __generator(this, function (_a) {
                    try {
                        return [2 /*return*/, this.elasticsearchService.getProductSuggestions(query, limit)];
                    }
                    catch (error) {
                        this.logger.error("Failed to get product suggestions: ".concat(error.message));
                        throw error;
                    }
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Get related products based on categories, tags, and values
         */
        SearchService_1.prototype.getRelatedProducts = function (productId_1) {
            return __awaiter(this, arguments, void 0, function (productId, limit) {
                var result, productIds, products_2, sortedProducts, error_2;
                if (limit === void 0) { limit = 5; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.elasticsearchService.getRelatedProducts(productId, limit)];
                        case 1:
                            result = _a.sent();
                            productIds = result.map(function (item) { return item.id; });
                            // If no products found, return empty array
                            if (productIds.length === 0) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, this.productsService.findByIds(productIds)];
                        case 2:
                            products_2 = _a.sent();
                            sortedProducts = productIds
                                .map(function (id) { return products_2.find(function (product) { return product.id === id; }); })
                                .filter(Boolean);
                            return [2 /*return*/, sortedProducts];
                        case 3:
                            error_2 = _a.sent();
                            this.logger.error("Failed to get related products: ".concat(error_2.message));
                            throw error_2;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get trending products
         */
        SearchService_1.prototype.getTrendingProducts = function () {
            return __awaiter(this, arguments, void 0, function (limit) {
                var result, productIds, products_3, sortedProducts, error_3;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.elasticsearchService.getTrendingProducts(limit)];
                        case 1:
                            result = _a.sent();
                            productIds = result.map(function (item) { return item.id; });
                            // If no products found, return empty array
                            if (productIds.length === 0) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, this.productsService.findByIds(productIds)];
                        case 2:
                            products_3 = _a.sent();
                            sortedProducts = productIds
                                .map(function (id) { return products_3.find(function (product) { return product.id === id; }); })
                                .filter(Boolean);
                            return [2 /*return*/, sortedProducts];
                        case 3:
                            error_3 = _a.sent();
                            this.logger.error("Failed to get trending products: ".concat(error_3.message));
                            throw error_3;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get discovery products with personalization
         */
        SearchService_1.prototype.getDiscoveryProducts = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, limit, values) {
                var result, productIds, products_4, sortedProducts, error_4;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.elasticsearchService.getDiscoveryProducts(userId, limit, values)];
                        case 1:
                            result = _a.sent();
                            productIds = result.map(function (item) { return item.id; });
                            // If no products found, return empty array
                            if (productIds.length === 0) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, this.productsService.findByIds(productIds)];
                        case 2:
                            products_4 = _a.sent();
                            sortedProducts = productIds
                                .map(function (id) { return products_4.find(function (product) { return product.id === id; }); })
                                .filter(Boolean);
                            return [2 /*return*/, sortedProducts];
                        case 3:
                            error_4 = _a.sent();
                            this.logger.error("Failed to get discovery products: ".concat(error_4.message));
                            throw error_4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reindex all products
         */
        SearchService_1.prototype.reindexAllProducts = function () {
            return __awaiter(this, void 0, void 0, function () {
                var products, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.productsService.findAllForIndexing()];
                        case 1:
                            products = _a.sent();
                            // Reindex all products
                            return [4 /*yield*/, this.elasticsearchService.reindexAllProducts(products)];
                        case 2:
                            // Reindex all products
                            _a.sent();
                            this.logger.log("Reindexed ".concat(products.length, " products"));
                            return [3 /*break*/, 4];
                        case 3:
                            error_5 = _a.sent();
                            this.logger.error("Failed to reindex all products: ".concat(error_5.message));
                            throw error_5;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Index a single product
         */
        SearchService_1.prototype.indexProduct = function (product) {
            return __awaiter(this, void 0, void 0, function () {
                var error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.indexProduct(product)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            this.logger.error("Failed to index product: ".concat(error_6.message));
                            throw error_6;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update a product in the index
         */
        SearchService_1.prototype.updateProduct = function (product) {
            return __awaiter(this, void 0, void 0, function () {
                var error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.updateProduct(product)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            this.logger.error("Failed to update product in index: ".concat(error_7.message));
                            throw error_7;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete a product from the index
         */
        SearchService_1.prototype.deleteProduct = function (productId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.deleteProduct(productId)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_8 = _a.sent();
                            this.logger.error("Failed to delete product from index: ".concat(error_8.message));
                            throw error_8;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Natural language search for products
         * Enhanced with NLP capabilities for better relevance
         */
        SearchService_1.prototype.naturalLanguageSearch = function (query, paginationDto, user, clientId) {
            return __awaiter(this, void 0, void 0, function () {
                var nlpResult, intent, entities, filters, _i, entities_1, entity, _a, min, max, sort, error_9;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            this.logger.log("Performing natural language search for query: \"".concat(query, "\""));
                            return [4 /*yield*/, this.enhancedNlpService.processQuery(query)];
                        case 1:
                            nlpResult = _c.sent();
                            intent = typeof nlpResult.intent === 'string' ?
                                nlpResult.intent :
                                (((_b = nlpResult.intent) === null || _b === void 0 ? void 0 : _b.primary) || 'general');
                            entities = Array.isArray(nlpResult.entities) ?
                                nlpResult.entities :
                                [];
                            this.logger.log("NLP processing complete. Intent: ".concat(intent, ", Entities: ").concat(entities.length));
                            filters = {};
                            // Map NLP entities to search filters
                            for (_i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
                                entity = entities_1[_i];
                                switch (entity.type) {
                                    case 'category':
                                        if (!filters.categories)
                                            filters.categories = [];
                                        filters.categories.push(entity.value);
                                        break;
                                    case 'brand':
                                        filters.brandName = entity.value;
                                        break;
                                    case 'price':
                                        if (entity.value.includes('-')) {
                                            _a = entity.value.split('-').map(Number), min = _a[0], max = _a[1];
                                            filters.priceMin = min;
                                            filters.priceMax = max;
                                        }
                                        break;
                                    case 'value':
                                        if (!filters.values)
                                            filters.values = [];
                                        filters.values.push(entity.value);
                                        break;
                                }
                            }
                            sort = void 0;
                            if (intent === 'recommendation') {
                                sort = { field: 'rating', order: 'desc' };
                            }
                            else if (intent === 'sort' && query.includes('price')) {
                                if (query.includes('high to low')) {
                                    sort = { field: 'price', order: 'desc' };
                                }
                                else {
                                    sort = { field: 'price', order: 'asc' };
                                }
                            }
                            // Perform the search with NLP-enhanced parameters
                            return [2 /*return*/, this.searchProducts(query, paginationDto, filters, sort, {
                                    enableNlp: true,
                                    enablePersonalization: !!user,
                                    enableABTesting: !!user,
                                    enableAnalytics: true,
                                    clientId: clientId,
                                    user: user,
                                })];
                        case 2:
                            error_9 = _c.sent();
                            this.logger.error("Failed to perform natural language search: ".concat(error_9.message));
                            throw error_9;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Search across all entities (products, merchants, brands)
         */
        SearchService_1.prototype.searchAll = function (query, paginationDto, user, clientId, options) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, page, _b, limit, productsPromise, merchantsPromise, brandsPromise, _c, products, merchants, brands, error_10;
                var _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            _h.trys.push([0, 2, , 3]);
                            _a = paginationDto.page, page = _a === void 0 ? 1 : _a, _b = paginationDto.limit, limit = _b === void 0 ? 10 : _b;
                            productsPromise = this.searchProducts(query, { page: page, limit: limit }, undefined, undefined, {
                                enableNlp: (_d = options === null || options === void 0 ? void 0 : options.enableNlp) !== null && _d !== void 0 ? _d : false,
                                enablePersonalization: (_e = options === null || options === void 0 ? void 0 : options.enablePersonalization) !== null && _e !== void 0 ? _e : false,
                                enableABTesting: (_f = options === null || options === void 0 ? void 0 : options.enableABTesting) !== null && _f !== void 0 ? _f : false,
                                enableAnalytics: (_g = options === null || options === void 0 ? void 0 : options.enableAnalytics) !== null && _g !== void 0 ? _g : false,
                                user: user,
                                clientId: clientId,
                            });
                            merchantsPromise = this.elasticsearchService.searchMerchants(query, page, limit);
                            brandsPromise = this.elasticsearchService.searchBrands(query, page, limit);
                            return [4 /*yield*/, Promise.all([
                                    productsPromise,
                                    merchantsPromise,
                                    brandsPromise,
                                ])];
                        case 1:
                            _c = _h.sent(), products = _c[0], merchants = _c[1], brands = _c[2];
                            return [2 /*return*/, { products: products, merchants: merchants, brands: brands }];
                        case 2:
                            error_10 = _h.sent();
                            this.logger.error("Failed to search all entities: ".concat(error_10.message));
                            throw error_10;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return SearchService_1;
    }());
    __setFunctionName(_classThis, "SearchService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SearchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SearchService = _classThis;
}();
exports.SearchService = SearchService;
