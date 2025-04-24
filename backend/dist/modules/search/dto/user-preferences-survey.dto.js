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
exports.UserPreferencesSurveyInput = exports.PriceSensitivity = exports.ShoppingFrequency = void 0;
const graphql_1 = require("@nestjs/graphql");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ShoppingFrequency;
(function (ShoppingFrequency) {
    ShoppingFrequency["RARELY"] = "rarely";
    ShoppingFrequency["OCCASIONALLY"] = "occasionally";
    ShoppingFrequency["MONTHLY"] = "monthly";
    ShoppingFrequency["WEEKLY"] = "weekly";
    ShoppingFrequency["DAILY"] = "daily";
})(ShoppingFrequency || (exports.ShoppingFrequency = ShoppingFrequency = {}));
var PriceSensitivity;
(function (PriceSensitivity) {
    PriceSensitivity["BUDGET"] = "budget";
    PriceSensitivity["VALUE"] = "value";
    PriceSensitivity["BALANCED"] = "balanced";
    PriceSensitivity["PREMIUM"] = "premium";
    PriceSensitivity["LUXURY"] = "luxury";
})(PriceSensitivity || (exports.PriceSensitivity = PriceSensitivity = {}));
let UserPreferencesSurveyInput = class UserPreferencesSurveyInput {
};
exports.UserPreferencesSurveyInput = UserPreferencesSurveyInput;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred product categories',
        example: ['electronics', 'home', 'fashion'],
    }),
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferencesSurveyInput.prototype, "preferredCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred brands',
        example: ['Apple', 'Samsung', 'Nike'],
    }),
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferencesSurveyInput.prototype, "preferredBrands", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum price range preference',
        example: 50,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UserPreferencesSurveyInput.prototype, "priceRangeMin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum price range preference',
        example: 1000,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UserPreferencesSurveyInput.prototype, "priceRangeMax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopping frequency',
        enum: ShoppingFrequency,
        example: ShoppingFrequency.MONTHLY,
    }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(ShoppingFrequency),
    __metadata("design:type", String)
], UserPreferencesSurveyInput.prototype, "shoppingFrequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price sensitivity',
        enum: PriceSensitivity,
        example: PriceSensitivity.BALANCED,
    }),
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(PriceSensitivity),
    __metadata("design:type", String)
], UserPreferencesSurveyInput.prototype, "priceSensitivity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred product attributes/features',
        example: ['eco-friendly', 'high-quality', 'durable'],
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserPreferencesSurveyInput.prototype, "preferredAttributes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Importance of reviews (1-10)',
        example: 8,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UserPreferencesSurveyInput.prototype, "reviewImportance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional user preferences as key-value pairs',
        example: { colorPreference: 'blue', sizePreference: 'medium' },
    }),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserPreferencesSurveyInput.prototype, "additionalPreferences", void 0);
exports.UserPreferencesSurveyInput = UserPreferencesSurveyInput = __decorate([
    (0, graphql_1.InputType)()
], UserPreferencesSurveyInput);
//# sourceMappingURL=user-preferences-survey.dto.js.map