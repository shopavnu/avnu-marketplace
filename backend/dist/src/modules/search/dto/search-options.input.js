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
exports.LegacySearchOptionsInput = exports.LegacySearchSortInput = exports.LegacySearchFiltersInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let LegacySearchFiltersInput = class LegacySearchFiltersInput {
};
exports.LegacySearchFiltersInput = LegacySearchFiltersInput;
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LegacySearchFiltersInput.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LegacySearchFiltersInput.prototype, "priceMin", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LegacySearchFiltersInput.prototype, "priceMax", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LegacySearchFiltersInput.prototype, "merchantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LegacySearchFiltersInput.prototype, "inStock", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], LegacySearchFiltersInput.prototype, "values", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LegacySearchFiltersInput.prototype, "brandName", void 0);
exports.LegacySearchFiltersInput = LegacySearchFiltersInput = __decorate([
    (0, graphql_1.InputType)('LegacySearchFiltersInput')
], LegacySearchFiltersInput);
let LegacySearchSortInput = class LegacySearchSortInput {
};
exports.LegacySearchSortInput = LegacySearchSortInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LegacySearchSortInput.prototype, "field", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LegacySearchSortInput.prototype, "order", void 0);
exports.LegacySearchSortInput = LegacySearchSortInput = __decorate([
    (0, graphql_1.InputType)('LegacySearchSortInput')
], LegacySearchSortInput);
let LegacySearchOptionsInput = class LegacySearchOptionsInput {
};
exports.LegacySearchOptionsInput = LegacySearchOptionsInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LegacySearchOptionsInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LegacySearchOptionsInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => LegacySearchFiltersInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", LegacySearchFiltersInput)
], LegacySearchOptionsInput.prototype, "filters", void 0);
__decorate([
    (0, graphql_1.Field)(() => LegacySearchSortInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", LegacySearchSortInput)
], LegacySearchOptionsInput.prototype, "sort", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LegacySearchOptionsInput.prototype, "includeMetadata", void 0);
exports.LegacySearchOptionsInput = LegacySearchOptionsInput = __decorate([
    (0, graphql_1.InputType)('LegacySearchOptionsInput')
], LegacySearchOptionsInput);
//# sourceMappingURL=search-options.input.js.map