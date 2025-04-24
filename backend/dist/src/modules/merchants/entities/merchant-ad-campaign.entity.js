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
exports.MerchantAdCampaign = exports.TargetAudience = exports.CampaignStatus = exports.CampaignType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const merchant_entity_1 = require("./merchant.entity");
var CampaignType;
(function (CampaignType) {
    CampaignType["PRODUCT_PROMOTION"] = "product_promotion";
    CampaignType["RETARGETING"] = "retargeting";
    CampaignType["BRAND_AWARENESS"] = "brand_awareness";
})(CampaignType || (exports.CampaignType = CampaignType = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "draft";
    CampaignStatus["ACTIVE"] = "active";
    CampaignStatus["PAUSED"] = "paused";
    CampaignStatus["COMPLETED"] = "completed";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var TargetAudience;
(function (TargetAudience) {
    TargetAudience["ALL"] = "all";
    TargetAudience["PREVIOUS_VISITORS"] = "previous_visitors";
    TargetAudience["CART_ABANDONERS"] = "cart_abandoners";
    TargetAudience["PREVIOUS_CUSTOMERS"] = "previous_customers";
})(TargetAudience || (exports.TargetAudience = TargetAudience = {}));
(0, graphql_1.registerEnumType)(CampaignType, { name: 'CampaignType' });
(0, graphql_1.registerEnumType)(CampaignStatus, { name: 'CampaignStatus' });
(0, graphql_1.registerEnumType)(TargetAudience, { name: 'TargetAudience' });
let MerchantAdCampaign = class MerchantAdCampaign {
};
exports.MerchantAdCampaign = MerchantAdCampaign;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "merchantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => merchant_entity_1.Merchant),
    (0, typeorm_1.ManyToOne)(() => merchant_entity_1.Merchant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'merchantId' }),
    __metadata("design:type", merchant_entity_1.Merchant)
], MerchantAdCampaign.prototype, "merchant", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => CampaignType),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CampaignType,
        default: CampaignType.PRODUCT_PROMOTION,
    }),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => CampaignStatus),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CampaignStatus,
        default: CampaignStatus.DRAFT,
    }),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], MerchantAdCampaign.prototype, "productIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "budget", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "spent", void 0);
__decorate([
    (0, graphql_1.Field)(() => TargetAudience),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TargetAudience,
        default: TargetAudience.ALL,
    }),
    __metadata("design:type", String)
], MerchantAdCampaign.prototype, "targetAudience", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], MerchantAdCampaign.prototype, "targetDemographics", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], MerchantAdCampaign.prototype, "targetLocations", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], MerchantAdCampaign.prototype, "targetInterests", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], MerchantAdCampaign.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MerchantAdCampaign.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "impressions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "clicks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "clickThroughRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "conversions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MerchantAdCampaign.prototype, "conversionRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MerchantAdCampaign.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MerchantAdCampaign.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MerchantAdCampaign.prototype, "lastUpdatedByMerchantAt", void 0);
exports.MerchantAdCampaign = MerchantAdCampaign = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('merchant_ad_campaigns')
], MerchantAdCampaign);
//# sourceMappingURL=merchant-ad-campaign.entity.js.map