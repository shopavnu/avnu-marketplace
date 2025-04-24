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
exports.CreateExperimentVariantDto = void 0;
const class_validator_1 = require("class-validator");
const graphql_1 = require("@nestjs/graphql");
const swagger_1 = require("@nestjs/swagger");
let CreateExperimentVariantDto = class CreateExperimentVariantDto {
    constructor() {
        this.isControl = false;
    }
};
exports.CreateExperimentVariantDto = CreateExperimentVariantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the variant' }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExperimentVariantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the variant', required: false }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExperimentVariantDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is the control variant', default: false }),
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateExperimentVariantDto.prototype, "isControl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Configuration for the variant in JSON format', required: false }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExperimentVariantDto.prototype, "configuration", void 0);
exports.CreateExperimentVariantDto = CreateExperimentVariantDto = __decorate([
    (0, graphql_1.InputType)()
], CreateExperimentVariantDto);
//# sourceMappingURL=create-experiment-variant.dto.js.map