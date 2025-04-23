"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
var common_1 = require("@nestjs/common");
var elasticsearch_1 = require("@elastic/elasticsearch");
var ElasticsearchService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ElasticsearchService = _classThis = /** @class */ (function () {
        function ElasticsearchService_1(configService) {
            this.configService = configService;
            this._logger = new common_1.Logger(ElasticsearchService.name);
            this._client = new elasticsearch_1.Client({
                node: this.configService.get('ELASTICSEARCH_NODE'),
                auth: {
                    username: this.configService.get('ELASTICSEARCH_USERNAME'),
                    password: this.configService.get('ELASTICSEARCH_PASSWORD'),
                },
            });
        }
        ElasticsearchService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            // Check if Elasticsearch is running
                            return [4 /*yield*/, this._client.ping()];
                        case 1:
                            // Check if Elasticsearch is running
                            _a.sent();
                            this._logger.log('Successfully connected to Elasticsearch');
                            // Create indices if they don't exist
                            return [4 /*yield*/, this._createIndices()];
                        case 2:
                            // Create indices if they don't exist
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this._logger.error("Failed to connect to Elasticsearch: ".concat(error_1.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype._createIndices = function () {
            return __awaiter(this, void 0, void 0, function () {
                var indices, _i, indices_1, index, exists;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            indices = ['products', 'merchants', 'brands'];
                            _i = 0, indices_1 = indices;
                            _a.label = 1;
                        case 1:
                            if (!(_i < indices_1.length)) return [3 /*break*/, 5];
                            index = indices_1[_i];
                            return [4 /*yield*/, this.indexExists(index)];
                        case 2:
                            exists = _a.sent();
                            if (!!exists) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.createIndex(index)];
                        case 3:
                            _a.sent();
                            this._logger.log("Created index: ".concat(index));
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype._getMappingForIndex = function (index) {
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
        };
        ElasticsearchService_1.prototype.indexProduct = function (product) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.indexDocument('products', product.id, {
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
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this._logger.error("Failed to index product ".concat(product.id, ": ").concat(error_2.message));
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype.bulkIndexProducts = function (products) {
            return __awaiter(this, void 0, void 0, function () {
                var body, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (products.length === 0) {
                                return [2 /*return*/];
                            }
                            body = products.flatMap(function (product) { return [
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
                            ]; });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.bulkOperation(body, true)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_3 = _a.sent();
                            this._logger.error("Failed to bulk index products: ".concat(error_3.message));
                            throw error_3;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype.updateProduct = function (product) {
            return __awaiter(this, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.updateDocument('products', product.id, {
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
                                })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this._logger.error("Failed to update product ".concat(product.id, ": ").concat(error_4.message));
                            throw error_4;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype.deleteProduct = function (productId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.deleteDocument('products', productId)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            this._logger.error("Failed to delete product ".concat(productId, ": ").concat(error_5.message));
                            throw error_5;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Search for products with advanced filtering and sorting
         */
        ElasticsearchService_1.prototype.searchProducts = function (query_1, filters_1) {
            return __awaiter(this, arguments, void 0, function (query, filters, page, limit, sort) {
                var searchQuery, error_6;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            searchQuery = this.buildProductSearchQuery(query, filters, page, limit, sort);
                            return [4 /*yield*/, this.performSearch('products', searchQuery)];
                        case 1: 
                        // Execute the search query
                        return [2 /*return*/, _a.sent()];
                        case 2:
                            error_6 = _a.sent();
                            this._logger.error("Failed to search products: ".concat(error_6.message));
                            throw error_6;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get product suggestions for autocomplete
         */
        ElasticsearchService_1.prototype.getProductSuggestions = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, limit) {
                var response, suggestions_1, error_7;
                if (limit === void 0) { limit = 5; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.search({
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
                                })];
                        case 1:
                            response = _a.sent();
                            suggestions_1 = [];
                            if (response.suggest) {
                                Object.values(response.suggest).forEach(function (suggestionCategory) {
                                    if (Array.isArray(suggestionCategory)) {
                                        suggestions_1 = suggestions_1.concat(suggestionCategory.flatMap(function (suggestion) { return suggestion.options; }));
                                    }
                                });
                            }
                            return [2 /*return*/, suggestions_1.map(function (option) { return option.text; }) || []];
                        case 2:
                            error_7 = _a.sent();
                            this._logger.error("Failed to get product suggestions: ".concat(error_7.message));
                            throw error_7;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reindex all products
         */
        ElasticsearchService_1.prototype.reindexAllProducts = function (products) {
            return __awaiter(this, void 0, void 0, function () {
                var exists, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, this.indexExists('products')];
                        case 1:
                            exists = _a.sent();
                            if (!exists) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.deleteIndex('products')];
                        case 2:
                            _a.sent();
                            this._logger.log('Deleted existing products index.');
                            _a.label = 3;
                        case 3: 
                        // 2. Create a new index with the mapping
                        return [4 /*yield*/, this.createIndex('products')];
                        case 4:
                            // 2. Create a new index with the mapping
                            _a.sent();
                            this._logger.log('Created new products index.');
                            // 3. Bulk index all products
                            return [4 /*yield*/, this.bulkIndexProducts(products)];
                        case 5:
                            // 3. Bulk index all products
                            _a.sent();
                            this._logger.log("Successfully reindexed ".concat(products.length, " products."));
                            return [3 /*break*/, 7];
                        case 6:
                            error_8 = _a.sent();
                            this._logger.error("Failed during reindexing: ".concat(error_8.message));
                            throw error_8;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get related products based on a source product
         */
        ElasticsearchService_1.prototype.getRelatedProducts = function (productId_1) {
            return __awaiter(this, arguments, void 0, function (productId, limit) {
                var productResponse, sourceProduct, likeTexts, searchQuery, result, error_9;
                var _a;
                if (limit === void 0) { limit = 5; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this._client.get({
                                    index: 'products',
                                    id: productId,
                                })];
                        case 1:
                            productResponse = _b.sent();
                            if (!productResponse._source) {
                                this._logger.warn("Product ".concat(productId, " not found for related search."));
                                return [2 /*return*/, []];
                            }
                            sourceProduct = productResponse._source;
                            likeTexts = __spreadArray(__spreadArray([
                                sourceProduct.title,
                                sourceProduct.description
                            ], (sourceProduct.categories || []), true), (sourceProduct.tags || []), true).filter(Boolean);
                            if (likeTexts.length === 0) {
                                return [2 /*return*/, []]; // Cannot perform More Like This without fields
                            }
                            searchQuery = {
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
                            return [4 /*yield*/, this.performSearch('products', searchQuery)];
                        case 2:
                            result = _b.sent();
                            return [2 /*return*/, result.items];
                        case 3:
                            error_9 = _b.sent();
                            // If the error is 'Not Found', it's expected if the product doesn't exist
                            if (error_9 && ((_a = error_9.meta) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                                this._logger.warn("Product ".concat(productId, " not found for related search."));
                                return [2 /*return*/, []];
                            }
                            this._logger.error("Failed to get related products for ".concat(productId, ": ").concat(error_9.message));
                            throw error_9;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get trending products
         */
        ElasticsearchService_1.prototype.getTrendingProducts = function () {
            return __awaiter(this, arguments, void 0, function (limit) {
                var searchQuery, result, error_10;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            searchQuery = {
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
                            return [4 /*yield*/, this.performSearch('products', searchQuery)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.items];
                        case 2:
                            error_10 = _a.sent();
                            this._logger.error("Failed to get trending products: ".concat(error_10.message));
                            throw error_10;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get discovery products with personalization
         */
        ElasticsearchService_1.prototype.getDiscoveryProducts = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, limit, values) {
                var should, searchQuery, result, error_11;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            should = [];
                            if (values && values.length > 0) {
                                should.push({
                                    terms: {
                                        'values.keyword': values,
                                        boost: 2.0,
                                    },
                                });
                            }
                            searchQuery = {
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
                                                should: should,
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
                            return [4 /*yield*/, this.performSearch('products', searchQuery)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.items];
                        case 2:
                            error_11 = _a.sent();
                            this._logger.error("Failed to get discovery products: ".concat(error_11.message));
                            throw error_11;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
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
        ElasticsearchService_1.prototype.buildProductSearchQuery = function (query, filters, page, limit, sort) {
            var _a;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 10; }
            // Calculate from for pagination
            var from = (page - 1) * limit;
            // Build the query
            var must = [];
            var filter = [];
            // Add text search if query is provided
            if (query && query.trim() !== '') {
                must.push({
                    multi_match: {
                        query: query,
                        fields: ['title^3', 'description^2', 'brandName^2', 'categories', 'tags', 'values'],
                        type: 'best_fields',
                        fuzziness: 'AUTO',
                    },
                });
            }
            else {
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
                    var range = {};
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
            var queryBody = {
                from: from,
                size: limit,
                query: {
                    bool: {
                        must: must,
                        filter: filter,
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
                queryBody.sort = [(_a = {}, _a[sort.field] = { order: sort.order }, _a)];
            }
            else if (!query || query.trim() === '') {
                // Default sort by createdAt desc if no query
                queryBody.sort = [{ createdAt: { order: 'desc' } }];
            }
            return queryBody;
        };
        /**
         * Performs a generic search query against Elasticsearch.
         * Used internally by other services that need direct search access.
         *
         * @param index The Elasticsearch index to search against.
         * @param body The Elasticsearch query body.
         * @returns The raw Elasticsearch search response.
         */
        ElasticsearchService_1.prototype.performSearch = function (index, body) {
            return __awaiter(this, void 0, void 0, function () {
                var response, hits, total, items, error_12;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.search({
                                    index: index,
                                    body: body,
                                })];
                        case 1:
                            response = _c.sent();
                            hits = ((_a = response.hits) === null || _a === void 0 ? void 0 : _a.hits) || [];
                            total = ((_b = response.hits) === null || _b === void 0 ? void 0 : _b.total) ?
                                (typeof response.hits.total === 'number' ? response.hits.total : response.hits.total.value) : 0;
                            items = hits.map(function (hit) {
                                var source = hit._source;
                                var highlight = hit.highlight;
                                // Add score and highlight information to the result
                                return __assign(__assign({}, source), { _score: hit._score, highlight: highlight || {} });
                            });
                            return [2 /*return*/, { items: items, total: total }];
                        case 2:
                            error_12 = _c.sent();
                            this._logger.error("Failed to perform search on index ".concat(index, ": ").concat(error_12.message));
                            throw error_12;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype.searchMerchants = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, page, limit) {
                var from, response, hits, items, error_13;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            from = (page - 1) * limit;
                            return [4 /*yield*/, this._client.search({
                                    index: 'merchants',
                                    body: {
                                        from: from,
                                        size: limit,
                                        query: {
                                            bool: {
                                                must: query
                                                    ? [
                                                        {
                                                            multi_match: {
                                                                query: query,
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
                                })];
                        case 1:
                            response = _a.sent();
                            hits = response.hits.hits;
                            items = hits.map(function (hit) { return hit._source; });
                            return [2 /*return*/, { items: items, total: hits.length }];
                        case 2:
                            error_13 = _a.sent();
                            this._logger.error("Failed to search merchants: ".concat(error_13.message));
                            throw error_13;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ElasticsearchService_1.prototype.searchBrands = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, page, limit) {
                var from, response, hits, items, error_14;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            from = (page - 1) * limit;
                            return [4 /*yield*/, this._client.search({
                                    index: 'brands',
                                    body: {
                                        from: from,
                                        size: limit,
                                        query: {
                                            bool: {
                                                must: query
                                                    ? [
                                                        {
                                                            multi_match: {
                                                                query: query,
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
                                })];
                        case 1:
                            response = _a.sent();
                            hits = response.hits.hits;
                            items = hits.map(function (hit) { return hit._source; });
                            return [2 /*return*/, { items: items, total: hits.length }];
                        case 2:
                            error_14 = _a.sent();
                            this._logger.error("Failed to search brands: ".concat(error_14.message));
                            throw error_14;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // --- Document Operations ---
        /**
         * Index a single document.
         */
        ElasticsearchService_1.prototype.indexDocument = function (index_1, id_1, body_1) {
            return __awaiter(this, arguments, void 0, function (index, id, body, refresh) {
                var error_15;
                if (refresh === void 0) { refresh = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.index({ index: index, id: id, body: body, refresh: refresh })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_15 = _a.sent();
                            this._logger.error("Failed to index document ".concat(id, " in index ").concat(index, ": ").concat(error_15.message));
                            throw error_15;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update a single document.
         */
        ElasticsearchService_1.prototype.updateDocument = function (index_1, id_1, body_1) {
            return __awaiter(this, arguments, void 0, function (index, id, body, // Should contain { doc: ... } or script
            refresh) {
                var error_16;
                if (refresh === void 0) { refresh = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.update({ index: index, id: id, body: body, refresh: refresh })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_16 = _a.sent();
                            // Specific handling for 404 might be needed in the caller
                            this._logger.error("Failed to update document ".concat(id, " in index ").concat(index, ": ").concat(error_16.message));
                            throw error_16;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete a single document.
         */
        ElasticsearchService_1.prototype.deleteDocument = function (index_1, id_1) {
            return __awaiter(this, arguments, void 0, function (index, id, refresh) {
                var error_17;
                if (refresh === void 0) { refresh = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.delete({ index: index, id: id, refresh: refresh })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_17 = _a.sent();
                            // Specific handling for 404 might be needed in the caller
                            this._logger.error("Failed to delete document ".concat(id, " from index ").concat(index, ": ").concat(error_17.message));
                            throw error_17;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Perform a bulk operation.
         */
        ElasticsearchService_1.prototype.bulkOperation = function (body_1) {
            return __awaiter(this, arguments, void 0, function (body, refresh) {
                var error_18;
                if (refresh === void 0) { refresh = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.bulk({ body: body, refresh: refresh })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_18 = _a.sent();
                            this._logger.error("Failed to perform bulk operation: ".concat(error_18.message));
                            throw error_18;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // --- Indices Operations ---
        /**
         * Check if an index exists.
         */
        ElasticsearchService_1.prototype.indexExists = function (index) {
            return __awaiter(this, void 0, void 0, function () {
                var error_19;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.indices.exists({ index: index })];
                        case 1:
                            _b.sent();
                            return [2 /*return*/, true];
                        case 2:
                            error_19 = _b.sent();
                            // A 404 status code means it doesn't exist, not an error in this context
                            // Safely check for the 404 status code by checking property existence
                            if (error_19 && typeof error_19 === 'object' && ((_a = error_19.meta) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                                return [2 /*return*/, false];
                            }
                            this._logger.error("Failed to check existence of index ".concat(index, ": ").concat(error_19.message));
                            throw error_19;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Create an index.
         */
        ElasticsearchService_1.prototype.createIndex = function (index, mappings, settings) {
            return __awaiter(this, void 0, void 0, function () {
                var body, _a, _b, error_20;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            body = {};
                            if (settings) {
                                body.settings = settings;
                            }
                            // Use the internal _getMappingForIndex to ensure consistency
                            _a = body;
                            if (!(mappings !== null && mappings !== void 0)) return [3 /*break*/, 1];
                            _b = mappings;
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, this._getMappingForIndex(index)];
                        case 2:
                            _b = (_c.sent());
                            _c.label = 3;
                        case 3:
                            // Use the internal _getMappingForIndex to ensure consistency
                            _a.mappings = _b;
                            return [4 /*yield*/, this._client.indices.create({ index: index, body: body })];
                        case 4: return [2 /*return*/, _c.sent()];
                        case 5:
                            error_20 = _c.sent();
                            this._logger.error("Failed to create index ".concat(index, ": ").concat(error_20.message));
                            throw error_20;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete an index.
         */
        ElasticsearchService_1.prototype.deleteIndex = function (index) {
            return __awaiter(this, void 0, void 0, function () {
                var error_21;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.indices.delete({ index: index })];
                        case 1: return [2 /*return*/, _b.sent()];
                        case 2:
                            error_21 = _b.sent();
                            // Ignore 404 if index doesn't exist
                            if (error_21 && ((_a = error_21.meta) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
                                this._logger.warn("Index ".concat(index, " not found, skipping deletion."));
                                return [2 /*return*/, null]; // Or indicate success differently
                            }
                            this._logger.error("Failed to delete index ".concat(index, ": ").concat(error_21.message));
                            throw error_21;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update index aliases.
         */
        ElasticsearchService_1.prototype.updateAliases = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var error_22;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.indices.updateAliases({ body: body })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_22 = _a.sent();
                            this._logger.error("Failed to update aliases: ".concat(error_22.message));
                            throw error_22;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the mapping for a specific index.
         */
        ElasticsearchService_1.prototype.getIndexMapping = function (index) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Simply call the existing private method
                    return [2 /*return*/, this._getMappingForIndex(index)];
                });
            });
        };
        /**
         * Update index settings.
         */
        ElasticsearchService_1.prototype.updateIndexSettings = function (index, body) {
            return __awaiter(this, void 0, void 0, function () {
                var error_23;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.indices.putSettings({ index: index, body: body })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_23 = _a.sent();
                            this._logger.error("Failed to update settings for index ".concat(index, ": ").concat(error_23.message));
                            throw error_23;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Refresh an index.
         */
        ElasticsearchService_1.prototype.refreshIndex = function (index) {
            return __awaiter(this, void 0, void 0, function () {
                var error_24;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this._client.indices.refresh({ index: index })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_24 = _a.sent();
                            this._logger.error("Failed to refresh index ".concat(index, ": ").concat(error_24.message));
                            throw error_24;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return ElasticsearchService_1;
    }());
    __setFunctionName(_classThis, "ElasticsearchService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ElasticsearchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ElasticsearchService = _classThis;
}();
exports.ElasticsearchService = ElasticsearchService;
