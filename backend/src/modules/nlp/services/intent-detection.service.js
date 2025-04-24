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
exports.IntentDetectionService = void 0;
var common_1 = require("@nestjs/common");
var natural = require("natural");
var IntentDetectionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var IntentDetectionService = _classThis = /** @class */ (function () {
        function IntentDetectionService_1(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(IntentDetectionService.name);
            // Initialize classifier
            this.classifier = new natural.BayesClassifier();
            // Configure confidence threshold
            this.confidenceThreshold = this.configService.get('nlp.intentConfidenceThreshold', 0.6);
            // Define intent patterns
            this.intentPatterns = {
                'product_search': [
                    /(?:find|show|search for|looking for|need)\s+(?:a|an|some)?\s+([a-z\s&-]+)/i,
                    /(?:where can i find|do you have|is there)\s+(?:a|an|some)?\s+([a-z\s&-]+)/i,
                ],
                'category_browse': [
                    /(?:browse|explore|show me|view|see)\s+(?:all|the)?\s+([a-z\s&-]+)/i,
                    /(?:what|which)\s+([a-z\s&-]+)\s+(?:do you have|are available|can i find)/i,
                ],
                'brand_specific': [
                    /(?:by|from)\s+([a-z\s&-]+)/i,
                    /([a-z\s&-]+)\s+brand/i,
                ],
                'price_query': [
                    /(?:how much|what is the price of|cost of|price for)\s+([a-z\s&-]+)/i,
                    /(?:under|less than|below|above|over|more than)\s+\$(\d+)/i,
                    /\$(\d+)\s*(?:to|-)\s*\$(\d+)/i,
                ],
                'value_driven': [
                    /(?:sustainable|ethical|eco-friendly|organic|vegan|fair trade|handmade|recycled|upcycled|local|small batch)/i,
                    /(?:environmentally friendly|socially responsible|ethically made|eco conscious)/i,
                ],
                'comparison': [
                    /(?:compare|difference between|vs|versus|or)\s+([a-z\s&-]+)\s+(?:and|or|vs|versus)\s+([a-z\s&-]+)/i,
                    /(?:which is better|what's better|better option)\s+([a-z\s&-]+)\s+(?:or|vs|versus)\s+([a-z\s&-]+)/i,
                ],
                'recommendation': [
                    /(?:recommend|suggest|what do you recommend|what should i|best)\s+([a-z\s&-]+)/i,
                    /(?:what are the best|top|popular|trending)\s+([a-z\s&-]+)/i,
                ],
                'availability': [
                    /(?:is|are)\s+([a-z\s&-]+)\s+(?:in stock|available|in)/i,
                    /(?:do you have|availability of)\s+([a-z\s&-]+)/i,
                ],
                'filter': [
                    /(?:filter|show only|limit to|restrict to)\s+([a-z\s&-]+)/i,
                    /(?:by|with)\s+([a-z\s&-]+)\s+(?:only|filter)/i,
                ],
                'sort': [
                    /(?:sort|order|arrange)\s+(?:by|on)\s+([a-z\s&-]+)/i,
                    /(?:sort|order|arrange)\s+([a-z\s&-]+)\s+(?:by|on)\s+([a-z\s&-]+)/i,
                ],
            };
            // Define intent keywords
            this.intentKeywords = {
                'product_search': ['find', 'search', 'looking', 'need', 'want', 'show', 'get'],
                'category_browse': ['browse', 'explore', 'view', 'see', 'category', 'categories', 'all'],
                'brand_specific': ['brand', 'by', 'from', 'made by', 'manufacturer'],
                'price_query': ['price', 'cost', 'how much', 'affordable', 'expensive', 'cheap', 'budget', 'luxury'],
                'value_driven': ['sustainable', 'ethical', 'eco-friendly', 'organic', 'vegan', 'fair trade', 'handmade', 'recycled', 'local'],
                'comparison': ['compare', 'comparison', 'difference', 'versus', 'vs', 'or', 'better', 'best'],
                'recommendation': ['recommend', 'suggest', 'best', 'top', 'popular', 'trending', 'rated'],
                'availability': ['available', 'in stock', 'stock', 'inventory', 'when'],
                'filter': ['filter', 'only', 'limit', 'restrict', 'with', 'has', 'have'],
                'sort': ['sort', 'order', 'arrange', 'ranking', 'highest', 'lowest'],
            };
            // Define intent examples for training
            this.intentExamples = {
                'product_search': [
                    'find a black dress',
                    'looking for organic cotton t-shirts',
                    'search for eco-friendly water bottles',
                    'need a new pair of sustainable jeans',
                    'show me vegan leather bags',
                    'find recycled plastic sunglasses',
                    'I need a fair trade coffee mug',
                ],
                'category_browse': [
                    'browse sustainable clothing',
                    'explore eco-friendly home goods',
                    'show me all vegan products',
                    'view organic skincare',
                    'see all recycled items',
                    'what sustainable products do you have',
                    'which ethical brands are available',
                ],
                'brand_specific': [
                    'products by Eco Collective',
                    'items from Sustainable Threads',
                    'Green Earth brand',
                    'show me Ethical Choice products',
                    'find Conscious Couture dresses',
                    'Fair Fashion jeans',
                    'Earth Friendly cleaning products',
                ],
                'price_query': [
                    'how much are organic cotton sheets',
                    'price of sustainable yoga mats',
                    'cost of eco-friendly water bottles',
                    'products under $50',
                    'items between $20 and $100',
                    'affordable ethical clothing',
                    'luxury sustainable fashion',
                ],
                'value_driven': [
                    'sustainable kitchen products',
                    'ethical jewelry brands',
                    'eco-friendly cleaning supplies',
                    'organic cotton bedding',
                    'vegan leather alternatives',
                    'fair trade chocolate',
                    'locally made furniture',
                ],
                'comparison': [
                    'compare organic cotton vs recycled polyester',
                    'difference between vegan leather and real leather',
                    'bamboo or recycled plastic toothbrushes',
                    'which is better silk or tencel',
                    'sustainable vs conventional cotton',
                    'compare Eco Collective and Green Earth brands',
                    'recycled paper or bamboo toilet paper',
                ],
                'recommendation': [
                    'recommend sustainable gifts under $30',
                    'suggest eco-friendly cleaning products',
                    'what are the best vegan leather bags',
                    'top rated organic skincare',
                    'popular sustainable fashion brands',
                    'best value eco-friendly products',
                    'trending ethical jewelry',
                ],
                'availability': [
                    'are organic cotton sheets in stock',
                    'do you have bamboo toothbrushes',
                    'availability of recycled paper notebooks',
                    'is the eco-friendly water bottle available',
                    'when will sustainable yoga mats be back in stock',
                    'check stock for vegan leather bags',
                    'are fair trade coffee beans available',
                ],
                'filter': [
                    'filter by sustainable materials',
                    'show only vegan products',
                    'limit to local brands',
                    'restrict to items under $50',
                    'filter by 4+ star rating',
                    'show only organic options',
                    'with recycled packaging only',
                ],
                'sort': [
                    'sort by price low to high',
                    'order by customer rating',
                    'arrange by newest first',
                    'sort sustainable clothing by price',
                    'order vegan products by popularity',
                    'arrange by eco-friendliness score',
                    'sort by distance from local',
                ],
            };
            // Train the classifier
            this.trainClassifier();
        }
        /**
         * Train the classifier with intent examples
         */
        IntentDetectionService_1.prototype.trainClassifier = function () {
            var _this = this;
            try {
                // Add examples for each intent
                Object.keys(this.intentExamples).forEach(function (intent) {
                    _this.intentExamples[intent].forEach(function (example) {
                        _this.classifier.addDocument(example.toLowerCase(), intent);
                    });
                });
                // Train the classifier
                this.classifier.train();
                this.logger.log('Intent classifier trained successfully');
            }
            catch (error) {
                this.logger.error("Failed to train intent classifier: ".concat(error.message));
            }
        };
        /**
         * Detect the intent of a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        IntentDetectionService_1.prototype.detectIntent = function (query, tokens) {
            try {
                // 1. Pattern-based detection (highest confidence)
                for (var intent in this.intentPatterns) {
                    for (var _i = 0, _a = this.intentPatterns[intent]; _i < _a.length; _i++) {
                        var pattern = _a[_i];
                        if (pattern.test(query)) {
                            return {
                                intent: intent,
                                confidence: 0.9,
                                subIntents: [],
                            };
                        }
                    }
                }
                // 2. Keyword-based detection
                var keywordScores = {};
                var totalKeywordMatches = 0;
                for (var intent in this.intentKeywords) {
                    keywordScores[intent] = 0;
                    for (var _b = 0, _c = this.intentKeywords[intent]; _b < _c.length; _b++) {
                        var keyword = _c[_b];
                        // Check if keyword appears in query
                        if (query.toLowerCase().includes(keyword.toLowerCase())) {
                            keywordScores[intent] += 1;
                            totalKeywordMatches += 1;
                        }
                    }
                }
                // Calculate confidence scores
                if (totalKeywordMatches > 0) {
                    var keywordIntents = [];
                    for (var intent in keywordScores) {
                        if (keywordScores[intent] > 0) {
                            var confidence = keywordScores[intent] / totalKeywordMatches;
                            keywordIntents.push({ intent: intent, confidence: confidence });
                        }
                    }
                    // Sort by confidence
                    keywordIntents.sort(function (a, b) { return b.confidence - a.confidence; });
                    if (keywordIntents.length > 0 && keywordIntents[0].confidence >= this.confidenceThreshold) {
                        return {
                            intent: keywordIntents[0].intent,
                            confidence: keywordIntents[0].confidence,
                            subIntents: keywordIntents.slice(1),
                        };
                    }
                }
                // 3. Machine learning classification
                var classifications = this.classifier.getClassifications(query.toLowerCase());
                if (classifications.length > 0 && classifications[0].value >= this.confidenceThreshold) {
                    return {
                        intent: classifications[0].label,
                        confidence: classifications[0].value,
                        subIntents: classifications.slice(1).map(function (c) { return ({ intent: c.label, confidence: c.value }); }),
                    };
                }
                // 4. Default to product_search if no clear intent
                return {
                    intent: 'product_search',
                    confidence: 0.5,
                    subIntents: [],
                };
            }
            catch (error) {
                this.logger.error("Failed to detect intent: ".concat(error.message));
                return {
                    intent: 'product_search',
                    confidence: 0.5,
                    subIntents: [],
                };
            }
        };
        /**
         * Get search parameters based on detected intent
         * @param intent The detected intent
         * @param entities The extracted entities
         */
        IntentDetectionService_1.prototype.getSearchParameters = function (intent, entities, query) {
            // Default search parameters
            var searchParams = {
                boost: {},
                sort: [],
                filters: {},
            };
            // Adjust search parameters based on intent
            switch (intent) {
                case 'product_search':
                    // Standard product search - default parameters
                    searchParams.boost = { name: 2.0, description: 1.0, categories: 1.5 };
                    break;
                case 'category_browse':
                    // Boost category matches
                    searchParams.boost = { categories: 3.0, name: 1.0, description: 0.5 };
                    // Add category filters if detected
                    var categoryEntities = entities.filter(function (e) { return e.type === 'category'; });
                    if (categoryEntities.length > 0) {
                        searchParams.filters = __assign(__assign({}, searchParams.filters), { categories: categoryEntities.map(function (e) { return e.value; }) });
                    }
                    break;
                case 'brand_specific':
                    // Boost brand matches
                    searchParams.boost = { brand: 3.0, name: 1.0 };
                    // Add brand filters if detected
                    var brandEntities = entities.filter(function (e) { return e.type === 'brand'; });
                    if (brandEntities.length > 0) {
                        searchParams.filters = __assign(__assign({}, searchParams.filters), { brands: brandEntities.map(function (e) { return e.value; }) });
                    }
                    break;
                case 'price_query':
                    // Sort by price
                    searchParams.sort.push({ field: 'price', order: 'asc' });
                    // Add price filters if detected
                    var priceEntities = entities.filter(function (e) { return e.type === 'price'; });
                    if (priceEntities.length > 0) {
                        var priceValues = priceEntities[0].value.split('-');
                        if (priceValues.length === 2) {
                            searchParams.filters = __assign(__assign({}, searchParams.filters), { priceMin: parseFloat(priceValues[0]), priceMax: parseFloat(priceValues[1]) });
                        }
                    }
                    break;
                case 'value_driven':
                    // Boost value-related fields
                    searchParams.boost = { values: 3.0, description: 2.0, name: 1.0 };
                    // Add value filters if detected
                    var valueEntities = entities.filter(function (e) { return e.type === 'value'; });
                    if (valueEntities.length > 0) {
                        searchParams.filters = __assign(__assign({}, searchParams.filters), { values: valueEntities.map(function (e) { return e.value; }) });
                    }
                    break;
                case 'comparison':
                    // For comparison, we want to ensure both compared items appear
                    // This is handled by the search service
                    break;
                case 'recommendation':
                    // Sort by rating for recommendations
                    searchParams.sort.push({ field: 'rating', order: 'desc' });
                    searchParams.boost = { rating: 2.0, reviewCount: 1.5, name: 1.0 };
                    break;
                case 'availability':
                    // Filter for in-stock items
                    searchParams.filters = __assign(__assign({}, searchParams.filters), { inStock: true });
                    break;
                case 'filter':
                    // Apply all detected entity filters
                    entities.forEach(function (entity) {
                        switch (entity.type) {
                            case 'category': {
                                var categories = searchParams.filters.categories || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { categories: __spreadArray(__spreadArray([], categories, true), [entity.value], false) });
                                break;
                            }
                            case 'brand': {
                                var brands = searchParams.filters.brands || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { brands: __spreadArray(__spreadArray([], brands, true), [entity.value], false) });
                                break;
                            }
                            case 'value': {
                                var values = searchParams.filters.values || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { values: __spreadArray(__spreadArray([], values, true), [entity.value], false) });
                                break;
                            }
                            case 'price': {
                                var priceValues = entity.value.split('-');
                                if (priceValues.length === 2) {
                                    searchParams.filters = __assign(__assign({}, searchParams.filters), { priceMin: parseFloat(priceValues[0]), priceMax: parseFloat(priceValues[1]) });
                                }
                                break;
                            }
                            case 'rating': {
                                if (entity.value.includes('+')) {
                                    searchParams.filters = __assign(__assign({}, searchParams.filters), { ratingMin: parseFloat(entity.value.replace('+', '')) });
                                }
                                else {
                                    searchParams.filters = __assign(__assign({}, searchParams.filters), { rating: parseFloat(entity.value) });
                                }
                                break;
                            }
                            case 'color': {
                                var colors = searchParams.filters.colors || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { colors: __spreadArray(__spreadArray([], colors, true), [entity.value], false) });
                                break;
                            }
                            case 'size': {
                                var sizes = searchParams.filters.sizes || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { sizes: __spreadArray(__spreadArray([], sizes, true), [entity.value], false) });
                                break;
                            }
                            case 'material': {
                                var materials = searchParams.filters.materials || [];
                                searchParams.filters = __assign(__assign({}, searchParams.filters), { materials: __spreadArray(__spreadArray([], materials, true), [entity.value], false) });
                                break;
                            }
                        }
                    });
                    break;
                case 'sort':
                    // Determine sort field and order
                    if (query && typeof query === 'string') {
                        if (query.includes('price')) {
                            if (query.includes('high to low')) {
                                searchParams.sort.push({ field: 'price', order: 'desc' });
                            }
                            else {
                                searchParams.sort.push({ field: 'price', order: 'asc' });
                            }
                        }
                        else if (query.includes('rating') || query.includes('reviews')) {
                            searchParams.sort.push({ field: 'rating', order: 'desc' });
                        }
                        else if (query.includes('new') || query.includes('recent')) {
                            searchParams.sort.push({ field: 'createdAt', order: 'desc' });
                        }
                        else if (query.includes('popular') || query.includes('trending')) {
                            searchParams.sort.push({ field: 'popularity', order: 'desc' });
                        }
                    }
                    break;
                default:
                    // Default parameters for unknown intents
                    break;
            }
            return searchParams;
        };
        return IntentDetectionService_1;
    }());
    __setFunctionName(_classThis, "IntentDetectionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IntentDetectionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IntentDetectionService = _classThis;
}();
exports.IntentDetectionService = IntentDetectionService;
