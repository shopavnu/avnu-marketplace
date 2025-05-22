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
exports.QueryPerformanceMetric = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
let QueryPerformanceMetric = class QueryPerformanceMetric {
};
exports.QueryPerformanceMetric = QueryPerformanceMetric;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QueryPerformanceMetric.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], QueryPerformanceMetric.prototype, "queryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], QueryPerformanceMetric.prototype, "queryType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QueryPerformanceMetric.prototype, "executionTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", String)
], QueryPerformanceMetric.prototype, "parameters", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], QueryPerformanceMetric.prototype, "resultCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], QueryPerformanceMetric.prototype, "timestamp", void 0);
exports.QueryPerformanceMetric = QueryPerformanceMetric = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('query_performance_metrics')
], QueryPerformanceMetric);
//# sourceMappingURL=query-performance-metric.entity.js.map