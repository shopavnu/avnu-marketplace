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
exports.RecommendationConfig = exports.RecommendationAlgorithmType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var RecommendationAlgorithmType;
(function (RecommendationAlgorithmType) {
    RecommendationAlgorithmType["CONTENT_BASED"] = "content_based";
    RecommendationAlgorithmType["COLLABORATIVE_FILTERING"] = "collaborative_filtering";
    RecommendationAlgorithmType["HYBRID"] = "hybrid";
    RecommendationAlgorithmType["RULE_BASED"] = "rule_based";
    RecommendationAlgorithmType["POPULARITY_BASED"] = "popularity_based";
    RecommendationAlgorithmType["ATTRIBUTE_BASED"] = "attribute_based";
    RecommendationAlgorithmType["EMBEDDING_BASED"] = "embedding_based";
    RecommendationAlgorithmType["CUSTOM"] = "custom";
})(RecommendationAlgorithmType || (exports.RecommendationAlgorithmType = RecommendationAlgorithmType = {}));
let RecommendationConfig = class RecommendationConfig {
};
exports.RecommendationConfig = RecommendationConfig;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RecommendationConfig.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata("design:type", String)
], RecommendationConfig.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RecommendationConfig.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => RecommendationAlgorithmType),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecommendationAlgorithmType,
        default: RecommendationAlgorithmType.CONTENT_BASED,
    }),
    __metadata("design:type", String)
], RecommendationConfig.prototype, "algorithmType", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RecommendationConfig.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], RecommendationConfig.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], RecommendationConfig.prototype, "parameters", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], RecommendationConfig.prototype, "supportedRecommendationTypes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 10 }),
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], RecommendationConfig.prototype, "defaultLimit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RecommendationConfig.prototype, "totalImpressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RecommendationConfig.prototype, "totalClicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], RecommendationConfig.prototype, "totalConversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RecommendationConfig.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RecommendationConfig.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RecommendationConfig.prototype, "updatedAt", void 0);
exports.RecommendationConfig = RecommendationConfig = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('recommendation_configs')
], RecommendationConfig);
//# sourceMappingURL=recommendation-config.entity.js.map