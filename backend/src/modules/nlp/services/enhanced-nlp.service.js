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
exports.EnhancedNlpService = void 0;
var common_1 = require("@nestjs/common");
var natural = require("natural");
// Using require for modules without type definitions
// @ts-expect-error - No type definitions for stopwords-en
var stopwords_en_1 = require("stopwords-en");
var EnhancedNlpService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EnhancedNlpService = _classThis = /** @class */ (function () {
        function EnhancedNlpService_1(configService, queryExpansionService, entityRecognitionService, intentDetectionService) {
            this.configService = configService;
            this.queryExpansionService = queryExpansionService;
            this.entityRecognitionService = entityRecognitionService;
            this.intentDetectionService = intentDetectionService;
            this.logger = new common_1.Logger(EnhancedNlpService.name);
            this.tokenizer = new natural.WordTokenizer();
            this.stemmer = natural.PorterStemmer;
            this.minTokenLength = this.configService.get('nlp.minTokenLength', 2);
        }
        /**
         * Process a natural language query to extract key terms, entities, and intent
         * @param query The natural language query
         */
        EnhancedNlpService_1.prototype.processQuery = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens, stems, entityResult, entities, intentResult, intent, expansionResult, expandedQuery, expansionTerms, searchParameters, processedQuery, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            tokens = this.tokenizeAndClean(query);
                            stems = tokens.map(function (token) { return _this.stemmer.stem(token); });
                            entityResult = this.entityRecognitionService.extractEntities(query, tokens);
                            entities = entityResult.entities;
                            intentResult = this.intentDetectionService.detectIntent(query, tokens);
                            intent = {
                                primary: intentResult.intent,
                                confidence: intentResult.confidence,
                                secondary: intentResult.subIntents,
                            };
                            return [4 /*yield*/, this.queryExpansionService.expandQuery(query, tokens)];
                        case 1:
                            expansionResult = _a.sent();
                            expandedQuery = expansionResult.expandedQuery;
                            expansionTerms = expansionResult.expandedTerms;
                            searchParameters = this.intentDetectionService.getSearchParameters(intentResult.intent, entities);
                            processedQuery = this.buildProcessedQuery(query, tokens, entities);
                            return [2 /*return*/, {
                                    originalQuery: query,
                                    processedQuery: processedQuery,
                                    expandedQuery: expandedQuery,
                                    tokens: tokens,
                                    stems: stems,
                                    entities: entities,
                                    intent: intent,
                                    expansionTerms: expansionTerms,
                                    searchParameters: searchParameters,
                                }];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error("Failed to process query: ".concat(error_1.message));
                            return [2 /*return*/, {
                                    originalQuery: query,
                                    processedQuery: query,
                                    expandedQuery: query,
                                    tokens: [],
                                    stems: [],
                                    entities: [],
                                    intent: {
                                        primary: 'product_search',
                                        confidence: 0.5,
                                        secondary: [],
                                    },
                                    expansionTerms: [],
                                    searchParameters: {
                                        boost: {},
                                        sort: [],
                                        filters: {},
                                    },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Tokenize and clean a query
         * @param query The query to tokenize
         */
        EnhancedNlpService_1.prototype.tokenizeAndClean = function (query) {
            var _this = this;
            // Tokenize
            var tokens = this.tokenizer.tokenize(query.toLowerCase());
            // Remove stopwords
            return tokens.filter(function (token) {
                return !stopwords_en_1.default.includes(token) && token.length > _this.minTokenLength && !/^\d+$/.test(token);
            });
        };
        /**
         * Build a processed query for search
         * @param originalQuery The original query
         * @param tokens The tokenized query
         * @param entities The extracted entities
         */
        EnhancedNlpService_1.prototype.buildProcessedQuery = function (originalQuery, tokens, entities) {
            // For simple cases, just return the original query
            if (entities.length === 0) {
                return originalQuery;
            }
            // Remove entity values from tokens to focus on the main search terms
            var entityValues = entities.map(function (entity) { return entity.value.toLowerCase(); });
            var filteredTokens = tokens.filter(function (token) { return !entityValues.includes(token); });
            // If we have filtered tokens, use them as the processed query
            if (filteredTokens.length > 0) {
                return filteredTokens.join(' ');
            }
            // If we've filtered out all tokens, return the original query
            return originalQuery;
        };
        /**
         * Get detailed analysis of a query for debugging and analytics
         * @param query The query to analyze
         */
        EnhancedNlpService_1.prototype.analyzeQuery = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens, stems, entityResult, entities, intentResult, intent, expansionInfo, searchParameters, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            tokens = this.tokenizeAndClean(query);
                            stems = tokens.map(function (token) { return _this.stemmer.stem(token); });
                            entityResult = this.entityRecognitionService.extractEntities(query, tokens);
                            entities = entityResult.entities;
                            intentResult = this.intentDetectionService.detectIntent(query, tokens);
                            intent = {
                                primary: intentResult.intent,
                                confidence: intentResult.confidence,
                                secondary: intentResult.subIntents,
                            };
                            return [4 /*yield*/, this.queryExpansionService.getExpansionInfo(query, tokens)];
                        case 1:
                            expansionInfo = _a.sent();
                            searchParameters = this.intentDetectionService.getSearchParameters(intentResult.intent, entities);
                            return [2 /*return*/, {
                                    originalQuery: query,
                                    tokens: tokens,
                                    stems: stems,
                                    entities: entities,
                                    intent: intent,
                                    expansion: {
                                        expandedQuery: expansionInfo.expandedQuery,
                                        expansionTerms: expansionInfo.expansionTerms,
                                        expansionSources: expansionInfo.expansionSources,
                                    },
                                    searchParameters: searchParameters,
                                }];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error("Failed to analyze query: ".concat(error_2.message));
                            return [2 /*return*/, {
                                    originalQuery: query,
                                    tokens: [],
                                    stems: [],
                                    entities: [],
                                    intent: {
                                        primary: 'product_search',
                                        confidence: 0.5,
                                        secondary: [],
                                    },
                                    expansion: {
                                        expandedQuery: query,
                                        expansionTerms: [],
                                        expansionSources: {},
                                    },
                                    searchParameters: {
                                        boost: {},
                                        sort: [],
                                        filters: {},
                                    },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return EnhancedNlpService_1;
    }());
    __setFunctionName(_classThis, "EnhancedNlpService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EnhancedNlpService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EnhancedNlpService = _classThis;
}();
exports.EnhancedNlpService = EnhancedNlpService;
