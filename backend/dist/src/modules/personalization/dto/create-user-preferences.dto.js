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
exports.CreateUserPreferencesDto = void 0;
const class_validator_1 = require("class-validator");
const graphql_1 = require("@nestjs/graphql");
const swagger_1 = require("@nestjs/swagger");
let CreateUserPreferencesDto = class CreateUserPreferencesDto {
};
exports.CreateUserPreferencesDto = CreateUserPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserPreferencesDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Favorite categories', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "favoriteCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Favorite values', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "favoriteValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Favorite brands', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "favoriteBrands", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price sensitivity',
        required: false,
        enum: ['low', 'medium', 'high'],
    }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserPreferencesDto.prototype, "priceSensitivity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prefer sustainable products', required: false, default: false }),
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateUserPreferencesDto.prototype, "preferSustainable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prefer ethical products', required: false, default: false }),
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateUserPreferencesDto.prototype, "preferEthical", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prefer local brands', required: false, default: false }),
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateUserPreferencesDto.prototype, "preferLocalBrands", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred sizes', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "preferredSizes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred colors', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "preferredColors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Preferred materials', required: false }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserPreferencesDto.prototype, "preferredMaterials", void 0);
exports.CreateUserPreferencesDto = CreateUserPreferencesDto = __decorate([
    (0, graphql_1.InputType)()
], CreateUserPreferencesDto);
//# sourceMappingURL=create-user-preferences.dto.js.map