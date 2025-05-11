'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var IntentDetectionService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.IntentDetectionService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const natural = __importStar(require('natural'));
let IntentDetectionService = (IntentDetectionService_1 = class IntentDetectionService {
  constructor(configService) {
    this.configService = configService;
    this.logger = new common_1.Logger(IntentDetectionService_1.name);
    this.classifier = new natural.BayesClassifier();
    this.confidenceThreshold = this.configService.get('nlp.intentConfidenceThreshold', 0.6);
    this.intentPatterns = {
      product_search: [
        /(?:find|show|search for|looking for|need)\s+(?:a|an|some)?\s+([a-z\s&-]+)/i,
        /(?:where can i find|do you have|is there)\s+(?:a|an|some)?\s+([a-z\s&-]+)/i,
      ],
      category_browse: [
        /(?:browse|explore|show me|view|see)\s+(?:all|the)?\s+([a-z\s&-]+)/i,
        /(?:what|which)\s+([a-z\s&-]+)\s+(?:do you have|are available|can i find)/i,
      ],
      brand_specific: [/(?:by|from)\s+([a-z\s&-]+)/i, /([a-z\s&-]+)\s+brand/i],
      price_query: [
        /(?:how much|what is the price of|cost of|price for)\s+([a-z\s&-]+)/i,
        /(?:under|less than|below|above|over|more than)\s+\$(\d+)/i,
        /\$(\d+)\s*(?:to|-)\s*\$(\d+)/i,
      ],
      value_driven: [
        /(?:sustainable|ethical|eco-friendly|organic|vegan|fair trade|handmade|recycled|upcycled|local|small batch)/i,
        /(?:environmentally friendly|socially responsible|ethically made|eco conscious)/i,
      ],
      comparison: [
        /(?:compare|difference between|vs|versus|or)\s+([a-z\s&-]+)\s+(?:and|or|vs|versus)\s+([a-z\s&-]+)/i,
        /(?:which is better|what's better|better option)\s+([a-z\s&-]+)\s+(?:or|vs|versus)\s+([a-z\s&-]+)/i,
      ],
      recommendation: [
        /(?:recommend|suggest|what do you recommend|what should i|best)\s+([a-z\s&-]+)/i,
        /(?:what are the best|top|popular|trending)\s+([a-z\s&-]+)/i,
      ],
      availability: [
        /(?:is|are)\s+([a-z\s&-]+)\s+(?:in stock|available|in)/i,
        /(?:do you have|availability of)\s+([a-z\s&-]+)/i,
      ],
      filter: [
        /(?:filter|show only|limit to|restrict to)\s+([a-z\s&-]+)/i,
        /(?:by|with)\s+([a-z\s&-]+)\s+(?:only|filter)/i,
      ],
      sort: [
        /(?:sort|order|arrange)\s+(?:by|on)\s+([a-z\s&-]+)/i,
        /(?:sort|order|arrange)\s+([a-z\s&-]+)\s+(?:by|on)\s+([a-z\s&-]+)/i,
      ],
    };
    this.intentKeywords = {
      product_search: ['find', 'search', 'looking', 'need', 'want', 'show', 'get'],
      category_browse: ['browse', 'explore', 'view', 'see', 'category', 'categories', 'all'],
      brand_specific: ['brand', 'by', 'from', 'made by', 'manufacturer'],
      price_query: [
        'price',
        'cost',
        'how much',
        'affordable',
        'expensive',
        'cheap',
        'budget',
        'luxury',
      ],
      value_driven: [
        'sustainable',
        'ethical',
        'eco-friendly',
        'organic',
        'vegan',
        'fair trade',
        'handmade',
        'recycled',
        'local',
      ],
      comparison: ['compare', 'comparison', 'difference', 'versus', 'vs', 'or', 'better', 'best'],
      recommendation: ['recommend', 'suggest', 'best', 'top', 'popular', 'trending', 'rated'],
      availability: ['available', 'in stock', 'stock', 'inventory', 'when'],
      filter: ['filter', 'only', 'limit', 'restrict', 'with', 'has', 'have'],
      sort: ['sort', 'order', 'arrange', 'ranking', 'highest', 'lowest'],
    };
    this.intentExamples = {
      product_search: [
        'find a black dress',
        'looking for organic cotton t-shirts',
        'search for eco-friendly water bottles',
        'need a new pair of sustainable jeans',
        'show me vegan leather bags',
        'find recycled plastic sunglasses',
        'I need a fair trade coffee mug',
      ],
      category_browse: [
        'browse sustainable clothing',
        'explore eco-friendly home goods',
        'show me all vegan products',
        'view organic skincare',
        'see all recycled items',
        'what sustainable products do you have',
        'which ethical brands are available',
      ],
      brand_specific: [
        'products by Eco Collective',
        'items from Sustainable Threads',
        'Green Earth brand',
        'show me Ethical Choice products',
        'find Conscious Couture dresses',
        'Fair Fashion jeans',
        'Earth Friendly cleaning products',
      ],
      price_query: [
        'how much are organic cotton sheets',
        'price of sustainable yoga mats',
        'cost of eco-friendly water bottles',
        'products under $50',
        'items between $20 and $100',
        'affordable ethical clothing',
        'luxury sustainable fashion',
      ],
      value_driven: [
        'sustainable kitchen products',
        'ethical jewelry brands',
        'eco-friendly cleaning supplies',
        'organic cotton bedding',
        'vegan leather alternatives',
        'fair trade chocolate',
        'locally made furniture',
      ],
      comparison: [
        'compare organic cotton vs recycled polyester',
        'difference between vegan leather and real leather',
        'bamboo or recycled plastic toothbrushes',
        'which is better silk or tencel',
        'sustainable vs conventional cotton',
        'compare Eco Collective and Green Earth brands',
        'recycled paper or bamboo toilet paper',
      ],
      recommendation: [
        'recommend sustainable gifts under $30',
        'suggest eco-friendly cleaning products',
        'what are the best vegan leather bags',
        'top rated organic skincare',
        'popular sustainable fashion brands',
        'best value eco-friendly products',
        'trending ethical jewelry',
      ],
      availability: [
        'are organic cotton sheets in stock',
        'do you have bamboo toothbrushes',
        'availability of recycled paper notebooks',
        'is the eco-friendly water bottle available',
        'when will sustainable yoga mats be back in stock',
        'check stock for vegan leather bags',
        'are fair trade coffee beans available',
      ],
      filter: [
        'filter by sustainable materials',
        'show only vegan products',
        'limit to local brands',
        'restrict to items under $50',
        'filter by 4+ star rating',
        'show only organic options',
        'with recycled packaging only',
      ],
      sort: [
        'sort by price low to high',
        'order by customer rating',
        'arrange by newest first',
        'sort sustainable clothing by price',
        'order vegan products by popularity',
        'arrange by eco-friendliness score',
        'sort by distance from local',
      ],
    };
    this.trainClassifier();
  }
  trainClassifier() {
    try {
      Object.keys(this.intentExamples).forEach(intent => {
        this.intentExamples[intent].forEach(example => {
          this.classifier.addDocument(example.toLowerCase(), intent);
        });
      });
      this.classifier.train();
      this.logger.log('Intent classifier trained successfully');
    } catch (error) {
      this.logger.error(`Failed to train intent classifier: ${error.message}`);
    }
  }
  detectIntent(query, _tokens) {
    try {
      for (const intent in this.intentPatterns) {
        for (const pattern of this.intentPatterns[intent]) {
          if (pattern.test(query)) {
            return {
              intent,
              confidence: 0.9,
              subIntents: [],
            };
          }
        }
      }
      const keywordScores = {};
      let totalKeywordMatches = 0;
      for (const intent in this.intentKeywords) {
        keywordScores[intent] = 0;
        for (const keyword of this.intentKeywords[intent]) {
          if (query.toLowerCase().includes(keyword.toLowerCase())) {
            keywordScores[intent] += 1;
            totalKeywordMatches += 1;
          }
        }
      }
      if (totalKeywordMatches > 0) {
        const keywordIntents = [];
        for (const intent in keywordScores) {
          if (keywordScores[intent] > 0) {
            const confidence = keywordScores[intent] / totalKeywordMatches;
            keywordIntents.push({ intent, confidence });
          }
        }
        keywordIntents.sort((a, b) => b.confidence - a.confidence);
        if (keywordIntents.length > 0 && keywordIntents[0].confidence >= this.confidenceThreshold) {
          return {
            intent: keywordIntents[0].intent,
            confidence: keywordIntents[0].confidence,
            subIntents: keywordIntents.slice(1),
          };
        }
      }
      const classifications = this.classifier.getClassifications(query.toLowerCase());
      if (classifications.length > 0 && classifications[0].value >= this.confidenceThreshold) {
        return {
          intent: classifications[0].label,
          confidence: classifications[0].value,
          subIntents: classifications.slice(1).map(c => ({ intent: c.label, confidence: c.value })),
        };
      }
      return {
        intent: 'product_search',
        confidence: 0.5,
        subIntents: [],
      };
    } catch (error) {
      this.logger.error(`Failed to detect intent: ${error.message}`);
      return {
        intent: 'product_search',
        confidence: 0.5,
        subIntents: [],
      };
    }
  }
  getSearchParameters(intent, entities, query) {
    const searchParams = {
      boost: {},
      sort: [],
      filters: {},
    };
    switch (intent) {
      case 'product_search':
        searchParams.boost = { name: 2.0, description: 1.0, categories: 1.5 };
        break;
      case 'category_browse':
        searchParams.boost = { categories: 3.0, name: 1.0, description: 0.5 };
        const categoryEntities = entities.filter(e => e.type === 'category');
        if (categoryEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            categories: categoryEntities.map(e => e.value),
          };
        }
        break;
      case 'brand_specific':
        searchParams.boost = { brand: 3.0, name: 1.0 };
        const brandEntities = entities.filter(e => e.type === 'brand');
        if (brandEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            brands: brandEntities.map(e => e.value),
          };
        }
        break;
      case 'price_query':
        searchParams.sort.push({ field: 'price', order: 'asc' });
        const priceEntities = entities.filter(e => e.type === 'price');
        if (priceEntities.length > 0) {
          const priceValues = priceEntities[0].value.split('-');
          if (priceValues.length === 2) {
            searchParams.filters = {
              ...searchParams.filters,
              priceMin: parseFloat(priceValues[0]),
              priceMax: parseFloat(priceValues[1]),
            };
          }
        }
        break;
      case 'value_driven':
        searchParams.boost = { values: 3.0, description: 2.0, name: 1.0 };
        const valueEntities = entities.filter(e => e.type === 'value');
        if (valueEntities.length > 0) {
          searchParams.filters = {
            ...searchParams.filters,
            values: valueEntities.map(e => e.value),
          };
        }
        break;
      case 'comparison':
        break;
      case 'recommendation':
        searchParams.sort.push({ field: 'rating', order: 'desc' });
        searchParams.boost = { rating: 2.0, reviewCount: 1.5, name: 1.0 };
        break;
      case 'availability':
        searchParams.filters = {
          ...searchParams.filters,
          inStock: true,
        };
        break;
      case 'filter':
        entities.forEach(entity => {
          switch (entity.type) {
            case 'category': {
              const categories = searchParams.filters.categories || [];
              searchParams.filters = {
                ...searchParams.filters,
                categories: [...categories, entity.value],
              };
              break;
            }
            case 'brand': {
              const brands = searchParams.filters.brands || [];
              searchParams.filters = {
                ...searchParams.filters,
                brands: [...brands, entity.value],
              };
              break;
            }
            case 'value': {
              const values = searchParams.filters.values || [];
              searchParams.filters = {
                ...searchParams.filters,
                values: [...values, entity.value],
              };
              break;
            }
            case 'price': {
              const priceValues = entity.value.split('-');
              if (priceValues.length === 2) {
                searchParams.filters = {
                  ...searchParams.filters,
                  priceMin: parseFloat(priceValues[0]),
                  priceMax: parseFloat(priceValues[1]),
                };
              }
              break;
            }
            case 'rating': {
              if (entity.value.includes('+')) {
                searchParams.filters = {
                  ...searchParams.filters,
                  ratingMin: parseFloat(entity.value.replace('+', '')),
                };
              } else {
                searchParams.filters = {
                  ...searchParams.filters,
                  rating: parseFloat(entity.value),
                };
              }
              break;
            }
            case 'color': {
              const colors = searchParams.filters.colors || [];
              searchParams.filters = {
                ...searchParams.filters,
                colors: [...colors, entity.value],
              };
              break;
            }
            case 'size': {
              const sizes = searchParams.filters.sizes || [];
              searchParams.filters = {
                ...searchParams.filters,
                sizes: [...sizes, entity.value],
              };
              break;
            }
            case 'material': {
              const materials = searchParams.filters.materials || [];
              searchParams.filters = {
                ...searchParams.filters,
                materials: [...materials, entity.value],
              };
              break;
            }
          }
        });
        break;
      case 'sort':
        if (query && typeof query === 'string') {
          if (query.includes('price')) {
            if (query.includes('high to low')) {
              searchParams.sort.push({ field: 'price', order: 'desc' });
            } else {
              searchParams.sort.push({ field: 'price', order: 'asc' });
            }
          } else if (query.includes('rating') || query.includes('reviews')) {
            searchParams.sort.push({ field: 'rating', order: 'desc' });
          } else if (query.includes('new') || query.includes('recent')) {
            searchParams.sort.push({ field: 'createdAt', order: 'desc' });
          } else if (query.includes('popular') || query.includes('trending')) {
            searchParams.sort.push({ field: 'popularity', order: 'desc' });
          }
        }
        break;
      default:
        break;
    }
    return searchParams;
  }
});
exports.IntentDetectionService = IntentDetectionService;
exports.IntentDetectionService =
  IntentDetectionService =
  IntentDetectionService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      IntentDetectionService,
    );
//# sourceMappingURL=intent-detection.service.js.map
