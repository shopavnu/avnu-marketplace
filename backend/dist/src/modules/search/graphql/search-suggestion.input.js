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
exports.SearchSuggestionInput = void 0;
const graphql_1 = require('@nestjs/graphql');
const class_validator_1 = require('class-validator');
let SearchSuggestionInput = class SearchSuggestionInput {
  constructor() {
    this.limit = 5;
    this.includePopular = true;
    this.includePersonalized = true;
    this.includeCategoryContext = true;
  }
};
exports.SearchSuggestionInput = SearchSuggestionInput;
__decorate(
  [(0, graphql_1.Field)(), (0, class_validator_1.IsString)(), __metadata('design:type', String)],
  SearchSuggestionInput.prototype,
  'query',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  SearchSuggestionInput.prototype,
  'limit',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  SearchSuggestionInput.prototype,
  'includePopular',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  SearchSuggestionInput.prototype,
  'includePersonalized',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Boolean),
  ],
  SearchSuggestionInput.prototype,
  'includeCategoryContext',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  SearchSuggestionInput.prototype,
  'categories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  SearchSuggestionInput.prototype,
  'types',
  void 0,
);
exports.SearchSuggestionInput = SearchSuggestionInput = __decorate(
  [(0, graphql_1.InputType)()],
  SearchSuggestionInput,
);
//# sourceMappingURL=search-suggestion.input.js.map
