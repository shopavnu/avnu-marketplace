"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EnhancedNlpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedNlpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const natural = __importStar(require("natural"));
const stopwords_en_1 = __importDefault(require("stopwords-en"));
const query_expansion_service_1 = require("./query-expansion.service");
const entity_recognition_service_1 = require("./entity-recognition.service");
const intent_detection_service_1 = require("./intent-detection.service");
let EnhancedNlpService = EnhancedNlpService_1 = class EnhancedNlpService {
    constructor(configService, queryExpansionService, entityRecognitionService, intentDetectionService) {
        this.configService = configService;
        this.queryExpansionService = queryExpansionService;
        this.entityRecognitionService = entityRecognitionService;
        this.intentDetectionService = intentDetectionService;
        this.logger = new common_1.Logger(EnhancedNlpService_1.name);
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.minTokenLength = this.configService.get('nlp.minTokenLength', 2);
    }
    async processQuery(query) {
        try {
            const tokens = this.tokenizeAndClean(query);
            const stems = tokens.map(token => this.stemmer.stem(token));
            const entityResult = this.entityRecognitionService.extractEntities(query, tokens);
            const entities = entityResult.entities;
            const intentResult = this.intentDetectionService.detectIntent(query, tokens);
            const intent = {
                primary: intentResult.intent,
                confidence: intentResult.confidence,
                secondary: intentResult.subIntents,
            };
            const expansionResult = await this.queryExpansionService.expandQuery(query, tokens);
            const expandedQuery = expansionResult.expandedQuery;
            const expansionTerms = expansionResult.expandedTerms;
            const searchParameters = this.intentDetectionService.getSearchParameters(intentResult.intent, entities);
            const processedQuery = this.buildProcessedQuery(query, tokens, entities);
            return {
                originalQuery: query,
                processedQuery,
                expandedQuery,
                tokens,
                stems,
                entities,
                intent,
                expansionTerms,
                searchParameters,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process query: ${error.message}`);
            return {
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
            };
        }
    }
    tokenizeAndClean(query) {
        const tokens = this.tokenizer.tokenize(query.toLowerCase());
        return tokens.filter(token => !stopwords_en_1.default.includes(token) && token.length > this.minTokenLength && !/^\d+$/.test(token));
    }
    buildProcessedQuery(originalQuery, tokens, entities) {
        if (entities.length === 0) {
            return originalQuery;
        }
        const entityValues = entities.map(entity => entity.value.toLowerCase());
        const filteredTokens = tokens.filter(token => !entityValues.includes(token));
        if (filteredTokens.length > 0) {
            return filteredTokens.join(' ');
        }
        return originalQuery;
    }
    async analyzeQuery(query) {
        try {
            const tokens = this.tokenizeAndClean(query);
            const stems = tokens.map(token => this.stemmer.stem(token));
            const entityResult = this.entityRecognitionService.extractEntities(query, tokens);
            const entities = entityResult.entities;
            const intentResult = this.intentDetectionService.detectIntent(query, tokens);
            const intent = {
                primary: intentResult.intent,
                confidence: intentResult.confidence,
                secondary: intentResult.subIntents,
            };
            const expansionInfo = await this.queryExpansionService.getExpansionInfo(query, tokens);
            const searchParameters = this.intentDetectionService.getSearchParameters(intentResult.intent, entities);
            return {
                originalQuery: query,
                tokens,
                stems,
                entities,
                intent,
                expansion: {
                    expandedQuery: expansionInfo.expandedQuery,
                    expansionTerms: expansionInfo.expansionTerms,
                    expansionSources: expansionInfo.expansionSources,
                },
                searchParameters,
            };
        }
        catch (error) {
            this.logger.error(`Failed to analyze query: ${error.message}`);
            return {
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
            };
        }
    }
};
exports.EnhancedNlpService = EnhancedNlpService;
exports.EnhancedNlpService = EnhancedNlpService = EnhancedNlpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        query_expansion_service_1.QueryExpansionService,
        entity_recognition_service_1.EntityRecognitionService,
        intent_detection_service_1.IntentDetectionService])
], EnhancedNlpService);
//# sourceMappingURL=enhanced-nlp.service.js.map