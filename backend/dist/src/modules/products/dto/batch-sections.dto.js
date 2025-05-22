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
exports.BatchSectionsResponseDto =
  exports.SectionResponseDto =
  exports.BatchSectionsRequestDto =
  exports.SectionRequestDto =
    void 0;
const swagger_1 = require('@nestjs/swagger');
const class_validator_1 = require('class-validator');
const class_transformer_1 = require('class-transformer');
const cursor_pagination_dto_1 = require('../../../common/dto/cursor-pagination.dto');
class SectionRequestDto {}
exports.SectionRequestDto = SectionRequestDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Unique identifier for the section',
      example: 'new-arrivals',
    }),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  SectionRequestDto.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Section title',
      example: 'New Arrivals',
    }),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  SectionRequestDto.prototype,
  'title',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Cursor pagination parameters for this section',
      type: cursor_pagination_dto_1.CursorPaginationDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => cursor_pagination_dto_1.CursorPaginationDto),
    __metadata('design:type', cursor_pagination_dto_1.CursorPaginationDto),
  ],
  SectionRequestDto.prototype,
  'pagination',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Filter parameters for this section',
      required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata('design:type', Object),
  ],
  SectionRequestDto.prototype,
  'filter',
  void 0,
);
class BatchSectionsRequestDto {
  constructor() {
    this.parallel = true;
  }
}
exports.BatchSectionsRequestDto = BatchSectionsRequestDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Array of section requests',
      type: [SectionRequestDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SectionRequestDto),
    __metadata('design:type', Array),
  ],
  BatchSectionsRequestDto.prototype,
  'sections',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether to parallelize section loading (may impact performance)',
      required: false,
      default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata('design:type', Boolean),
  ],
  BatchSectionsRequestDto.prototype,
  'parallel',
  void 0,
);
class SectionResponseDto {}
exports.SectionResponseDto = SectionResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Section ID',
    }),
    __metadata('design:type', String),
  ],
  SectionResponseDto.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Section title',
    }),
    __metadata('design:type', String),
  ],
  SectionResponseDto.prototype,
  'title',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Products in this section',
    }),
    __metadata('design:type', Array),
  ],
  SectionResponseDto.prototype,
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
  SectionResponseDto.prototype,
  'nextCursor',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Whether there are more items available',
    }),
    __metadata('design:type', Boolean),
  ],
  SectionResponseDto.prototype,
  'hasMore',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Total count (if requested)',
      required: false,
    }),
    __metadata('design:type', Number),
  ],
  SectionResponseDto.prototype,
  'totalCount',
  void 0,
);
class BatchSectionsResponseDto {}
exports.BatchSectionsResponseDto = BatchSectionsResponseDto;
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Array of section responses',
      type: [SectionResponseDto],
    }),
    __metadata('design:type', Array),
  ],
  BatchSectionsResponseDto.prototype,
  'sections',
  void 0,
);
__decorate(
  [
    (0, swagger_1.ApiProperty)({
      description: 'Metadata about the batch request',
    }),
    __metadata('design:type', Object),
  ],
  BatchSectionsResponseDto.prototype,
  'meta',
  void 0,
);
//# sourceMappingURL=batch-sections.dto.js.map
