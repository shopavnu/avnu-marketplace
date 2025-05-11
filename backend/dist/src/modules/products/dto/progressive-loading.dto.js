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
exports.ProgressiveLoadingResponseDto =
  exports.ProgressiveLoadingDto =
  exports.LoadingPriority =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
var LoadingPriority;
(function (LoadingPriority) {
  LoadingPriority['HIGH'] = 'high';
  LoadingPriority['MEDIUM'] = 'medium';
  LoadingPriority['LOW'] = 'low';
  LoadingPriority['PREFETCH'] = 'prefetch';
})(LoadingPriority || (exports.LoadingPriority = LoadingPriority = {}));
class ProgressiveLoadingDto {
  constructor() {
    this.limit = 20;
    this.priority = LoadingPriority.HIGH;
    this.fullDetails = false;
    this.withMetadata = false;
    this.exclude = [];
  }
}
exports.ProgressiveLoadingDto = ProgressiveLoadingDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Cursor for pagination',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  ProgressiveLoadingDto.prototype,
  'cursor',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Number of items to return',
      required: false,
      default: 20,
      minimum: 1,
      maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata('design:type', Number),
  ],
  ProgressiveLoadingDto.prototype,
  'limit',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Loading priority (affects what data is included)',
      required: false,
      enum: LoadingPriority,
      default: LoadingPriority.HIGH,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LoadingPriority),
    __metadata('design:type', String),
  ],
  ProgressiveLoadingDto.prototype,
  'priority',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether to include full product details or just essential data',
      required: false,
      default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  ProgressiveLoadingDto.prototype,
  'fullDetails',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether to include metadata like total counts',
      required: false,
      default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata('design:type', Boolean),
  ],
  ProgressiveLoadingDto.prototype,
  'withMetadata',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Array of product IDs to exclude (e.g., already loaded)',
      required: false,
      type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  ProgressiveLoadingDto.prototype,
  'exclude',
  void 0,
);
class ProgressiveLoadingResponseDto {}
exports.ProgressiveLoadingResponseDto = ProgressiveLoadingResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Array of items',
    }),
    __metadata('design:type', Array),
  ],
  ProgressiveLoadingResponseDto.prototype,
  'items',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Cursor for the next page',
      required: false,
    }),
    __metadata('design:type', String),
  ],
  ProgressiveLoadingResponseDto.prototype,
  'nextCursor',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether there are more items to load',
    }),
    __metadata('design:type', Boolean),
  ],
  ProgressiveLoadingResponseDto.prototype,
  'hasMore',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Metadata (if requested)',
      required: false,
    }),
    __metadata('design:type', Object),
  ],
  ProgressiveLoadingResponseDto.prototype,
  'metadata',
  void 0,
);
//# sourceMappingURL=progressive-loading.dto.js.map
