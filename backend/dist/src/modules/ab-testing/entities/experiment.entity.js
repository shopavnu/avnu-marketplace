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
exports.Experiment = exports.ExperimentType = exports.ExperimentStatus = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const experiment_variant_entity_1 = require('./experiment-variant.entity');
var ExperimentStatus;
(function (ExperimentStatus) {
  ExperimentStatus['DRAFT'] = 'draft';
  ExperimentStatus['RUNNING'] = 'running';
  ExperimentStatus['PAUSED'] = 'paused';
  ExperimentStatus['COMPLETED'] = 'completed';
  ExperimentStatus['ARCHIVED'] = 'archived';
})(ExperimentStatus || (exports.ExperimentStatus = ExperimentStatus = {}));
var ExperimentType;
(function (ExperimentType) {
  ExperimentType['SEARCH_ALGORITHM'] = 'search_algorithm';
  ExperimentType['UI_COMPONENT'] = 'ui_component';
  ExperimentType['PERSONALIZATION'] = 'personalization';
  ExperimentType['RECOMMENDATION'] = 'recommendation';
  ExperimentType['PRICING'] = 'pricing';
  ExperimentType['CONTENT'] = 'content';
  ExperimentType['FEATURE_FLAG'] = 'feature_flag';
})(ExperimentType || (exports.ExperimentType = ExperimentType = {}));
let Experiment = class Experiment {};
exports.Experiment = Experiment;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  Experiment.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => ExperimentStatus),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: ExperimentStatus,
      default: ExperimentStatus.DRAFT,
    }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: ExperimentType,
    }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'type',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'targetAudience',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', Number),
  ],
  Experiment.prototype,
  'audiencePercentage',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', Date),
  ],
  Experiment.prototype,
  'startDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', Date),
  ],
  Experiment.prototype,
  'endDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'hypothesis',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'primaryMetric',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  Experiment.prototype,
  'secondaryMetrics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  Experiment.prototype,
  'hasWinner',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'winningVariantId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata('design:type', String),
  ],
  Experiment.prototype,
  'segmentation',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [experiment_variant_entity_1.ExperimentVariant], { nullable: true }),
    (0, typeorm_1.OneToMany)(
      () => experiment_variant_entity_1.ExperimentVariant,
      variant => variant.experiment,
      {
        cascade: true,
        eager: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Experiment.prototype,
  'variants',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  Experiment.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  Experiment.prototype,
  'updatedAt',
  void 0,
);
exports.Experiment = Experiment = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('experiments')],
  Experiment,
);
//# sourceMappingURL=experiment.entity.js.map
