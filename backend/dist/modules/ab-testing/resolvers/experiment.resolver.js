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
exports.ExperimentResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const ab_testing_service_1 = require('../services/ab-testing.service');
const experiment_entity_1 = require('../entities/experiment.entity');
const create_experiment_dto_1 = require('../dto/create-experiment.dto');
const update_experiment_dto_1 = require('../dto/update-experiment.dto');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const experiment_results_type_1 = require('../types/experiment-results.type');
const statistical_significance_type_1 = require('../types/statistical-significance.type');
const time_to_completion_type_1 = require('../types/time-to-completion.type');
const metrics_over_time_type_1 = require('../types/metrics-over-time.type');
let ExperimentResolver = class ExperimentResolver {
  constructor(abTestingService) {
    this.abTestingService = abTestingService;
  }
  createExperiment(createExperimentDto) {
    return this.abTestingService.createExperiment(createExperimentDto);
  }
  findAll(status) {
    return this.abTestingService.getAllExperiments(status);
  }
  findOne(id) {
    return this.abTestingService.getExperimentById(id);
  }
  updateExperiment(id, updateExperimentDto) {
    return this.abTestingService.updateExperiment(id, updateExperimentDto);
  }
  removeExperiment(id) {
    this.abTestingService.deleteExperiment(id);
    return true;
  }
  startExperiment(id) {
    return this.abTestingService.startExperiment(id);
  }
  pauseExperiment(id) {
    return this.abTestingService.pauseExperiment(id);
  }
  completeExperiment(id) {
    return this.abTestingService.completeExperiment(id);
  }
  archiveExperiment(id) {
    return this.abTestingService.archiveExperiment(id);
  }
  declareWinner(experimentId, variantId) {
    return this.abTestingService.declareWinner(experimentId, variantId);
  }
  getExperimentResults(id) {
    return this.abTestingService.getExperimentResults(id);
  }
  getStatisticalSignificance(id) {
    return this.abTestingService.calculateStatisticalSignificance(id);
  }
  getTimeToCompletion(id, dailyTraffic) {
    return this.abTestingService.estimateTimeToCompletion(id, dailyTraffic);
  }
  getMetricsOverTime(id, interval) {
    return this.abTestingService.getMetricsOverTime(id, interval);
  }
  getRequiredSampleSize(baselineConversionRate, minimumDetectableEffect, significanceLevel, power) {
    return this.abTestingService.calculateRequiredSampleSize(
      baselineConversionRate,
      minimumDetectableEffect,
      significanceLevel,
      power,
    );
  }
};
exports.ExperimentResolver = ExperimentResolver;
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('createExperimentDto')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [create_experiment_dto_1.CreateExperimentDto]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'createExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [experiment_entity_1.Experiment], { name: 'experiments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'findAll',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => experiment_entity_1.Experiment, { name: 'experiment' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'findOne',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateExperimentDto')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, update_experiment_dto_1.UpdateExperimentDto]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'updateExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'removeExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'startExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'pauseExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'completeExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'archiveExperiment',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => experiment_entity_1.Experiment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('experimentId')),
    __param(1, (0, graphql_1.Args)('variantId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'declareWinner',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => experiment_results_type_1.ExperimentResultsType, {
      name: 'experimentResults',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'getExperimentResults',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => statistical_significance_type_1.StatisticalSignificanceType, {
      name: 'experimentSignificance',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'getStatisticalSignificance',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => time_to_completion_type_1.TimeToCompletionType, {
      name: 'experimentTimeToCompletion',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('dailyTraffic', { type: () => graphql_1.Int })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'getTimeToCompletion',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => metrics_over_time_type_1.MetricsOverTimeType, {
      name: 'experimentMetricsOverTime',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('interval', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'getMetricsOverTime',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'requiredSampleSize' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('baselineConversionRate')),
    __param(1, (0, graphql_1.Args)('minimumDetectableEffect')),
    __param(2, (0, graphql_1.Args)('significanceLevel', { nullable: true })),
    __param(3, (0, graphql_1.Args)('power', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number, Number, Number]),
    __metadata('design:returntype', void 0),
  ],
  ExperimentResolver.prototype,
  'getRequiredSampleSize',
  null,
);
exports.ExperimentResolver = ExperimentResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => experiment_entity_1.Experiment),
    __metadata('design:paramtypes', [ab_testing_service_1.AbTestingService]),
  ],
  ExperimentResolver,
);
//# sourceMappingURL=experiment.resolver.js.map
