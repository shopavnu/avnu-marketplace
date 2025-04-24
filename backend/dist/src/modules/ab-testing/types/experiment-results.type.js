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
exports.ExperimentResultsType = exports.VariantResultType = void 0;
const graphql_1 = require("@nestjs/graphql");
let VariantResultType = class VariantResultType {
};
exports.VariantResultType = VariantResultType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], VariantResultType.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], VariantResultType.prototype, "variantName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], VariantResultType.prototype, "isControl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VariantResultType.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VariantResultType.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], VariantResultType.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantResultType.prototype, "clickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantResultType.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantResultType.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VariantResultType.prototype, "averageRevenue", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], VariantResultType.prototype, "isWinner", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], VariantResultType.prototype, "improvementRate", void 0);
exports.VariantResultType = VariantResultType = __decorate([
    (0, graphql_1.ObjectType)()
], VariantResultType);
let ExperimentResultsType = class ExperimentResultsType {
};
exports.ExperimentResultsType = ExperimentResultsType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExperimentResultsType.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExperimentResultsType.prototype, "experimentName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExperimentResultsType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], ExperimentResultsType.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], ExperimentResultsType.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [VariantResultType]),
    __metadata("design:type", Array)
], ExperimentResultsType.prototype, "variants", void 0);
exports.ExperimentResultsType = ExperimentResultsType = __decorate([
    (0, graphql_1.ObjectType)()
], ExperimentResultsType);
//# sourceMappingURL=experiment-results.type.js.map