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
exports.BusinessMetrics = exports.TimeGranularity = exports.MetricType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var MetricType;
(function (MetricType) {
    MetricType["REVENUE"] = "revenue";
    MetricType["ORDERS"] = "orders";
    MetricType["AOV"] = "average_order_value";
    MetricType["CONVERSION_RATE"] = "conversion_rate";
    MetricType["PRODUCT_VIEWS"] = "product_views";
    MetricType["CART_ADDS"] = "cart_adds";
    MetricType["CHECKOUT_STARTS"] = "checkout_starts";
    MetricType["CHECKOUT_COMPLETIONS"] = "checkout_completions";
    MetricType["CART_ABANDONMENT"] = "cart_abandonment";
    MetricType["NEW_USERS"] = "new_users";
    MetricType["RETURNING_USERS"] = "returning_users";
    MetricType["SEARCH_COUNT"] = "search_count";
    MetricType["SEARCH_CONVERSION"] = "search_conversion";
    MetricType["MERCHANT_REVENUE"] = "merchant_revenue";
    MetricType["PLATFORM_REVENUE"] = "platform_revenue";
})(MetricType || (exports.MetricType = MetricType = {}));
var TimeGranularity;
(function (TimeGranularity) {
    TimeGranularity["HOURLY"] = "hourly";
    TimeGranularity["DAILY"] = "daily";
    TimeGranularity["WEEKLY"] = "weekly";
    TimeGranularity["MONTHLY"] = "monthly";
})(TimeGranularity || (exports.TimeGranularity = TimeGranularity = {}));
let BusinessMetrics = class BusinessMetrics {
};
exports.BusinessMetrics = BusinessMetrics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MetricType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "metricType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], BusinessMetrics.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "dimension1", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "dimension2", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "dimension3", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TimeGranularity,
        default: TimeGranularity.DAILY,
    }),
    __metadata("design:type", String)
], BusinessMetrics.prototype, "timeGranularity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "periodStart", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BusinessMetrics.prototype, "periodEnd", void 0);
exports.BusinessMetrics = BusinessMetrics = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('business_metrics')
], BusinessMetrics);
//# sourceMappingURL=business-metrics.entity.js.map