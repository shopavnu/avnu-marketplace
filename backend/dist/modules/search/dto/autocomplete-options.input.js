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
exports.AutocompleteOptionsInput = void 0;
const graphql_1 = require('@nestjs/graphql');
const class_validator_1 = require('class-validator');
let AutocompleteOptionsInput = class AutocompleteOptionsInput {};
exports.AutocompleteOptionsInput = AutocompleteOptionsInput;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata('design:type', Number),
  ],
  AutocompleteOptionsInput.prototype,
  'limit',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  AutocompleteOptionsInput.prototype,
  'includeCategories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  AutocompleteOptionsInput.prototype,
  'includeBrands',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  AutocompleteOptionsInput.prototype,
  'includeValues',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  AutocompleteOptionsInput.prototype,
  'includeTrending',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  AutocompleteOptionsInput.prototype,
  'highlightMatches',
  void 0,
);
exports.AutocompleteOptionsInput = AutocompleteOptionsInput = __decorate(
  [(0, graphql_1.InputType)()],
  AutocompleteOptionsInput,
);
//# sourceMappingURL=autocomplete-options.input.js.map
