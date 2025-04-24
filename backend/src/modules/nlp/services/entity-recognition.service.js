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
exports.EntityRecognitionService = void 0;
var common_1 = require("@nestjs/common");
var EntityRecognitionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EntityRecognitionService = _classThis = /** @class */ (function () {
        function EntityRecognitionService_1(configService, elasticsearchService) {
            this.configService = configService;
            this.elasticsearchService = elasticsearchService;
            this.logger = new common_1.Logger(EntityRecognitionService.name);
            // Initialize pattern matchers
            this.categoryPatterns = [
                /(?:in|for|from|browse|shop|category:?)\s+([a-z\s&-]+)(?:category|section|department)?/i,
                /([a-z\s&-]+)(?:\s+category|\s+section|\s+department)/i,
            ];
            this.brandPatterns = [
                /(?:by|from|brand:?)\s+([a-z\s&-]+)/i,
                /([a-z\s&-]+)(?:\s+brand)/i,
            ];
            this.valuePatterns = [
                /(?:sustainable|ethical|eco-friendly|organic|vegan|fair\s+trade|handmade|recycled|upcycled|local|small\s+batch)/i,
            ];
            this.sizePatterns = [
                /(?:size:?)\s+([a-z0-9\s&-]+)/i,
                /(?:in|available\s+in)\s+(?:size:?)\s+([a-z0-9\s&-]+)/i,
                /(?:small|medium|large|s|m|l|xl|xxl|xs|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|10xl|one\s+size)/i,
            ];
            this.colorPatterns = [
                /(?:color:?|colour:?)\s+([a-z\s&-]+)/i,
                /(?:in|available\s+in)\s+(?:color:?|colour:?)\s+([a-z\s&-]+)/i,
                /(?:black|white|red|blue|green|yellow|orange|purple|pink|brown|gray|grey|beige|navy|teal|gold|silver|multicolor|multi-color|multicolour|multi-colour)/i,
            ];
            this.materialPatterns = [
                /(?:material:?)\s+([a-z\s&-]+)/i,
                /(?:made\s+(?:of|from))\s+([a-z\s&-]+)/i,
                /(?:cotton|polyester|wool|silk|linen|leather|denim|velvet|satin|nylon|cashmere|fleece|suede|canvas|corduroy)/i,
            ];
            this.pricePatterns = [
                /(?:under|less\s+than|below|above|over|more\s+than)\s+\$(\d+(?:\.\d+)?)/i,
                /\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/i,
                /(?:price:?)\s+\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/i,
                /(?:price:?)\s+(?:under|less\s+than|below|above|over|more\s+than)\s+\$(\d+(?:\.\d+)?)/i,
                /(?:cheap|affordable|budget|inexpensive|expensive|luxury|high-end|premium)/i,
            ];
            this.ratingPatterns = [
                /(?:rating:?|rated:?)\s+(\d+(?:\.\d+)?)\s*(?:star|stars)?/i,
                /(\d+(?:\.\d+)?)\s*(?:star|stars)\s+(?:rating|rated)/i,
                /(?:rating:?|rated:?)\s+(?:above|over|more\s+than)\s+(\d+(?:\.\d+)?)\s*(?:star|stars)?/i,
                /(?:top|best|highest)\s+rated/i,
            ];
            this.datePatterns = [
                /(?:new|newest|latest|recent|this\s+week|this\s+month|this\s+year)/i,
                /(?:released|added|published|posted|uploaded|created)\s+(?:in|on)\s+(\d{4})/i,
                /(?:from|since)\s+(\d{4})/i,
            ];
            // Initialize known entities
            this.knownCategories = new Set([
                'clothing', 'dresses', 'tops', 'bottoms', 'pants', 'jeans', 'skirts', 'shorts',
                'outerwear', 'jackets', 'coats', 'sweaters', 'activewear', 'swimwear', 'lingerie',
                'sleepwear', 'accessories', 'shoes', 'bags', 'jewelry', 'watches', 'sunglasses',
                'hats', 'scarves', 'gloves', 'belts', 'socks', 'home', 'bedding', 'bath', 'kitchen',
                'furniture', 'decor', 'beauty', 'skincare', 'makeup', 'haircare', 'fragrance', 'wellness',
            ]);
            this.knownBrands = new Set([
                'avnu', 'eco-collective', 'sustainable threads', 'green earth', 'ethical choice',
                'conscious couture', 'fair fashion', 'earth friendly', 'pure planet', 'organic basics',
                'recycled revolution', 'upcycled unique', 'local luxe', 'small batch beauty', 'artisan alliance',
            ]);
            this.knownValues = new Set([
                'sustainable', 'ethical', 'eco-friendly', 'organic', 'vegan', 'fair trade', 'handmade',
                'recycled', 'upcycled', 'local', 'small batch', 'carbon neutral', 'zero waste', 'plastic free',
                'biodegradable', 'compostable', 'renewable', 'cruelty-free', 'non-toxic', 'chemical-free',
            ]);
            this.knownColors = new Set([
                'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
                'gray', 'grey', 'beige', 'navy', 'teal', 'gold', 'silver', 'multicolor', 'multi-color',
            ]);
            this.knownMaterials = new Set([
                'cotton', 'organic cotton', 'polyester', 'recycled polyester', 'wool', 'silk', 'linen',
                'leather', 'vegan leather', 'denim', 'velvet', 'satin', 'nylon', 'cashmere', 'fleece',
                'suede', 'canvas', 'corduroy', 'bamboo', 'hemp', 'tencel', 'modal', 'rayon', 'viscose',
            ]);
            // Load entity data from Elasticsearch
            this.loadEntitiesFromElasticsearch();
        }
        /**
         * Load entity data from Elasticsearch
         */
        EntityRecognitionService_1.prototype.loadEntitiesFromElasticsearch = function () {
            return __awaiter(this, void 0, void 0, function () {
                var categoryResponse, categoryAggregations, anyResponse, categoryBuckets, brandResponse, brandAggregations, anyResponse, brandBuckets, error_1;
                var _this = this;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.elasticsearchService.search({
                                    index: 'products',
                                    size: 0,
                                    aggs: {
                                        categories: {
                                            terms: {
                                                field: 'categories.keyword',
                                                size: 1000
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            categoryResponse = _e.sent();
                            categoryAggregations = void 0;
                            // TypeScript-safe way to check for properties
                            if ('aggregations' in categoryResponse && categoryResponse.aggregations) {
                                // Elasticsearch 8.x format
                                categoryAggregations = categoryResponse.aggregations;
                            }
                            else {
                                anyResponse = categoryResponse;
                                categoryAggregations = (_a = anyResponse.body) === null || _a === void 0 ? void 0 : _a.aggregations;
                            }
                            categoryBuckets = ((_b = categoryAggregations === null || categoryAggregations === void 0 ? void 0 : categoryAggregations.categories) === null || _b === void 0 ? void 0 : _b.buckets) || [];
                            categoryBuckets.forEach(function (bucket) {
                                _this.knownCategories.add(bucket.key.toLowerCase());
                            });
                            return [4 /*yield*/, this.elasticsearchService.search({
                                    index: 'products',
                                    size: 0,
                                    aggs: {
                                        brands: {
                                            terms: {
                                                field: 'brand.keyword',
                                                size: 1000
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            brandResponse = _e.sent();
                            brandAggregations = void 0;
                            // TypeScript-safe way to check for properties
                            if ('aggregations' in brandResponse && brandResponse.aggregations) {
                                // Elasticsearch 8.x format
                                brandAggregations = brandResponse.aggregations;
                            }
                            else {
                                anyResponse = brandResponse;
                                brandAggregations = (_c = anyResponse.body) === null || _c === void 0 ? void 0 : _c.aggregations;
                            }
                            brandBuckets = ((_d = brandAggregations === null || brandAggregations === void 0 ? void 0 : brandAggregations.brands) === null || _d === void 0 ? void 0 : _d.buckets) || [];
                            brandBuckets.forEach(function (bucket) {
                                _this.knownBrands.add(bucket.key.toLowerCase());
                            });
                            this.logger.log("Loaded ".concat(this.knownCategories.size, " categories and ").concat(this.knownBrands.size, " brands from Elasticsearch"));
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _e.sent();
                            this.logger.error("Failed to load entities from Elasticsearch: ".concat(error_1.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Extract entities from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractEntities = function (query, tokens) {
            try {
                var entities_1 = [];
                // Extract categories
                this.extractCategories(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'category' }));
                });
                // Extract brands
                this.extractBrands(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'brand' }));
                });
                // Extract values
                this.extractValues(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'value' }));
                });
                // Extract sizes
                this.extractSizes(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'size' }));
                });
                // Extract colors
                this.extractColors(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'color' }));
                });
                // Extract materials
                this.extractMaterials(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'material' }));
                });
                // Extract price ranges
                this.extractPriceRanges(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'price' }));
                });
                // Extract ratings
                this.extractRatings(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'rating' }));
                });
                // Extract dates/recency
                this.extractDates(query, tokens).forEach(function (entity) {
                    entities_1.push(__assign(__assign({}, entity), { type: 'date' }));
                });
                // Build enhanced query
                var enhancedQuery = this.buildEnhancedQuery(query, entities_1);
                return {
                    entities: entities_1,
                    enhancedQuery: enhancedQuery,
                };
            }
            catch (error) {
                this.logger.error("Failed to extract entities: ".concat(error.message));
                return {
                    entities: [],
                    enhancedQuery: query,
                };
            }
        };
        /**
         * Extract categories from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractCategories = function (query, tokens) {
            var categories = [];
            // Pattern matching
            for (var _i = 0, _a = this.categoryPatterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var matches = __spreadArray([], query.matchAll(pattern), true);
                for (var _b = 0, matches_1 = matches; _b < matches_1.length; _b++) {
                    var match = matches_1[_b];
                    if (match[1]) {
                        var category = match[1].trim().toLowerCase();
                        if (this.knownCategories.has(category)) {
                            categories.push({ value: category, confidence: 0.9 });
                        }
                        else {
                            categories.push({ value: category, confidence: 0.7 });
                        }
                    }
                }
            }
            var _loop_1 = function (token) {
                if (this_1.knownCategories.has(token.toLowerCase())) {
                    var exists = categories.some(function (cat) { return cat.value === token.toLowerCase(); });
                    if (!exists) {
                        categories.push({ value: token.toLowerCase(), confidence: 0.8 });
                    }
                }
            };
            var this_1 = this;
            // Direct matching
            for (var _c = 0, tokens_1 = tokens; _c < tokens_1.length; _c++) {
                var token = tokens_1[_c];
                _loop_1(token);
            }
            var _loop_2 = function (i) {
                var bigramValue = "".concat(tokens[i], " ").concat(tokens[i + 1]).toLowerCase();
                if (this_2.knownCategories.has(bigramValue)) {
                    var exists = categories.some(function (cat) { return cat.value === bigramValue; });
                    if (!exists) {
                        categories.push({ value: bigramValue, confidence: 0.85 });
                    }
                }
            };
            var this_2 = this;
            // Multi-token matching
            for (var i = 0; i < tokens.length - 1; i++) {
                _loop_2(i);
            }
            return categories;
        };
        /**
         * Extract brands from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractBrands = function (query, tokens) {
            var brands = [];
            // Pattern matching
            for (var _i = 0, _a = this.brandPatterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var matches = __spreadArray([], query.matchAll(pattern), true);
                for (var _b = 0, matches_2 = matches; _b < matches_2.length; _b++) {
                    var match = matches_2[_b];
                    if (match[1]) {
                        var brand = match[1].trim().toLowerCase();
                        if (this.knownBrands.has(brand)) {
                            brands.push({ value: brand, confidence: 0.9 });
                        }
                        else {
                            brands.push({ value: brand, confidence: 0.7 });
                        }
                    }
                }
            }
            var _loop_3 = function (token) {
                if (this_3.knownBrands.has(token.toLowerCase())) {
                    var exists = brands.some(function (brand) { return brand.value === token.toLowerCase(); });
                    if (!exists) {
                        brands.push({ value: token.toLowerCase(), confidence: 0.8 });
                    }
                }
            };
            var this_3 = this;
            // Direct matching
            for (var _c = 0, tokens_2 = tokens; _c < tokens_2.length; _c++) {
                var token = tokens_2[_c];
                _loop_3(token);
            }
            var _loop_4 = function (i) {
                var bigramValue = "".concat(tokens[i], " ").concat(tokens[i + 1]).toLowerCase();
                if (this_4.knownBrands.has(bigramValue)) {
                    var exists = brands.some(function (brand) { return brand.value === bigramValue; });
                    if (!exists) {
                        brands.push({ value: bigramValue, confidence: 0.85 });
                    }
                }
            };
            var this_4 = this;
            // Multi-token matching
            for (var i = 0; i < tokens.length - 1; i++) {
                _loop_4(i);
            }
            return brands;
        };
        /**
         * Extract values from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractValues = function (query, tokens) {
            var values = [];
            // Pattern matching
            var matches = __spreadArray([], query.matchAll(this.valuePatterns[0]), true);
            for (var _i = 0, matches_3 = matches; _i < matches_3.length; _i++) {
                var match = matches_3[_i];
                if (match[0]) {
                    var value = match[0].trim().toLowerCase();
                    values.push({ value: value, confidence: 0.9 });
                }
            }
            var _loop_5 = function (token) {
                if (this_5.knownValues.has(token.toLowerCase())) {
                    var exists = values.some(function (val) { return val.value === token.toLowerCase(); });
                    if (!exists) {
                        values.push({ value: token.toLowerCase(), confidence: 0.8 });
                    }
                }
            };
            var this_5 = this;
            // Direct matching
            for (var _a = 0, tokens_3 = tokens; _a < tokens_3.length; _a++) {
                var token = tokens_3[_a];
                _loop_5(token);
            }
            var _loop_6 = function (i) {
                var bigramValue = "".concat(tokens[i], " ").concat(tokens[i + 1]).toLowerCase();
                if (this_6.knownValues.has(bigramValue)) {
                    var exists = values.some(function (val) { return val.value === bigramValue; });
                    if (!exists) {
                        values.push({ value: bigramValue, confidence: 0.85 });
                    }
                }
            };
            var this_6 = this;
            // Multi-token matching
            for (var i = 0; i < tokens.length - 1; i++) {
                _loop_6(i);
            }
            return values;
        };
        /**
         * Extract sizes from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractSizes = function (query, tokens) {
            var sizes = [];
            // Pattern matching
            for (var _i = 0, _a = this.sizePatterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var matches = __spreadArray([], query.matchAll(pattern), true);
                for (var _b = 0, matches_4 = matches; _b < matches_4.length; _b++) {
                    var match = matches_4[_b];
                    if (match[0]) {
                        var size = match[0].trim().toLowerCase();
                        sizes.push({ value: size, confidence: 0.9 });
                    }
                }
            }
            return sizes;
        };
        /**
         * Extract colors from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractColors = function (query, tokens) {
            var colors = [];
            // Pattern matching
            for (var _i = 0, _a = this.colorPatterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var matches = __spreadArray([], query.matchAll(pattern), true);
                for (var _b = 0, matches_5 = matches; _b < matches_5.length; _b++) {
                    var match = matches_5[_b];
                    if (match[0]) {
                        var color = match[0].trim().toLowerCase();
                        if (this.knownColors.has(color)) {
                            colors.push({ value: color, confidence: 0.9 });
                        }
                        else {
                            colors.push({ value: color, confidence: 0.7 });
                        }
                    }
                }
            }
            var _loop_7 = function (token) {
                if (this_7.knownColors.has(token.toLowerCase())) {
                    var exists = colors.some(function (col) { return col.value === token.toLowerCase(); });
                    if (!exists) {
                        colors.push({ value: token.toLowerCase(), confidence: 0.8 });
                    }
                }
            };
            var this_7 = this;
            // Direct matching
            for (var _c = 0, tokens_4 = tokens; _c < tokens_4.length; _c++) {
                var token = tokens_4[_c];
                _loop_7(token);
            }
            return colors;
        };
        /**
         * Extract materials from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractMaterials = function (query, tokens) {
            var materials = [];
            // Pattern matching
            for (var _i = 0, _a = this.materialPatterns; _i < _a.length; _i++) {
                var pattern = _a[_i];
                var matches = __spreadArray([], query.matchAll(pattern), true);
                for (var _b = 0, matches_6 = matches; _b < matches_6.length; _b++) {
                    var match = matches_6[_b];
                    if (match[0]) {
                        var material = match[0].trim().toLowerCase();
                        if (this.knownMaterials.has(material)) {
                            materials.push({ value: material, confidence: 0.9 });
                        }
                        else {
                            materials.push({ value: material, confidence: 0.7 });
                        }
                    }
                }
            }
            var _loop_8 = function (token) {
                if (this_8.knownMaterials.has(token.toLowerCase())) {
                    var exists = materials.some(function (mat) { return mat.value === token.toLowerCase(); });
                    if (!exists) {
                        materials.push({ value: token.toLowerCase(), confidence: 0.8 });
                    }
                }
            };
            var this_8 = this;
            // Direct matching
            for (var _c = 0, tokens_5 = tokens; _c < tokens_5.length; _c++) {
                var token = tokens_5[_c];
                _loop_8(token);
            }
            return materials;
        };
        /**
         * Extract price ranges from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractPriceRanges = function (query, tokens) {
            var prices = [];
            // Extract price ranges (e.g., $50 to $100)
            var priceRangeRegex = /\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/gi;
            var priceMatches = query.match(priceRangeRegex);
            if (priceMatches) {
                priceMatches.forEach(function (match) {
                    var priceValues = match.match(/\$\d+(?:\.\d+)?/g);
                    if (priceValues && priceValues.length === 2) {
                        var minPrice = parseFloat(priceValues[0].substring(1));
                        var maxPrice = parseFloat(priceValues[1].substring(1));
                        prices.push({ value: "".concat(minPrice, "-").concat(maxPrice), confidence: 0.95 });
                    }
                });
            }
            // Extract price modifiers (e.g., under $50, above $100)
            var priceModifierRegex = /(?:under|less\s+than|below|above|over|more\s+than)\s+\$(\d+(?:\.\d+)?)/gi;
            var modifierMatches = __spreadArray([], query.matchAll(priceModifierRegex), true);
            modifierMatches.forEach(function (match) {
                if (match[1]) {
                    var price = parseFloat(match[1]);
                    var modifier = match[0].toLowerCase().includes('under') ||
                        match[0].toLowerCase().includes('less than') ||
                        match[0].toLowerCase().includes('below')
                        ? 'max' : 'min';
                    prices.push({
                        value: modifier === 'max' ? "0-".concat(price) : "".concat(price, "-9999"),
                        confidence: 0.9
                    });
                }
            });
            // Extract price qualifiers (e.g., cheap, expensive)
            var qualifierRegex = /(?:cheap|affordable|budget|inexpensive|expensive|luxury|high-end|premium)/gi;
            var qualifierMatches = __spreadArray([], query.matchAll(qualifierRegex), true);
            qualifierMatches.forEach(function (match) {
                if (match[0]) {
                    var qualifier = match[0].toLowerCase();
                    var value = '';
                    var confidence = 0.7;
                    switch (qualifier) {
                        case 'cheap':
                        case 'affordable':
                        case 'budget':
                        case 'inexpensive':
                            value = '0-50';
                            break;
                        case 'expensive':
                        case 'luxury':
                        case 'high-end':
                        case 'premium':
                            value = '100-9999';
                            break;
                        default:
                            return;
                    }
                    prices.push({ value: value, confidence: confidence });
                }
            });
            return prices;
        };
        /**
         * Extract ratings from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractRatings = function (query, tokens) {
            var ratings = [];
            // Extract specific ratings (e.g., 4 stars, rated 4.5)
            var ratingRegex = /(\d+(?:\.\d+)?)\s*(?:star|stars)/gi;
            var ratingMatches = __spreadArray([], query.matchAll(ratingRegex), true);
            ratingMatches.forEach(function (match) {
                if (match[1]) {
                    var rating = parseFloat(match[1]);
                    if (rating >= 0 && rating <= 5) {
                        ratings.push({ value: rating.toString(), confidence: 0.9 });
                    }
                }
            });
            // Extract rating modifiers (e.g., above 4 stars, top rated)
            var modifierRegex = /(?:above|over|more\s+than)\s+(\d+(?:\.\d+)?)\s*(?:star|stars)/gi;
            var modifierMatches = __spreadArray([], query.matchAll(modifierRegex), true);
            modifierMatches.forEach(function (match) {
                if (match[1]) {
                    var rating = parseFloat(match[1]);
                    if (rating >= 0 && rating <= 5) {
                        ratings.push({ value: "".concat(rating, "+"), confidence: 0.85 });
                    }
                }
            });
            // Extract qualifiers (e.g., top rated, best rated)
            if (query.match(/(?:top|best|highest)\s+rated/i)) {
                ratings.push({ value: '4+', confidence: 0.8 });
            }
            return ratings;
        };
        /**
         * Extract dates/recency from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        EntityRecognitionService_1.prototype.extractDates = function (query, tokens) {
            var dates = [];
            // Extract recency qualifiers (e.g., new, latest, recent)
            if (query.match(/(?:new|newest|latest|recent)/i)) {
                dates.push({ value: 'recent', confidence: 0.8 });
            }
            // Extract time periods (e.g., this week, this month, this year)
            if (query.match(/this\s+week/i)) {
                dates.push({ value: 'this_week', confidence: 0.9 });
            }
            else if (query.match(/this\s+month/i)) {
                dates.push({ value: 'this_month', confidence: 0.9 });
            }
            else if (query.match(/this\s+year/i)) {
                dates.push({ value: 'this_year', confidence: 0.9 });
            }
            // Extract specific years (e.g., from 2020, since 2019)
            var yearRegex = /(?:from|since)\s+(\d{4})/i;
            var yearMatch = query.match(yearRegex);
            if (yearMatch && yearMatch[1]) {
                var year = parseInt(yearMatch[1]);
                var currentYear = new Date().getFullYear();
                if (year >= 2000 && year <= currentYear) {
                    dates.push({ value: "since_".concat(year), confidence: 0.9 });
                }
            }
            return dates;
        };
        /**
         * Build an enhanced query with entity information
         * @param originalQuery The original query
         * @param entities The extracted entities
         */
        EntityRecognitionService_1.prototype.buildEnhancedQuery = function (originalQuery, entities) {
            // For now, just return the original query
            // In a more advanced implementation, this could rewrite the query
            // to improve search results based on detected entities
            return originalQuery;
        };
        return EntityRecognitionService_1;
    }());
    __setFunctionName(_classThis, "EntityRecognitionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EntityRecognitionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EntityRecognitionService = _classThis;
}();
exports.EntityRecognitionService = EntityRecognitionService;
