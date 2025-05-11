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
exports.ExperimentVariant = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const experiment_entity_1 = require('./experiment.entity');
const experiment_result_entity_1 = require('./experiment-result.entity');
let ExperimentVariant = class ExperimentVariant {};
exports.ExperimentVariant = ExperimentVariant;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  ExperimentVariant.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  ExperimentVariant.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  ExperimentVariant.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ExperimentVariant.prototype,
  'isControl',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  ExperimentVariant.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => experiment_entity_1.Experiment,
      experiment => experiment.variants,
    ),
    (0, typeorm_1.JoinColumn)({ name: 'experimentId' }),
    __metadata('design:type', experiment_entity_1.Experiment),
  ],
  ExperimentVariant.prototype,
  'experiment',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata('design:type', String),
  ],
  ExperimentVariant.prototype,
  'configuration',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata('design:type', Number),
  ],
  ExperimentVariant.prototype,
  'impressions',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata('design:type', Number),
  ],
  ExperimentVariant.prototype,
  'conversions',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata('design:type', Number),
  ],
  ExperimentVariant.prototype,
  'conversionRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata('design:type', Number),
  ],
  ExperimentVariant.prototype,
  'improvementRate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ExperimentVariant.prototype,
  'isWinner',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata('design:type', Number),
  ],
  ExperimentVariant.prototype,
  'confidenceLevel',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [experiment_result_entity_1.ExperimentResult], { nullable: true }),
    (0, typeorm_1.OneToMany)(
      () => experiment_result_entity_1.ExperimentResult,
      result => result.variant,
      {
        cascade: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  ExperimentVariant.prototype,
  'results',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ExperimentVariant.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  ExperimentVariant.prototype,
  'updatedAt',
  void 0,
);
exports.ExperimentVariant = ExperimentVariant = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('experiment_variants')],
  ExperimentVariant,
);
//# sourceMappingURL=experiment-variant.entity.js.map
