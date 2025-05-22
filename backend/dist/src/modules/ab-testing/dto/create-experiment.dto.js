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
exports.CreateExperimentDto = void 0;
const class_validator_1 = require('class-validator');
const graphql_1 = require('@nestjs/graphql');
const swagger_1 = require('@nestjs/swagger');
const experiment_entity_1 = require('../entities/experiment.entity');
const create_experiment_variant_dto_1 = require('./create-experiment-variant.dto');
const class_transformer_1 = require('class-transformer');
let CreateExperimentDto = class CreateExperimentDto {
  constructor() {
    this.status = experiment_entity_1.ExperimentStatus.DRAFT;
  }
};
exports.CreateExperimentDto = CreateExperimentDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Name of the experiment' }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Description of the experiment', required: false }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Status of the experiment',
      enum: experiment_entity_1.ExperimentStatus,
      default: experiment_entity_1.ExperimentStatus.DRAFT,
    }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(experiment_entity_1.ExperimentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'status',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Type of the experiment',
      enum: experiment_entity_1.ExperimentType,
      required: true,
    }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(experiment_entity_1.ExperimentType),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'type',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Target audience for the experiment',
      required: false,
    }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'targetAudience',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Percentage of audience to include in the experiment (0-100)',
      required: false,
      minimum: 0,
      maximum: 100,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Number),
  ],
  CreateExperimentDto.prototype,
  'audiencePercentage',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Start date of the experiment', required: false }),
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Date),
  ],
  CreateExperimentDto.prototype,
  'startDate',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'End date of the experiment', required: false }),
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Date),
  ],
  CreateExperimentDto.prototype,
  'endDate',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({ description: 'Hypothesis for the experiment', required: false }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'hypothesis',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Primary metric to measure experiment success',
      required: false,
    }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'primaryMetric',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Secondary metrics to measure experiment success',
      required: false,
      type: [String],
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Array),
  ],
  CreateExperimentDto.prototype,
  'secondaryMetrics',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Segmentation criteria in JSON format',
      required: false,
    }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', String),
  ],
  CreateExperimentDto.prototype,
  'segmentation',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Variants for the experiment',
      type: [create_experiment_variant_dto_1.CreateExperimentVariantDto],
    }),
    (0, graphql_1.Field)(() => [create_experiment_variant_dto_1.CreateExperimentVariantDto]),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => create_experiment_variant_dto_1.CreateExperimentVariantDto),
    __metadata('design:type', Array),
  ],
  CreateExperimentDto.prototype,
  'variants',
  void 0,
);
exports.CreateExperimentDto = CreateExperimentDto = __decorate(
  [(0, graphql_1.InputType)()],
  CreateExperimentDto,
);
//# sourceMappingURL=create-experiment.dto.js.map
