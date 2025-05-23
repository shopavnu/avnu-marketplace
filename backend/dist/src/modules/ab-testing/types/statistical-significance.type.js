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
exports.StatisticalSignificanceType = exports.VariantSignificanceType = void 0;
const graphql_1 = require("@nestjs/graphql");
let VariantSignificanceType = class VariantSignificanceType {
};
exports.VariantSignificanceType = VariantSignificanceType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], VariantSignificanceType.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], VariantSignificanceType.prototype, "variantName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], VariantSignificanceType.prototype, "isControl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "improvement", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "zScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "pValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantSignificanceType.prototype, "confidenceLevel", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VariantSignificanceType.prototype, "significant", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], VariantSignificanceType.prototype, "isWinner", void 0);
exports.VariantSignificanceType = VariantSignificanceType = __decorate([
    (0, graphql_1.ObjectType)()
], VariantSignificanceType);
let StatisticalSignificanceType = class StatisticalSignificanceType {
};
exports.StatisticalSignificanceType = StatisticalSignificanceType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], StatisticalSignificanceType.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], StatisticalSignificanceType.prototype, "experimentName", void 0);
__decorate([
    (0, graphql_1.Field)(() => [VariantSignificanceType]),
    __metadata("design:type", Array)
], StatisticalSignificanceType.prototype, "results", void 0);
exports.StatisticalSignificanceType = StatisticalSignificanceType = __decorate([
    (0, graphql_1.ObjectType)()
], StatisticalSignificanceType);
//# sourceMappingURL=statistical-significance.type.js.map