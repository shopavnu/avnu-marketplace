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
exports.HighlightResult = exports.HighlightField = void 0;
const swagger_1 = require('@nestjs/swagger');
const graphql_1 = require('@nestjs/graphql');
let HighlightField = class HighlightField {};
exports.HighlightField = HighlightField;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The field name that was highlighted',
      example: 'title',
    }),
    (0, graphql_1.Field)(),
    __metadata('design:type', String),
  ],
  HighlightField.prototype,
  'field',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The highlighted snippets with HTML markup',
      example: ['Sustainable <em>clothing</em> for everyday wear'],
    }),
    (0, graphql_1.Field)(() => [String]),
    __metadata('design:type', Array),
  ],
  HighlightField.prototype,
  'snippets',
  void 0,
);
exports.HighlightField = HighlightField = __decorate(
  [(0, graphql_1.ObjectType)('HighlightField')],
  HighlightField,
);
let HighlightResult = class HighlightResult {};
exports.HighlightResult = HighlightResult;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Collection of highlighted fields',
      type: [HighlightField],
    }),
    (0, graphql_1.Field)(() => [HighlightField]),
    __metadata('design:type', Array),
  ],
  HighlightResult.prototype,
  'fields',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'The matched query terms',
      example: ['clothing', 'sustainable'],
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata('design:type', Array),
  ],
  HighlightResult.prototype,
  'matchedTerms',
  void 0,
);
exports.HighlightResult = HighlightResult = __decorate(
  [(0, graphql_1.ObjectType)('HighlightResult')],
  HighlightResult,
);
//# sourceMappingURL=highlight.dto.js.map
