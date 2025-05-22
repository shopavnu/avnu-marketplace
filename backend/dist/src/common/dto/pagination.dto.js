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
exports.PageInfo = exports.PaginationDto = void 0;
exports.Paginated = Paginated;
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
const graphql_1 = require('@nestjs/graphql');
const swagger_1 = require('@nestjs/swagger');
let PaginationDto = class PaginationDto {};
exports.PaginationDto = PaginationDto;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 1 }),
    (0, swagger_1.ApiProperty)({ required: false, default: 1, description: 'Page number' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata('design:type', Number),
  ],
  PaginationDto.prototype,
  'page',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 10 }),
    (0, swagger_1.ApiProperty)({
      required: false,
      default: 10,
      description: 'Number of items per page',
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata('design:type', Number),
  ],
  PaginationDto.prototype,
  'limit',
  void 0,
);
exports.PaginationDto = PaginationDto = __decorate([(0, graphql_1.InputType)()], PaginationDto);
let PageInfo = class PageInfo {};
exports.PageInfo = PageInfo;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageInfo.prototype,
  'totalItems',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageInfo.prototype,
  'itemCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageInfo.prototype,
  'itemsPerPage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageInfo.prototype,
  'totalPages',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageInfo.prototype,
  'currentPage',
  void 0,
);
exports.PageInfo = PageInfo = __decorate([(0, graphql_1.ObjectType)('PageInfo')], PageInfo);
function Paginated(classRef) {
  let PaginatedType = class PaginatedType {};
  __decorate(
    [(0, graphql_1.Field)(() => [classRef], { nullable: true }), __metadata('design:type', Array)],
    PaginatedType.prototype,
    'items',
    void 0,
  );
  __decorate(
    [(0, graphql_1.Field)(() => PageInfo), __metadata('design:type', PageInfo)],
    PaginatedType.prototype,
    'pageInfo',
    void 0,
  );
  PaginatedType = __decorate([(0, graphql_1.ObjectType)({ isAbstract: true })], PaginatedType);
  return PaginatedType;
}
//# sourceMappingURL=pagination.dto.js.map
