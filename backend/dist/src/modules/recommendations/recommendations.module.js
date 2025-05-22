'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
exports.RecommendationsModule = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const product_similarity_service_1 = require('./services/product-similarity.service');
const enhanced_personalization_service_1 = require('./services/enhanced-personalization.service');
const recommendation_controller_1 = require('./controllers/recommendation.controller');
const recommendation_resolver_1 = require('./resolvers/recommendation.resolver');
const product_similarity_entity_1 = require('./entities/product-similarity.entity');
const product_recommendation_entity_1 = require('./entities/product-recommendation.entity');
const recommendation_config_entity_1 = require('./entities/recommendation-config.entity');
const personalization_module_1 = require('../personalization/personalization.module');
const products_module_1 = require('../products/products.module');
const ab_testing_module_1 = require('../ab-testing/ab-testing.module');
let RecommendationsModule = class RecommendationsModule {};
exports.RecommendationsModule = RecommendationsModule;
exports.RecommendationsModule = RecommendationsModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          product_similarity_entity_1.ProductSimilarity,
          product_recommendation_entity_1.ProductRecommendation,
          recommendation_config_entity_1.RecommendationConfig,
        ]),
        products_module_1.ProductsModule,
        personalization_module_1.PersonalizationModule,
        ab_testing_module_1.AbTestingModule,
      ],
      providers: [
        product_similarity_service_1.ProductSimilarityService,
        enhanced_personalization_service_1.EnhancedPersonalizationService,
        recommendation_resolver_1.RecommendationResolver,
      ],
      controllers: [recommendation_controller_1.RecommendationController],
      exports: [
        product_similarity_service_1.ProductSimilarityService,
        enhanced_personalization_service_1.EnhancedPersonalizationService,
      ],
    }),
  ],
  RecommendationsModule,
);
//# sourceMappingURL=recommendations.module.js.map
