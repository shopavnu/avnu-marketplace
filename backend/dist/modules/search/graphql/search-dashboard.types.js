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
exports.ValueSearchMetric =
  exports.ValueAlignmentMetricsType =
  exports.SearchRefinementType =
  exports.SearchStep =
  exports.SearchPathType =
  exports.SystemAlert =
  exports.HealthStatusType =
  exports.ExperimentResultType =
  exports.VariantResult =
  exports.ExperimentType =
  exports.DashboardExperimentVariant =
  exports.ConversionRateType =
  exports.EntityDistributionByQuery =
  exports.DashboardEntityDistributionType =
  exports.ZeroResultSearchType =
  exports.PopularSearchType =
  exports.TimeSeriesDataPoint =
  exports.EntityRelevanceScore =
  exports.RelevanceMetricsType =
  exports.PerformanceMetricsType =
    void 0;
const graphql_1 = require('@nestjs/graphql');
const experiment_entity_1 = require('../../ab-testing/entities/experiment.entity');
let PerformanceMetricsType = class PerformanceMetricsType {};
exports.PerformanceMetricsType = PerformanceMetricsType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  PerformanceMetricsType.prototype,
  'averageResponseTime',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PerformanceMetricsType.prototype,
  'totalSearches',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PerformanceMetricsType.prototype,
  'slowSearches',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [TimeSeriesDataPoint]), __metadata('design:type', Array)],
  PerformanceMetricsType.prototype,
  'responseTimeDistribution',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [TimeSeriesDataPoint]), __metadata('design:type', Array)],
  PerformanceMetricsType.prototype,
  'searchVolumeByHour',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  PerformanceMetricsType.prototype,
  'p95ResponseTime',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  PerformanceMetricsType.prototype,
  'p99ResponseTime',
  void 0,
);
exports.PerformanceMetricsType = PerformanceMetricsType = __decorate(
  [(0, graphql_1.ObjectType)()],
  PerformanceMetricsType,
);
let RelevanceMetricsType = class RelevanceMetricsType {};
exports.RelevanceMetricsType = RelevanceMetricsType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  RelevanceMetricsType.prototype,
  'averageRelevanceScore',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  RelevanceMetricsType.prototype,
  'clickThroughRate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  RelevanceMetricsType.prototype,
  'zeroResultRate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [EntityRelevanceScore]), __metadata('design:type', Array)],
  RelevanceMetricsType.prototype,
  'entityRelevanceScores',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [TimeSeriesDataPoint]), __metadata('design:type', Array)],
  RelevanceMetricsType.prototype,
  'relevanceScoreByDay',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  RelevanceMetricsType.prototype,
  'averageResultCount',
  void 0,
);
exports.RelevanceMetricsType = RelevanceMetricsType = __decorate(
  [(0, graphql_1.ObjectType)()],
  RelevanceMetricsType,
);
let EntityRelevanceScore = class EntityRelevanceScore {};
exports.EntityRelevanceScore = EntityRelevanceScore;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  EntityRelevanceScore.prototype,
  'entityType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  EntityRelevanceScore.prototype,
  'averageScore',
  void 0,
);
exports.EntityRelevanceScore = EntityRelevanceScore = __decorate(
  [(0, graphql_1.ObjectType)()],
  EntityRelevanceScore,
);
let TimeSeriesDataPoint = class TimeSeriesDataPoint {};
exports.TimeSeriesDataPoint = TimeSeriesDataPoint;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  TimeSeriesDataPoint.prototype,
  'timestamp',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  TimeSeriesDataPoint.prototype,
  'value',
  void 0,
);
exports.TimeSeriesDataPoint = TimeSeriesDataPoint = __decorate(
  [(0, graphql_1.ObjectType)()],
  TimeSeriesDataPoint,
);
let PopularSearchType = class PopularSearchType {};
exports.PopularSearchType = PopularSearchType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  PopularSearchType.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PopularSearchType.prototype,
  'count',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  PopularSearchType.prototype,
  'conversionRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  PopularSearchType.prototype,
  'clickThroughRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  PopularSearchType.prototype,
  'averageResultCount',
  void 0,
);
exports.PopularSearchType = PopularSearchType = __decorate(
  [(0, graphql_1.ObjectType)()],
  PopularSearchType,
);
let ZeroResultSearchType = class ZeroResultSearchType {};
exports.ZeroResultSearchType = ZeroResultSearchType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ZeroResultSearchType.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  ZeroResultSearchType.prototype,
  'count',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  ZeroResultSearchType.prototype,
  'suggestedAlternatives',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime), __metadata('design:type', Date)],
  ZeroResultSearchType.prototype,
  'lastSearched',
  void 0,
);
exports.ZeroResultSearchType = ZeroResultSearchType = __decorate(
  [(0, graphql_1.ObjectType)()],
  ZeroResultSearchType,
);
let DashboardEntityDistributionType = class DashboardEntityDistributionType {};
exports.DashboardEntityDistributionType = DashboardEntityDistributionType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  DashboardEntityDistributionType.prototype,
  'products',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  DashboardEntityDistributionType.prototype,
  'merchants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  DashboardEntityDistributionType.prototype,
  'brands',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [EntityDistributionByQuery], { nullable: true }),
    __metadata('design:type', Array),
  ],
  DashboardEntityDistributionType.prototype,
  'byPopularQueries',
  void 0,
);
exports.DashboardEntityDistributionType = DashboardEntityDistributionType = __decorate(
  [(0, graphql_1.ObjectType)()],
  DashboardEntityDistributionType,
);
let EntityDistributionByQuery = class EntityDistributionByQuery {};
exports.EntityDistributionByQuery = EntityDistributionByQuery;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  EntityDistributionByQuery.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  EntityDistributionByQuery.prototype,
  'products',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  EntityDistributionByQuery.prototype,
  'merchants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  EntityDistributionByQuery.prototype,
  'brands',
  void 0,
);
exports.EntityDistributionByQuery = EntityDistributionByQuery = __decorate(
  [(0, graphql_1.ObjectType)()],
  EntityDistributionByQuery,
);
let ConversionRateType = class ConversionRateType {};
exports.ConversionRateType = ConversionRateType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ConversionRateType.prototype,
  'overall',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ConversionRateType.prototype,
  'fromProductSearch',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ConversionRateType.prototype,
  'fromMerchantSearch',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ConversionRateType.prototype,
  'fromBrandSearch',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [TimeSeriesDataPoint]), __metadata('design:type', Array)],
  ConversionRateType.prototype,
  'byDay',
  void 0,
);
exports.ConversionRateType = ConversionRateType = __decorate(
  [(0, graphql_1.ObjectType)()],
  ConversionRateType,
);
let DashboardExperimentVariant = class DashboardExperimentVariant {};
exports.DashboardExperimentVariant = DashboardExperimentVariant;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID), __metadata('design:type', String)],
  DashboardExperimentVariant.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  DashboardExperimentVariant.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  DashboardExperimentVariant.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  DashboardExperimentVariant.prototype,
  'trafficPercentage',
  void 0,
);
exports.DashboardExperimentVariant = DashboardExperimentVariant = __decorate(
  [(0, graphql_1.ObjectType)()],
  DashboardExperimentVariant,
);
let ExperimentType = class ExperimentType {};
exports.ExperimentType = ExperimentType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID), __metadata('design:type', String)],
  ExperimentType.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ExperimentType.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ExperimentType.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => experiment_entity_1.ExperimentStatus),
    __metadata('design:type', String),
  ],
  ExperimentType.prototype,
  'status',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime), __metadata('design:type', Date)],
  ExperimentType.prototype,
  'startDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata('design:type', Date),
  ],
  ExperimentType.prototype,
  'endDate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [DashboardExperimentVariant]), __metadata('design:type', Array)],
  ExperimentType.prototype,
  'variants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  ExperimentType.prototype,
  'targetAudience',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  ExperimentType.prototype,
  'metadata',
  void 0,
);
exports.ExperimentType = ExperimentType = __decorate([(0, graphql_1.ObjectType)()], ExperimentType);
let VariantResult = class VariantResult {};
exports.VariantResult = VariantResult;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID), __metadata('design:type', String)],
  VariantResult.prototype,
  'variantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  VariantResult.prototype,
  'variantName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  VariantResult.prototype,
  'impressions',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  VariantResult.prototype,
  'clicks',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  VariantResult.prototype,
  'conversions',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  VariantResult.prototype,
  'clickThroughRate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  VariantResult.prototype,
  'conversionRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  VariantResult.prototype,
  'averageRelevanceScore',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  VariantResult.prototype,
  'averageResponseTime',
  void 0,
);
exports.VariantResult = VariantResult = __decorate([(0, graphql_1.ObjectType)()], VariantResult);
let ExperimentResultType = class ExperimentResultType {};
exports.ExperimentResultType = ExperimentResultType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID), __metadata('design:type', String)],
  ExperimentResultType.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ExperimentResultType.prototype,
  'experimentName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [VariantResult]), __metadata('design:type', Array)],
  ExperimentResultType.prototype,
  'results',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  ExperimentResultType.prototype,
  'winningVariantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ExperimentResultType.prototype,
  'confidenceLevel',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  ExperimentResultType.prototype,
  'hasStatisticalSignificance',
  void 0,
);
exports.ExperimentResultType = ExperimentResultType = __decorate(
  [(0, graphql_1.ObjectType)()],
  ExperimentResultType,
);
let HealthStatusType = class HealthStatusType {};
exports.HealthStatusType = HealthStatusType;
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  HealthStatusType.prototype,
  'isHealthy',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [SystemAlert], { nullable: true }), __metadata('design:type', Array)],
  HealthStatusType.prototype,
  'alerts',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  HealthStatusType.prototype,
  'uptime',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  HealthStatusType.prototype,
  'activeConnections',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  HealthStatusType.prototype,
  'cacheHitRate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  HealthStatusType.prototype,
  'indexingLatency',
  void 0,
);
exports.HealthStatusType = HealthStatusType = __decorate(
  [(0, graphql_1.ObjectType)()],
  HealthStatusType,
);
let SystemAlert = class SystemAlert {};
exports.SystemAlert = SystemAlert;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SystemAlert.prototype,
  'type',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SystemAlert.prototype,
  'message',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SystemAlert.prototype,
  'severity',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime), __metadata('design:type', Date)],
  SystemAlert.prototype,
  'timestamp',
  void 0,
);
exports.SystemAlert = SystemAlert = __decorate([(0, graphql_1.ObjectType)()], SystemAlert);
let SearchPathType = class SearchPathType {};
exports.SearchPathType = SearchPathType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }), __metadata('design:type', String)],
  SearchPathType.prototype,
  'userId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID), __metadata('design:type', String)],
  SearchPathType.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [SearchStep]), __metadata('design:type', Array)],
  SearchPathType.prototype,
  'steps',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  SearchPathType.prototype,
  'resultedInPurchase',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime), __metadata('design:type', Date)],
  SearchPathType.prototype,
  'startTime',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata('design:type', Date),
  ],
  SearchPathType.prototype,
  'endTime',
  void 0,
);
exports.SearchPathType = SearchPathType = __decorate([(0, graphql_1.ObjectType)()], SearchPathType);
let SearchStep = class SearchStep {};
exports.SearchStep = SearchStep;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SearchStep.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  SearchStep.prototype,
  'resultCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  SearchStep.prototype,
  'clickedResults',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime), __metadata('design:type', Date)],
  SearchStep.prototype,
  'timestamp',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  SearchStep.prototype,
  'durationSeconds',
  void 0,
);
exports.SearchStep = SearchStep = __decorate([(0, graphql_1.ObjectType)()], SearchStep);
let SearchRefinementType = class SearchRefinementType {};
exports.SearchRefinementType = SearchRefinementType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SearchRefinementType.prototype,
  'originalQuery',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  SearchRefinementType.prototype,
  'refinedQuery',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  SearchRefinementType.prototype,
  'occurrences',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  SearchRefinementType.prototype,
  'successRate',
  void 0,
);
exports.SearchRefinementType = SearchRefinementType = __decorate(
  [(0, graphql_1.ObjectType)()],
  SearchRefinementType,
);
let ValueAlignmentMetricsType = class ValueAlignmentMetricsType {};
exports.ValueAlignmentMetricsType = ValueAlignmentMetricsType;
__decorate(
  [(0, graphql_1.Field)(() => [ValueSearchMetric]), __metadata('design:type', Array)],
  ValueAlignmentMetricsType.prototype,
  'searchesByValue',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ValueAlignmentMetricsType.prototype,
  'valueAlignedSearchPercentage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ValueAlignmentMetricsType.prototype,
  'valueAlignedConversionRate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ValueAlignmentMetricsType.prototype,
  'nonValueAlignedConversionRate',
  void 0,
);
exports.ValueAlignmentMetricsType = ValueAlignmentMetricsType = __decorate(
  [(0, graphql_1.ObjectType)()],
  ValueAlignmentMetricsType,
);
let ValueSearchMetric = class ValueSearchMetric {};
exports.ValueSearchMetric = ValueSearchMetric;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ValueSearchMetric.prototype,
  'value',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  ValueSearchMetric.prototype,
  'searchCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ValueSearchMetric.prototype,
  'conversionRate',
  void 0,
);
exports.ValueSearchMetric = ValueSearchMetric = __decorate(
  [(0, graphql_1.ObjectType)()],
  ValueSearchMetric,
);
//# sourceMappingURL=search-dashboard.types.js.map
