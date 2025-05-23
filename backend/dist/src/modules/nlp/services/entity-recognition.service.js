"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EntityRecognitionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRecognitionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let EntityRecognitionService = EntityRecognitionService_1 = class EntityRecognitionService {
    constructor(configService, elasticsearchService) {
        this.configService = configService;
        this.elasticsearchService = elasticsearchService;
        this.logger = new common_1.Logger(EntityRecognitionService_1.name);
        this.categoryPatterns = [
            /(?:in|for|from|browse|shop|category:?)\s+([a-z\s&-]+)(?:category|section|department)?/i,
            /([a-z\s&-]+)(?:\s+category|\s+section|\s+department)/i,
        ];
        this.brandPatterns = [/(?:by|from|brand:?)\s+([a-z\s&-]+)/i, /([a-z\s&-]+)(?:\s+brand)/i];
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
        this.knownCategories = new Set([
            'clothing',
            'dresses',
            'tops',
            'bottoms',
            'pants',
            'jeans',
            'skirts',
            'shorts',
            'outerwear',
            'jackets',
            'coats',
            'sweaters',
            'activewear',
            'swimwear',
            'lingerie',
            'sleepwear',
            'accessories',
            'shoes',
            'bags',
            'jewelry',
            'watches',
            'sunglasses',
            'hats',
            'scarves',
            'gloves',
            'belts',
            'socks',
            'home',
            'bedding',
            'bath',
            'kitchen',
            'furniture',
            'decor',
            'beauty',
            'skincare',
            'makeup',
            'haircare',
            'fragrance',
            'wellness',
        ]);
        this.knownBrands = new Set([
            'avnu',
            'eco-collective',
            'sustainable threads',
            'green earth',
            'ethical choice',
            'conscious couture',
            'fair fashion',
            'earth friendly',
            'pure planet',
            'organic basics',
            'recycled revolution',
            'upcycled unique',
            'local luxe',
            'small batch beauty',
            'artisan alliance',
        ]);
        this.knownValues = new Set([
            'sustainable',
            'ethical',
            'eco-friendly',
            'organic',
            'vegan',
            'fair trade',
            'handmade',
            'recycled',
            'upcycled',
            'local',
            'small batch',
            'carbon neutral',
            'zero waste',
            'plastic free',
            'biodegradable',
            'compostable',
            'renewable',
            'cruelty-free',
            'non-toxic',
            'chemical-free',
        ]);
        this.knownColors = new Set([
            'black',
            'white',
            'red',
            'blue',
            'green',
            'yellow',
            'orange',
            'purple',
            'pink',
            'brown',
            'gray',
            'grey',
            'beige',
            'navy',
            'teal',
            'gold',
            'silver',
            'multicolor',
            'multi-color',
        ]);
        this.knownMaterials = new Set([
            'cotton',
            'organic cotton',
            'polyester',
            'recycled polyester',
            'wool',
            'silk',
            'linen',
            'leather',
            'vegan leather',
            'denim',
            'velvet',
            'satin',
            'nylon',
            'cashmere',
            'fleece',
            'suede',
            'canvas',
            'corduroy',
            'bamboo',
            'hemp',
            'tencel',
            'modal',
            'rayon',
            'viscose',
        ]);
        this.loadEntitiesFromElasticsearch();
    }
    async loadEntitiesFromElasticsearch() {
        try {
            const categoryResponse = await this.elasticsearchService.search({
                index: 'products',
                size: 0,
                aggs: {
                    categories: {
                        terms: {
                            field: 'categories.keyword',
                            size: 1000,
                        },
                    },
                },
            });
            let categoryAggregations;
            if ('aggregations' in categoryResponse && categoryResponse.aggregations) {
                categoryAggregations = categoryResponse.aggregations;
            }
            else {
                const anyResponse = categoryResponse;
                categoryAggregations = anyResponse.body?.aggregations;
            }
            const categoryBuckets = categoryAggregations?.categories?.buckets || [];
            categoryBuckets.forEach((bucket) => {
                this.knownCategories.add(bucket.key.toLowerCase());
            });
            const brandResponse = await this.elasticsearchService.search({
                index: 'products',
                size: 0,
                aggs: {
                    brands: {
                        terms: {
                            field: 'brand.keyword',
                            size: 1000,
                        },
                    },
                },
            });
            let brandAggregations;
            if ('aggregations' in brandResponse && brandResponse.aggregations) {
                brandAggregations = brandResponse.aggregations;
            }
            else {
                const anyResponse = brandResponse;
                brandAggregations = anyResponse.body?.aggregations;
            }
            const brandBuckets = brandAggregations?.brands?.buckets || [];
            brandBuckets.forEach((bucket) => {
                this.knownBrands.add(bucket.key.toLowerCase());
            });
            this.logger.log(`Loaded ${this.knownCategories.size} categories and ${this.knownBrands.size} brands from Elasticsearch`);
        }
        catch (error) {
            this.logger.error(`Failed to load entities from Elasticsearch: ${error.message}`);
        }
    }
    extractEntities(query, tokens) {
        try {
            const entities = [];
            this.extractCategories(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'category' });
            });
            this.extractBrands(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'brand' });
            });
            this.extractValues(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'value' });
            });
            this.extractSizes(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'size' });
            });
            this.extractColors(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'color' });
            });
            this.extractMaterials(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'material' });
            });
            this.extractPriceRanges(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'price' });
            });
            this.extractRatings(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'rating' });
            });
            this.extractDates(query, tokens).forEach(entity => {
                entities.push({ ...entity, type: 'date' });
            });
            const enhancedQuery = this.buildEnhancedQuery(query, entities);
            return {
                entities,
                enhancedQuery,
            };
        }
        catch (error) {
            this.logger.error(`Failed to extract entities: ${error.message}`);
            return {
                entities: [],
                enhancedQuery: query,
            };
        }
    }
    extractCategories(query, tokens) {
        const categories = [];
        for (const pattern of this.categoryPatterns) {
            const matches = [...query.matchAll(pattern)];
            for (const match of matches) {
                if (match[1]) {
                    const category = match[1].trim().toLowerCase();
                    if (this.knownCategories.has(category)) {
                        categories.push({ value: category, confidence: 0.9 });
                    }
                    else {
                        categories.push({ value: category, confidence: 0.7 });
                    }
                }
            }
        }
        for (const token of tokens) {
            if (this.knownCategories.has(token.toLowerCase())) {
                const exists = categories.some(cat => cat.value === token.toLowerCase());
                if (!exists) {
                    categories.push({ value: token.toLowerCase(), confidence: 0.8 });
                }
            }
        }
        for (let i = 0; i < tokens.length - 1; i++) {
            const bigramValue = `${tokens[i]} ${tokens[i + 1]}`.toLowerCase();
            if (this.knownCategories.has(bigramValue)) {
                const exists = categories.some(cat => cat.value === bigramValue);
                if (!exists) {
                    categories.push({ value: bigramValue, confidence: 0.85 });
                }
            }
        }
        return categories;
    }
    extractBrands(query, tokens) {
        const brands = [];
        for (const pattern of this.brandPatterns) {
            const matches = [...query.matchAll(pattern)];
            for (const match of matches) {
                if (match[1]) {
                    const brand = match[1].trim().toLowerCase();
                    if (this.knownBrands.has(brand)) {
                        brands.push({ value: brand, confidence: 0.9 });
                    }
                    else {
                        brands.push({ value: brand, confidence: 0.7 });
                    }
                }
            }
        }
        for (const token of tokens) {
            if (this.knownBrands.has(token.toLowerCase())) {
                const exists = brands.some(brand => brand.value === token.toLowerCase());
                if (!exists) {
                    brands.push({ value: token.toLowerCase(), confidence: 0.8 });
                }
            }
        }
        for (let i = 0; i < tokens.length - 1; i++) {
            const bigramValue = `${tokens[i]} ${tokens[i + 1]}`.toLowerCase();
            if (this.knownBrands.has(bigramValue)) {
                const exists = brands.some(brand => brand.value === bigramValue);
                if (!exists) {
                    brands.push({ value: bigramValue, confidence: 0.85 });
                }
            }
        }
        return brands;
    }
    extractValues(query, tokens) {
        const values = [];
        const matches = [...query.matchAll(this.valuePatterns[0])];
        for (const match of matches) {
            if (match[0]) {
                const value = match[0].trim().toLowerCase();
                values.push({ value, confidence: 0.9 });
            }
        }
        for (const token of tokens) {
            if (this.knownValues.has(token.toLowerCase())) {
                const exists = values.some(val => val.value === token.toLowerCase());
                if (!exists) {
                    values.push({ value: token.toLowerCase(), confidence: 0.8 });
                }
            }
        }
        for (let i = 0; i < tokens.length - 1; i++) {
            const bigramValue = `${tokens[i]} ${tokens[i + 1]}`.toLowerCase();
            if (this.knownValues.has(bigramValue)) {
                const exists = values.some(val => val.value === bigramValue);
                if (!exists) {
                    values.push({ value: bigramValue, confidence: 0.85 });
                }
            }
        }
        return values;
    }
    extractSizes(query, _tokens) {
        const sizes = [];
        for (const pattern of this.sizePatterns) {
            const matches = [...query.matchAll(pattern)];
            for (const match of matches) {
                if (match[0]) {
                    const size = match[0].trim().toLowerCase();
                    sizes.push({ value: size, confidence: 0.9 });
                }
            }
        }
        return sizes;
    }
    extractColors(query, tokens) {
        const colors = [];
        for (const pattern of this.colorPatterns) {
            const matches = [...query.matchAll(pattern)];
            for (const match of matches) {
                if (match[0]) {
                    const color = match[0].trim().toLowerCase();
                    if (this.knownColors.has(color)) {
                        colors.push({ value: color, confidence: 0.9 });
                    }
                    else {
                        colors.push({ value: color, confidence: 0.7 });
                    }
                }
            }
        }
        for (const token of tokens) {
            if (this.knownColors.has(token.toLowerCase())) {
                const exists = colors.some(col => col.value === token.toLowerCase());
                if (!exists) {
                    colors.push({ value: token.toLowerCase(), confidence: 0.8 });
                }
            }
        }
        return colors;
    }
    extractMaterials(query, tokens) {
        const materials = [];
        for (const pattern of this.materialPatterns) {
            const matches = [...query.matchAll(pattern)];
            for (const match of matches) {
                if (match[0]) {
                    const material = match[0].trim().toLowerCase();
                    if (this.knownMaterials.has(material)) {
                        materials.push({ value: material, confidence: 0.9 });
                    }
                    else {
                        materials.push({ value: material, confidence: 0.7 });
                    }
                }
            }
        }
        for (const token of tokens) {
            if (this.knownMaterials.has(token.toLowerCase())) {
                const exists = materials.some(mat => mat.value === token.toLowerCase());
                if (!exists) {
                    materials.push({ value: token.toLowerCase(), confidence: 0.8 });
                }
            }
        }
        return materials;
    }
    extractPriceRanges(query, _tokens) {
        const prices = [];
        const priceRangeRegex = /\$(\d+(?:\.\d+)?)\s*(?:to|-)\s*\$(\d+(?:\.\d+)?)/gi;
        const priceMatches = query.match(priceRangeRegex);
        if (priceMatches) {
            priceMatches.forEach(match => {
                const priceValues = match.match(/\$\d+(?:\.\d+)?/g);
                if (priceValues && priceValues.length === 2) {
                    const minPrice = parseFloat(priceValues[0].substring(1));
                    const maxPrice = parseFloat(priceValues[1].substring(1));
                    prices.push({ value: `${minPrice}-${maxPrice}`, confidence: 0.95 });
                }
            });
        }
        const priceModifierRegex = /(?:under|less\s+than|below|above|over|more\s+than)\s+\$(\d+(?:\.\d+)?)/gi;
        const modifierMatches = [...query.matchAll(priceModifierRegex)];
        modifierMatches.forEach(match => {
            if (match[1]) {
                const price = parseFloat(match[1]);
                const modifier = match[0].toLowerCase().includes('under') ||
                    match[0].toLowerCase().includes('less than') ||
                    match[0].toLowerCase().includes('below')
                    ? 'max'
                    : 'min';
                prices.push({
                    value: modifier === 'max' ? `0-${price}` : `${price}-9999`,
                    confidence: 0.9,
                });
            }
        });
        const qualifierRegex = /(?:cheap|affordable|budget|inexpensive|expensive|luxury|high-end|premium)/gi;
        const qualifierMatches = [...query.matchAll(qualifierRegex)];
        qualifierMatches.forEach(match => {
            if (match[0]) {
                const qualifier = match[0].toLowerCase();
                let value = '';
                const confidence = 0.7;
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
                prices.push({ value, confidence });
            }
        });
        return prices;
    }
    extractRatings(query, _tokens) {
        const ratings = [];
        const ratingRegex = /(\d+(?:\.\d+)?)\s*(?:star|stars)/gi;
        const ratingMatches = [...query.matchAll(ratingRegex)];
        ratingMatches.forEach(match => {
            if (match[1]) {
                const rating = parseFloat(match[1]);
                if (rating >= 0 && rating <= 5) {
                    ratings.push({ value: rating.toString(), confidence: 0.9 });
                }
            }
        });
        const modifierRegex = /(?:above|over|more\s+than)\s+(\d+(?:\.\d+)?)\s*(?:star|stars)/gi;
        const modifierMatches = [...query.matchAll(modifierRegex)];
        modifierMatches.forEach(match => {
            if (match[1]) {
                const rating = parseFloat(match[1]);
                if (rating >= 0 && rating <= 5) {
                    ratings.push({ value: `${rating}+`, confidence: 0.85 });
                }
            }
        });
        if (query.match(/(?:top|best|highest)\s+rated/i)) {
            ratings.push({ value: '4+', confidence: 0.8 });
        }
        return ratings;
    }
    extractDates(query, _tokens) {
        const dates = [];
        if (query.match(/(?:new|newest|latest|recent)/i)) {
            dates.push({ value: 'recent', confidence: 0.8 });
        }
        if (query.match(/this\s+week/i)) {
            dates.push({ value: 'this_week', confidence: 0.9 });
        }
        else if (query.match(/this\s+month/i)) {
            dates.push({ value: 'this_month', confidence: 0.9 });
        }
        else if (query.match(/this\s+year/i)) {
            dates.push({ value: 'this_year', confidence: 0.9 });
        }
        const yearRegex = /(?:from|since)\s+(\d{4})/i;
        const yearMatch = query.match(yearRegex);
        if (yearMatch && yearMatch[1]) {
            const year = parseInt(yearMatch[1]);
            const currentYear = new Date().getFullYear();
            if (year >= 2000 && year <= currentYear) {
                dates.push({ value: `since_${year}`, confidence: 0.9 });
            }
        }
        return dates;
    }
    buildEnhancedQuery(originalQuery, _entities) {
        return originalQuery;
    }
};
exports.EntityRecognitionService = EntityRecognitionService;
exports.EntityRecognitionService = EntityRecognitionService = EntityRecognitionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        elasticsearch_1.ElasticsearchService])
], EntityRecognitionService);
//# sourceMappingURL=entity-recognition.service.js.map