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
exports.UserSegmentationDataDto =
  exports.FunnelStepDto =
  exports.PageHeatmapDataDto =
  exports.UserSegmentDto =
    void 0;
const graphql_1 = require('@nestjs/graphql');
let UserSegmentDto = class UserSegmentDto {};
exports.UserSegmentDto = UserSegmentDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserSegmentDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserSegmentDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserSegmentDto.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  UserSegmentDto.prototype,
  'count',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  UserSegmentDto.prototype,
  'percentage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserSegmentDto.prototype,
  'color',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  UserSegmentDto.prototype,
  'characteristics',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  UserSegmentDto.prototype,
  'topCategories',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String]), __metadata('design:type', Array)],
  UserSegmentDto.prototype,
  'topBrands',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  UserSegmentDto.prototype,
  'avgSessionDuration',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  UserSegmentDto.prototype,
  'conversionRate',
  void 0,
);
exports.UserSegmentDto = UserSegmentDto = __decorate([(0, graphql_1.ObjectType)()], UserSegmentDto);
let PageHeatmapDataDto = class PageHeatmapDataDto {};
exports.PageHeatmapDataDto = PageHeatmapDataDto;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageHeatmapDataDto.prototype,
  'x',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageHeatmapDataDto.prototype,
  'y',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PageHeatmapDataDto.prototype,
  'value',
  void 0,
);
exports.PageHeatmapDataDto = PageHeatmapDataDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  PageHeatmapDataDto,
);
let FunnelStepDto = class FunnelStepDto {};
exports.FunnelStepDto = FunnelStepDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  FunnelStepDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  FunnelStepDto.prototype,
  'value',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  FunnelStepDto.prototype,
  'percentage',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  FunnelStepDto.prototype,
  'conversionRate',
  void 0,
);
exports.FunnelStepDto = FunnelStepDto = __decorate([(0, graphql_1.ObjectType)()], FunnelStepDto);
let UserSegmentationDataDto = class UserSegmentationDataDto {};
exports.UserSegmentationDataDto = UserSegmentationDataDto;
__decorate(
  [(0, graphql_1.Field)(() => [UserSegmentDto]), __metadata('design:type', Array)],
  UserSegmentationDataDto.prototype,
  'segments',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [PageHeatmapDataDto]), __metadata('design:type', Array)],
  UserSegmentationDataDto.prototype,
  'pageHeatmapData',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [FunnelStepDto]), __metadata('design:type', Array)],
  UserSegmentationDataDto.prototype,
  'funnelData',
  void 0,
);
exports.UserSegmentationDataDto = UserSegmentationDataDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  UserSegmentationDataDto,
);
//# sourceMappingURL=user-segmentation.dto.js.map
