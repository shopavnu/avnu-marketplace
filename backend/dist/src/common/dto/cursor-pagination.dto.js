"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorUtils = exports.PaginatedResponseDto = exports.CursorPaginationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CursorPaginationDto {
    constructor() {
        this.limit = 20;
        this.withCount = false;
    }
}
exports.CursorPaginationDto = CursorPaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cursor for the next page (typically the ID of the last item in the previous page)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CursorPaginationDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items to return per page',
        required: false,
        default: 20,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_2.IsInt)(),
    (0, class_validator_2.Min)(1),
    (0, class_validator_2.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], CursorPaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to include total count in response (may impact performance)',
        required: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Object)
], CursorPaginationDto.prototype, "withCount", void 0);
class PaginatedResponseDto {
}
exports.PaginatedResponseDto = PaginatedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of items for the current page' }),
    __metadata("design:type", Array)
], PaginatedResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cursor to the next page', required: false }),
    __metadata("design:type", String)
], PaginatedResponseDto.prototype, "nextCursor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cursor to the previous page', required: false }),
    __metadata("design:type", String)
], PaginatedResponseDto.prototype, "prevCursor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count of items (if requested)', required: false }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "totalCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there are more items available' }),
    __metadata("design:type", Boolean)
], PaginatedResponseDto.prototype, "hasMore", void 0);
class CursorUtils {
    static encodeCursor(data) {
        return Buffer.from(JSON.stringify(data)).toString('base64');
    }
    static decodeCursor(cursor) {
        try {
            return JSON.parse(Buffer.from(cursor, 'base64').toString());
        }
        catch (error) {
            return null;
        }
    }
}
exports.CursorUtils = CursorUtils;
//# sourceMappingURL=cursor-pagination.dto.js.map