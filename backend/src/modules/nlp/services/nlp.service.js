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
exports.NlpService = void 0;
var common_1 = require("@nestjs/common");
var natural = require("natural");
// Using require for modules without type declarations
// @ts-expect-error - No type definitions for stopwords-en
var stopwords_en_1 = require("stopwords-en");
var NlpService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NlpService = _classThis = /** @class */ (function () {
        function NlpService_1(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(NlpService.name);
            this.tokenizer = new natural.WordTokenizer();
            this.stemmer = natural.PorterStemmer;
            this.tfidf = new natural.TfIdf();
            this.minTokenLength = this.configService.get('nlp.minTokenLength', 2);
        }
        /**
         * Process a natural language query to extract key terms and entities
         * @param query The natural language query
         */
        NlpService_1.prototype.processQuery = function (query) {
            var _this = this;
            try {
                // Tokenize the query
                var tokens = this.tokenizeAndClean(query);
                // Stem the tokens
                var stems = tokens.map(function (token) { return _this.stemmer.stem(token); });
                // Extract entities (categories, brands, price ranges, etc.)
                var entities = this.extractEntities(query, tokens);
                // Determine the intent (search, filter, sort, etc.)
                var intent = this.determineIntent(query, tokens);
                // Extract filters
                var filters = this.extractFilters(query, entities);
                // Build a processed query for search
                var processedQuery = this.buildProcessedQuery(tokens, entities);
                return {
                    originalQuery: query,
                    processedQuery: processedQuery,
                    tokens: tokens,
                    stems: stems,
                    entities: entities,
                    intent: intent,
                    filters: filters,
                };
            }
            catch (error) {
                this.logger.error("Failed to process query: ".concat(error.message));
                return {
                    originalQuery: query,
                    processedQuery: query,
                    tokens: [],
                    stems: [],
                    entities: [],
                    intent: 'search',
                    filters: {},
                };
            }
        };
        /**
         * Tokenize and clean a query
         * @param query The query to tokenize
         */
        NlpService_1.prototype.tokenizeAndClean = function (query) {
            var _this = this;
            // Tokenize
            var tokens = this.tokenizer.tokenize(query.toLowerCase());
            // Remove stopwords
            return tokens.filter(function (token) {
                return !stopwords_en_1.default.includes(token) && token.length > _this.minTokenLength && !/^\d+$/.test(token);
            });
        };
        /**
         * Extract entities from a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        NlpService_1.prototype.extractEntities = function (query, tokens) {
            var entities = [];
            // Extract price ranges
            var priceRangeRegex = /(\$\d+(?:\.\d+)?)\s*(?:to|-)\s*(\$\d+(?:\.\d+)?)/gi;
            var priceMatches = query.match(priceRangeRegex);
            if (priceMatches) {
                priceMatches.forEach(function (match) {
                    var prices = match.match(/\$\d+(?:\.\d+)?/g);
                    if (prices && prices.length === 2) {
                        var minPrice = parseFloat(prices[0].substring(1));
                        var maxPrice = parseFloat(prices[1].substring(1));
                        entities.push({ type: 'priceRange', value: "".concat(minPrice, "-").concat(maxPrice) });
                    }
                });
            }
            // Extract single price points
            var singlePriceRegex = /(?:under|less than|below|above|over|more than)\s*\$(\d+(?:\.\d+)?)/gi;
            var singlePriceMatches = __spreadArray([], query.matchAll(singlePriceRegex), true);
            singlePriceMatches.forEach(function (match) {
                var price = parseFloat(match[1]);
                var modifier = match[0].toLowerCase().includes('under') ||
                    match[0].toLowerCase().includes('less than') ||
                    match[0].toLowerCase().includes('below')
                    ? 'max'
                    : 'min';
                entities.push({
                    type: modifier === 'max' ? 'maxPrice' : 'minPrice',
                    value: price.toString(),
                });
            });
            // Extract categories
            var categoryIndicators = ['category', 'categories', 'in', 'from', 'section'];
            var categoryMatches = this.findEntityAfterIndicator(query, tokens, categoryIndicators);
            categoryMatches.forEach(function (category) {
                entities.push({ type: 'category', value: category });
            });
            // Extract brands
            var brandIndicators = ['brand', 'by', 'from', 'made by'];
            var brandMatches = this.findEntityAfterIndicator(query, tokens, brandIndicators);
            brandMatches.forEach(function (brand) {
                entities.push({ type: 'brand', value: brand });
            });
            // Extract values (sustainability, ethical, etc.)
            var valueIndicators = [
                'sustainable',
                'ethical',
                'eco-friendly',
                'organic',
                'fair trade',
                'handmade',
            ];
            valueIndicators.forEach(function (value) {
                if (query.toLowerCase().includes(value.toLowerCase())) {
                    entities.push({ type: 'value', value: value });
                }
            });
            return entities;
        };
        /**
         * Find entities that appear after indicator words
         * @param query The original query
         * @param tokens The tokenized query
         * @param indicators The indicator words
         */
        NlpService_1.prototype.findEntityAfterIndicator = function (query, tokens, indicators) {
            var entities = [];
            var words = query.toLowerCase().split(/\s+/);
            indicators.forEach(function (indicator) {
                var index = words.findIndex(function (word) { return word === indicator; });
                if (index !== -1 && index < words.length - 1) {
                    // Take the next word as the entity
                    entities.push(words[index + 1]);
                    // Check if there's a multi-word entity
                    if (index < words.length - 2 && !indicators.includes(words[index + 2])) {
                        entities.push("".concat(words[index + 1], " ").concat(words[index + 2]));
                    }
                }
            });
            return entities;
        };
        /**
         * Determine the intent of a query
         * @param query The original query
         * @param tokens The tokenized query
         */
        NlpService_1.prototype.determineIntent = function (query, tokens) {
            // Check for filter intent
            var filterIndicators = ['filter', 'show', 'find', 'where', 'with'];
            for (var _i = 0, filterIndicators_1 = filterIndicators; _i < filterIndicators_1.length; _i++) {
                var indicator = filterIndicators_1[_i];
                if (tokens.includes(indicator)) {
                    return 'filter';
                }
            }
            // Check for sort intent
            var sortIndicators = ['sort', 'order', 'arrange'];
            for (var _a = 0, sortIndicators_1 = sortIndicators; _a < sortIndicators_1.length; _a++) {
                var indicator = sortIndicators_1[_a];
                if (tokens.includes(indicator)) {
                    return 'sort';
                }
            }
            // Default to search intent
            return 'search';
        };
        /**
         * Extract filters from entities
         * @param query The original query
         * @param entities The extracted entities
         */
        NlpService_1.prototype.extractFilters = function (query, entities) {
            var filters = {};
            // Process entities into filters
            entities.forEach(function (entity) {
                switch (entity.type) {
                    case 'priceRange':
                        var _a = entity.value.split('-').map(parseFloat), min = _a[0], max = _a[1];
                        filters.priceMin = min;
                        filters.priceMax = max;
                        break;
                    case 'minPrice':
                        filters.priceMin = parseFloat(entity.value);
                        break;
                    case 'maxPrice':
                        filters.priceMax = parseFloat(entity.value);
                        break;
                    case 'category':
                        if (!filters.categories) {
                            filters.categories = [];
                        }
                        filters.categories.push(entity.value);
                        break;
                    case 'brand':
                        filters.brandName = entity.value;
                        break;
                    case 'value':
                        if (!filters.values) {
                            filters.values = [];
                        }
                        filters.values.push(entity.value);
                        break;
                }
            });
            // Check for in-stock filter
            if (query.toLowerCase().includes('in stock') || query.toLowerCase().includes('available')) {
                filters.inStock = true;
            }
            return filters;
        };
        /**
         * Build a processed query for search
         * @param tokens The tokenized query
         * @param entities The extracted entities
         */
        NlpService_1.prototype.buildProcessedQuery = function (tokens, entities) {
            // Remove entity values from tokens
            var entityValues = entities.map(function (entity) { return entity.value.toLowerCase(); });
            var filteredTokens = tokens.filter(function (token) { return !entityValues.includes(token); });
            // Join tokens back into a query
            return filteredTokens.join(' ');
        };
        /**
         * Analyze text to find keywords
         * @param text The text to analyze
         * @param maxKeywords The maximum number of keywords to return
         */
        NlpService_1.prototype.extractKeywords = function (text, maxKeywords) {
            if (maxKeywords === void 0) { maxKeywords = 5; }
            try {
                // Create a new TF-IDF instance
                var tfidf = new natural.TfIdf();
                // Add the document
                tfidf.addDocument(text);
                // Get the top terms
                var terms_1 = [];
                tfidf.listTerms(0).forEach(function (item) {
                    // Filter out stopwords and short terms
                    if (!stopwords_en_1.default.includes(item.term) && item.term.length > 2) {
                        terms_1.push({ term: item.term, tfidf: item.tfidf });
                    }
                });
                // Sort by TF-IDF score and take the top N
                return terms_1
                    .sort(function (a, b) { return b.tfidf - a.tfidf; })
                    .slice(0, maxKeywords)
                    .map(function (item) { return item.term; });
            }
            catch (error) {
                this.logger.error("Failed to extract keywords: ".concat(error.message));
                return [];
            }
        };
        /**
         * Calculate the similarity between two texts
         * @param text1 The first text
         * @param text2 The second text
         */
        NlpService_1.prototype.calculateSimilarity = function (text1, text2) {
            var _this = this;
            try {
                // Tokenize and stem both texts
                var tokens1 = this.tokenizeAndClean(text1).map(function (token) { return _this.stemmer.stem(token); });
                var tokens2 = this.tokenizeAndClean(text2).map(function (token) { return _this.stemmer.stem(token); });
                // Calculate Jaccard similarity
                var set1 = new Set(tokens1);
                var set2_1 = new Set(tokens2);
                var intersection = new Set(__spreadArray([], set1, true).filter(function (x) { return set2_1.has(x); }));
                var union = new Set(__spreadArray(__spreadArray([], set1, true), set2_1, true));
                return intersection.size / union.size;
            }
            catch (error) {
                this.logger.error("Failed to calculate similarity: ".concat(error.message));
                return 0;
            }
        };
        /**
         * Classify text into predefined categories
         * @param text The text to classify
         * @param categories The predefined categories with example texts
         */
        NlpService_1.prototype.classifyText = function (text, categories) {
            var _this = this;
            try {
                // Calculate similarity with each category
                var similarities = categories.map(function (category) {
                    // Calculate average similarity with all examples
                    var avgSimilarity = category.examples.reduce(function (sum, example) {
                        return sum + _this.calculateSimilarity(text, example);
                    }, 0) / category.examples.length;
                    return { category: category.name, similarity: avgSimilarity };
                });
                // Find the category with the highest similarity
                var bestMatch = similarities.sort(function (a, b) { return b.similarity - a.similarity; })[0];
                return bestMatch.similarity > 0.1 ? bestMatch.category : 'unknown';
            }
            catch (error) {
                this.logger.error("Failed to classify text: ".concat(error.message));
                return 'unknown';
            }
        };
        /**
         * Generate embeddings for text using a simple bag-of-words approach
         * @param text The text to generate embeddings for
         */
        NlpService_1.prototype.generateEmbeddings = function (text) {
            try {
                // Create a new TF-IDF instance
                var tfidf = new natural.TfIdf();
                // Add the document
                tfidf.addDocument(text);
                // Get the terms and their scores
                var terms = tfidf.listTerms(0);
                // Create a simple embedding (just the TF-IDF scores)
                return terms.map(function (term) { return term.tfidf; });
            }
            catch (error) {
                this.logger.error("Failed to generate embeddings: ".concat(error.message));
                return [];
            }
        };
        return NlpService_1;
    }());
    __setFunctionName(_classThis, "NlpService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NlpService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NlpService = _classThis;
}();
exports.NlpService = NlpService;
