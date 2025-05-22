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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AriaAttributeDto =
  exports.AriaAttributesDto =
  exports.ImageAltTextDto =
  exports.ProductAccessibilityDto =
  exports.AccessibilityMetadataDto =
  exports.StructuredDataDto =
    void 0;
const graphql_1 = require('@nestjs/graphql');
let StructuredDataDto = class StructuredDataDto {};
exports.StructuredDataDto = StructuredDataDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  StructuredDataDto.prototype,
  'type',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  StructuredDataDto.prototype,
  'context',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  StructuredDataDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  StructuredDataDto.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  StructuredDataDto.prototype,
  'brand',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  StructuredDataDto.prototype,
  'images',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  StructuredDataDto.prototype,
  'imageAlts',
  void 0,
);
exports.StructuredDataDto = StructuredDataDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  StructuredDataDto,
);
let AccessibilityMetadataDto = class AccessibilityMetadataDto {};
exports.AccessibilityMetadataDto = AccessibilityMetadataDto;
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadataDto.prototype,
  'altText',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadataDto.prototype,
  'ariaLabel',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadataDto.prototype,
  'role',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AccessibilityMetadataDto.prototype,
  'longDescription',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => StructuredDataDto, { nullable: true }),
    __metadata('design:type', StructuredDataDto),
  ],
  AccessibilityMetadataDto.prototype,
  'structuredData',
  void 0,
);
exports.AccessibilityMetadataDto = AccessibilityMetadataDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  AccessibilityMetadataDto,
);
let ProductAccessibilityDto = class ProductAccessibilityDto {};
exports.ProductAccessibilityDto = ProductAccessibilityDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ProductAccessibilityDto.prototype,
  'productId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => AccessibilityMetadataDto),
    __metadata('design:type', AccessibilityMetadataDto),
  ],
  ProductAccessibilityDto.prototype,
  'accessibilityMetadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [ImageAltTextDto], { nullable: true }),
    __metadata('design:type', Array),
  ],
  ProductAccessibilityDto.prototype,
  'imageAltTexts',
  void 0,
);
exports.ProductAccessibilityDto = ProductAccessibilityDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ProductAccessibilityDto,
);
let ImageAltTextDto = class ImageAltTextDto {};
exports.ImageAltTextDto = ImageAltTextDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ImageAltTextDto.prototype,
  'imageUrl',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ImageAltTextDto.prototype,
  'altText',
  void 0,
);
exports.ImageAltTextDto = ImageAltTextDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ImageAltTextDto,
);
let AriaAttributesDto = class AriaAttributesDto {};
exports.AriaAttributesDto = AriaAttributesDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  AriaAttributesDto.prototype,
  'productId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [AriaAttributeDto]), __metadata('design:type', Array)],
  AriaAttributesDto.prototype,
  'attributes',
  void 0,
);
exports.AriaAttributesDto = AriaAttributesDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  AriaAttributesDto,
);
let AriaAttributeDto = class AriaAttributeDto {};
exports.AriaAttributeDto = AriaAttributeDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  AriaAttributeDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  AriaAttributeDto.prototype,
  'value',
  void 0,
);
exports.AriaAttributeDto = AriaAttributeDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  AriaAttributeDto,
);
//# sourceMappingURL=accessibility-metadata.dto.js.map
