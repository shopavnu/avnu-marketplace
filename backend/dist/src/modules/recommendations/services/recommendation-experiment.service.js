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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var RecommendationExperimentService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.RecommendationExperimentService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const product_entity_1 = require('../../products/entities/product.entity');
let RecommendationExperimentService =
  (RecommendationExperimentService_1 = class RecommendationExperimentService {
    constructor(productRepository) {
      this.productRepository = productRepository;
      this.logger = new common_1.Logger(RecommendationExperimentService_1.name);
    }
    async getVariant(userId, experimentId) {
      const hash = this.hashString(`${userId}-${experimentId}`);
      const variants = ['control', 'variantA', 'variantB'];
      const variantIndex = hash % variants.length;
      return variants[variantIndex];
    }
    async recordEvent(userId, experimentId, variant, event, metadata) {
      this.logger.log(
        `Experiment event: ${experimentId}, user: ${userId}, variant: ${variant}, event: ${event}`,
        metadata,
      );
    }
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }
  });
exports.RecommendationExperimentService = RecommendationExperimentService;
exports.RecommendationExperimentService =
  RecommendationExperimentService =
  RecommendationExperimentService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      RecommendationExperimentService,
    );
//# sourceMappingURL=recommendation-experiment.service.js.map
