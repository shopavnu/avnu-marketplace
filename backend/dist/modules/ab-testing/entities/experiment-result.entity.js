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
exports.ExperimentResult = exports.ResultType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const experiment_variant_entity_1 = require("./experiment-variant.entity");
var ResultType;
(function (ResultType) {
    ResultType["IMPRESSION"] = "impression";
    ResultType["CLICK"] = "click";
    ResultType["CONVERSION"] = "conversion";
    ResultType["REVENUE"] = "revenue";
    ResultType["ENGAGEMENT"] = "engagement";
    ResultType["CUSTOM"] = "custom";
})(ResultType || (exports.ResultType = ResultType = {}));
let ExperimentResult = class ExperimentResult {
};
exports.ExperimentResult = ExperimentResult;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExperimentResult.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExperimentResult.prototype, "variantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => experiment_variant_entity_1.ExperimentVariant, variant => variant.results),
    (0, typeorm_1.JoinColumn)({ name: 'variantId' }),
    __metadata("design:type", experiment_variant_entity_1.ExperimentVariant)
], ExperimentResult.prototype, "variant", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExperimentResult.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExperimentResult.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ResultType,
    }),
    __metadata("design:type", String)
], ExperimentResult.prototype, "resultType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], ExperimentResult.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExperimentResult.prototype, "context", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", String)
], ExperimentResult.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExperimentResult.prototype, "timestamp", void 0);
exports.ExperimentResult = ExperimentResult = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('experiment_results')
], ExperimentResult);
//# sourceMappingURL=experiment-result.entity.js.map