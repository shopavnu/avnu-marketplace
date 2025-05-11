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
exports.AlertMetricEntity = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const alert_entity_1 = require('./alert.entity');
let AlertMetricEntity = class AlertMetricEntity {};
exports.AlertMetricEntity = AlertMetricEntity;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  AlertMetricEntity.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata('design:type', String),
  ],
  AlertMetricEntity.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  AlertMetricEntity.prototype,
  'value',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  AlertMetricEntity.prototype,
  'previousValue',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  AlertMetricEntity.prototype,
  'changePercentage',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata('design:type', Number),
  ],
  AlertMetricEntity.prototype,
  'threshold',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => alert_entity_1.AlertEntity,
      alert => alert.metrics,
      { onDelete: 'CASCADE' },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'alert_id' }),
    __metadata('design:type', alert_entity_1.AlertEntity),
  ],
  AlertMetricEntity.prototype,
  'alert',
  void 0,
);
exports.AlertMetricEntity = AlertMetricEntity = __decorate(
  [(0, graphql_1.ObjectType)('AlertMetric'), (0, typeorm_1.Entity)('alert_metrics')],
  AlertMetricEntity,
);
//# sourceMappingURL=alert-metric.entity.js.map
