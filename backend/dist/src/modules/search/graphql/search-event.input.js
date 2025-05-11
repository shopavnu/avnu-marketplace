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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchEventInput = exports.SearchEventType = void 0;
const graphql_1 = require('@nestjs/graphql');
const graphql_type_json_1 = __importDefault(require('graphql-type-json'));
const class_validator_1 = require('class-validator');
var SearchEventType;
(function (SearchEventType) {
  SearchEventType['SEARCH_QUERY'] = 'SEARCH_QUERY';
  SearchEventType['SUGGESTION_CLICK'] = 'SUGGESTION_CLICK';
  SearchEventType['SUGGESTION_IMPRESSION'] = 'SUGGESTION_IMPRESSION';
  SearchEventType['SEARCH_RESULT_CLICK'] = 'SEARCH_RESULT_CLICK';
})(SearchEventType || (exports.SearchEventType = SearchEventType = {}));
let SearchEventInput = class SearchEventInput {};
exports.SearchEventInput = SearchEventInput;
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(SearchEventType),
    __metadata('design:type', String),
  ],
  SearchEventInput.prototype,
  'eventType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  SearchEventInput.prototype,
  'timestamp',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata('design:type', Object),
  ],
  SearchEventInput.prototype,
  'data',
  void 0,
);
exports.SearchEventInput = SearchEventInput = __decorate(
  [(0, graphql_1.InputType)()],
  SearchEventInput,
);
//# sourceMappingURL=search-event.input.js.map
