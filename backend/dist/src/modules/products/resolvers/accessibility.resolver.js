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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AccessibilityResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const accessibility_service_1 = require('../services/accessibility.service');
const products_service_1 = require('../products.service');
const accessibility_metadata_dto_1 = require('../dto/accessibility-metadata.dto');
const product_entity_1 = require('../entities/product.entity');
let AccessibilityResolver = class AccessibilityResolver {
  constructor(accessibilityService, productsService) {
    this.accessibilityService = accessibilityService;
    this.productsService = productsService;
  }
  async productAccessibility(productId) {
    const product = await this.productsService.findOne(productId);
    const enhancedProduct = await this.accessibilityService.enhanceProductAccessibility(product);
    return {
      productId: product.id,
      accessibilityMetadata: {
        altText: enhancedProduct.accessibilityMetadata?.altText,
        ariaLabel: enhancedProduct.accessibilityMetadata?.ariaLabel,
        role: enhancedProduct.accessibilityMetadata?.role,
        longDescription: enhancedProduct.accessibilityMetadata?.longDescription,
        structuredData: enhancedProduct.accessibilityMetadata?.structuredData
          ? {
              type: 'Product',
              context: 'https://schema.org',
              name: product.title,
              description: product.description,
              brand: product.brandName,
            }
          : undefined,
      },
      imageAltTexts: product.images?.map(imageUrl => ({
        imageUrl,
        altText: enhancedProduct.imageAltTexts?.[imageUrl] || 'Product image',
      })),
    };
  }
  async productAriaAttributes(productId) {
    const product = await this.productsService.findOne(productId);
    const ariaMetadata = this.accessibilityService.generateAriaMetadata(product);
    return {
      productId: product.id,
      attributes: Object.entries(ariaMetadata).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }
  async generateProductAltText(productId) {
    const product = await this.productsService.findOne(productId);
    const imageAltTexts = {};
    if (product.images && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        imageAltTexts[imageUrl] = await this.accessibilityService.generateAltText(imageUrl, {
          ...product,
          title: i === 0 ? product.title : `${product.title} - View ${i + 1}`,
        });
      }
    }
    const updatedProduct = await this.productsService.update(productId, {
      imageAltTexts,
      accessibilityMetadata: {
        altText: imageAltTexts[product.images?.[0] || ''],
        ariaLabel: `${product.brandName} ${product.title}`,
        role: 'article',
      },
    });
    return {
      productId: updatedProduct.id,
      accessibilityMetadata: {
        altText: updatedProduct.accessibilityMetadata?.altText,
        ariaLabel: updatedProduct.accessibilityMetadata?.ariaLabel,
        role: updatedProduct.accessibilityMetadata?.role,
        longDescription: updatedProduct.accessibilityMetadata?.longDescription,
        structuredData: updatedProduct.accessibilityMetadata?.structuredData
          ? {
              type: 'Product',
              context: 'https://schema.org',
              name: updatedProduct.title,
              description: updatedProduct.description,
              brand: updatedProduct.brandName,
            }
          : undefined,
      },
      imageAltTexts: Object.entries(imageAltTexts).map(([imageUrl, altText]) => ({
        imageUrl,
        altText,
      })),
    };
  }
  async imageAltTexts(product) {
    if (!product.imageAltTexts && !product.images) {
      return [];
    }
    return product.images.map(imageUrl => ({
      imageUrl,
      altText: product.imageAltTexts?.[imageUrl] || 'Product image',
    }));
  }
};
exports.AccessibilityResolver = AccessibilityResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => accessibility_metadata_dto_1.ProductAccessibilityDto),
    __param(0, (0, graphql_1.Args)('productId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  AccessibilityResolver.prototype,
  'productAccessibility',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => accessibility_metadata_dto_1.AriaAttributesDto),
    __param(0, (0, graphql_1.Args)('productId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  AccessibilityResolver.prototype,
  'productAriaAttributes',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => accessibility_metadata_dto_1.ProductAccessibilityDto),
    __param(0, (0, graphql_1.Args)('productId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  AccessibilityResolver.prototype,
  'generateProductAltText',
  null,
);
__decorate(
  [
    (0, graphql_1.ResolveField)(),
    __param(0, (0, graphql_1.Parent)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [product_entity_1.Product]),
    __metadata('design:returntype', Promise),
  ],
  AccessibilityResolver.prototype,
  'imageAltTexts',
  null,
);
exports.AccessibilityResolver = AccessibilityResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => accessibility_metadata_dto_1.ProductAccessibilityDto),
    __metadata('design:paramtypes', [
      accessibility_service_1.AccessibilityService,
      products_service_1.ProductsService,
    ]),
  ],
  AccessibilityResolver,
);
//# sourceMappingURL=accessibility.resolver.js.map
