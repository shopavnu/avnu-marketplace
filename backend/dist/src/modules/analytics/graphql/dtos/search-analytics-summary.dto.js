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
exports.SearchAnalyticsSummaryDto = void 0;
const graphql_1 = require('@nestjs/graphql');
const graphql_type_json_1 = require('graphql-type-json');
const query_count_dto_1 = require('./query-count.dto');
let SearchAnalyticsSummaryDto = class SearchAnalyticsSummaryDto {};
exports.SearchAnalyticsSummaryDto = SearchAnalyticsSummaryDto;
__decorate(
  [
    (0, graphql_1.Field)(() => [query_count_dto_1.QueryCountDto], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'topSearchQueries',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [query_count_dto_1.QueryCountDto], { nullable: true }),
    __metadata('design:type', Array),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'zeroResultQueries',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'searchConversionRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'searchClickThroughRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'nlpVsRegularSearchAnalytics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'searchPerformance',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'personalizedVsRegularSearchAnalytics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata('design:type', Object),
  ],
  SearchAnalyticsSummaryDto.prototype,
  'searchTrends',
  void 0,
);
exports.SearchAnalyticsSummaryDto = SearchAnalyticsSummaryDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  SearchAnalyticsSummaryDto,
);
//# sourceMappingURL=search-analytics-summary.dto.js.map
