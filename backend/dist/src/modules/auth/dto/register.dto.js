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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const graphql_1 = require("@nestjs/graphql");
const swagger_1 = require("@nestjs/swagger");
let RegisterDto = class RegisterDto {
};
exports.RegisterDto = RegisterDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'User email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'User first name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'User last name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, swagger_1.ApiProperty)({ example: 'password123', description: 'User password' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, swagger_1.ApiProperty)({ required: false, description: 'User profile image URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "profileImage", void 0);
exports.RegisterDto = RegisterDto = __decorate([
    (0, graphql_1.InputType)()
], RegisterDto);
//# sourceMappingURL=register.dto.js.map