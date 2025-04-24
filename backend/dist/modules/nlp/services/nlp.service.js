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
var NlpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpService = void 0;
const common_1 = require("@nestjs/common");
const natural = __importStar(require("natural"));
const config_1 = require("@nestjs/config");
const stopwords_en_1 = __importDefault(require("stopwords-en"));
let NlpService = NlpService_1 = class NlpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NlpService_1.name);
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.tfidf = new natural.TfIdf();
        this.minTokenLength = this.configService.get('nlp.minTokenLength', 2);
    }
    processQuery(query) {
        try {
            const tokens = this.tokenizeAndClean(query);
            const stems = tokens.map(token => this.stemmer.stem(token));
            const entities = this.extractEntities(query, tokens);
            const intent = this.determineIntent(query, tokens);
            const filters = this.extractFilters(query, entities);
            const processedQuery = this.buildProcessedQuery(tokens, entities);
            return {
                originalQuery: query,
                processedQuery,
                tokens,
                stems,
                entities,
                intent,
                filters,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process query: ${error.message}`);
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
    }
    tokenizeAndClean(query) {
        const tokens = this.tokenizer.tokenize(query.toLowerCase());
        return tokens.filter(token => !stopwords_en_1.default.includes(token) && token.length > this.minTokenLength && !/^\d+$/.test(token));
    }
    extractEntities(query, tokens) {
        const entities = [];
        const priceRangeRegex = /(\$\d+(?:\.\d+)?)\s*(?:to|-)\s*(\$\d+(?:\.\d+)?)/gi;
        const priceMatches = query.match(priceRangeRegex);
        if (priceMatches) {
            priceMatches.forEach(match => {
                const prices = match.match(/\$\d+(?:\.\d+)?/g);
                if (prices && prices.length === 2) {
                    const minPrice = parseFloat(prices[0].substring(1));
                    const maxPrice = parseFloat(prices[1].substring(1));
                    entities.push({ type: 'priceRange', value: `${minPrice}-${maxPrice}` });
                }
            });
        }
        const singlePriceRegex = /(?:under|less than|below|above|over|more than)\s*\$(\d+(?:\.\d+)?)/gi;
        const singlePriceMatches = [...query.matchAll(singlePriceRegex)];
        singlePriceMatches.forEach(match => {
            const price = parseFloat(match[1]);
            const modifier = match[0].toLowerCase().includes('under') ||
                match[0].toLowerCase().includes('less than') ||
                match[0].toLowerCase().includes('below')
                ? 'max'
                : 'min';
            entities.push({
                type: modifier === 'max' ? 'maxPrice' : 'minPrice',
                value: price.toString(),
            });
        });
        const categoryIndicators = ['category', 'categories', 'in', 'from', 'section'];
        const categoryMatches = this.findEntityAfterIndicator(query, tokens, categoryIndicators);
        categoryMatches.forEach(category => {
            entities.push({ type: 'category', value: category });
        });
        const brandIndicators = ['brand', 'by', 'from', 'made by'];
        const brandMatches = this.findEntityAfterIndicator(query, tokens, brandIndicators);
        brandMatches.forEach(brand => {
            entities.push({ type: 'brand', value: brand });
        });
        const valueIndicators = [
            'sustainable',
            'ethical',
            'eco-friendly',
            'organic',
            'fair trade',
            'handmade',
        ];
        valueIndicators.forEach(value => {
            if (query.toLowerCase().includes(value.toLowerCase())) {
                entities.push({ type: 'value', value });
            }
        });
        return entities;
    }
    findEntityAfterIndicator(query, tokens, indicators) {
        const entities = [];
        const words = query.toLowerCase().split(/\s+/);
        indicators.forEach(indicator => {
            const index = words.findIndex(word => word === indicator);
            if (index !== -1 && index < words.length - 1) {
                entities.push(words[index + 1]);
                if (index < words.length - 2 && !indicators.includes(words[index + 2])) {
                    entities.push(`${words[index + 1]} ${words[index + 2]}`);
                }
            }
        });
        return entities;
    }
    determineIntent(query, tokens) {
        const filterIndicators = ['filter', 'show', 'find', 'where', 'with'];
        for (const indicator of filterIndicators) {
            if (tokens.includes(indicator)) {
                return 'filter';
            }
        }
        const sortIndicators = ['sort', 'order', 'arrange'];
        for (const indicator of sortIndicators) {
            if (tokens.includes(indicator)) {
                return 'sort';
            }
        }
        return 'search';
    }
    extractFilters(query, entities) {
        const filters = {};
        entities.forEach(entity => {
            switch (entity.type) {
                case 'priceRange':
                    const [min, max] = entity.value.split('-').map(parseFloat);
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
        if (query.toLowerCase().includes('in stock') || query.toLowerCase().includes('available')) {
            filters.inStock = true;
        }
        return filters;
    }
    buildProcessedQuery(tokens, entities) {
        const entityValues = entities.map(entity => entity.value.toLowerCase());
        const filteredTokens = tokens.filter(token => !entityValues.includes(token));
        return filteredTokens.join(' ');
    }
    extractKeywords(text, maxKeywords = 5) {
        try {
            const tfidf = new natural.TfIdf();
            tfidf.addDocument(text);
            const terms = [];
            tfidf.listTerms(0).forEach(item => {
                if (!stopwords_en_1.default.includes(item.term) && item.term.length > 2) {
                    terms.push({ term: item.term, tfidf: item.tfidf });
                }
            });
            return terms
                .sort((a, b) => b.tfidf - a.tfidf)
                .slice(0, maxKeywords)
                .map(item => item.term);
        }
        catch (error) {
            this.logger.error(`Failed to extract keywords: ${error.message}`);
            return [];
        }
    }
    calculateSimilarity(text1, text2) {
        try {
            const tokens1 = this.tokenizeAndClean(text1).map(token => this.stemmer.stem(token));
            const tokens2 = this.tokenizeAndClean(text2).map(token => this.stemmer.stem(token));
            const set1 = new Set(tokens1);
            const set2 = new Set(tokens2);
            const intersection = new Set([...set1].filter(x => set2.has(x)));
            const union = new Set([...set1, ...set2]);
            return intersection.size / union.size;
        }
        catch (error) {
            this.logger.error(`Failed to calculate similarity: ${error.message}`);
            return 0;
        }
    }
    classifyText(text, categories) {
        try {
            const similarities = categories.map(category => {
                const avgSimilarity = category.examples.reduce((sum, example) => {
                    return sum + this.calculateSimilarity(text, example);
                }, 0) / category.examples.length;
                return { category: category.name, similarity: avgSimilarity };
            });
            const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];
            return bestMatch.similarity > 0.1 ? bestMatch.category : 'unknown';
        }
        catch (error) {
            this.logger.error(`Failed to classify text: ${error.message}`);
            return 'unknown';
        }
    }
    generateEmbeddings(text) {
        try {
            const tfidf = new natural.TfIdf();
            tfidf.addDocument(text);
            const terms = tfidf.listTerms(0);
            return terms.map(term => term.tfidf);
        }
        catch (error) {
            this.logger.error(`Failed to generate embeddings: ${error.message}`);
            return [];
        }
    }
};
exports.NlpService = NlpService;
exports.NlpService = NlpService = NlpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NlpService);
//# sourceMappingURL=nlp.service.js.map