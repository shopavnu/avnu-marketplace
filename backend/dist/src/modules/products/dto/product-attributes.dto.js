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
exports.ProductAttributesDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let ProductAttributesDto = class ProductAttributesDto {
};
exports.ProductAttributesDto = ProductAttributesDto;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, example: 'Medium', description: 'Product size' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductAttributesDto.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, example: 'Blue', description: 'Product color' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductAttributesDto.prototype, "color", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, example: 'Ceramic', description: 'Product material' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductAttributesDto.prototype, "material", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, example: '250g', description: 'Product weight' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductAttributesDto.prototype, "weight", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, example: '10cm x 5cm x 5cm', description: 'Product dimensions' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductAttributesDto.prototype, "dimensions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, swagger_1.ApiProperty)({
        required: false,
        example: ['finish:glossy', 'dishwasher_safe:yes'],
        description: 'Custom product attributes as key:value pairs',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProductAttributesDto.prototype, "customAttributes", void 0);
exports.ProductAttributesDto = ProductAttributesDto = __decorate([
    (0, graphql_1.InputType)()
], ProductAttributesDto);
//# sourceMappingURL=product-attributes.dto.js.map