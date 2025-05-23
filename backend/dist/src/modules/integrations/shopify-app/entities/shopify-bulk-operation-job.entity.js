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
exports.ShopifyBulkOperationJob = exports.BulkOperationJobStatus = void 0;
const typeorm_1 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
var BulkOperationJobStatus;
(function (BulkOperationJobStatus) {
    BulkOperationJobStatus["CREATED"] = "CREATED";
    BulkOperationJobStatus["RUNNING"] = "RUNNING";
    BulkOperationJobStatus["COMPLETED"] = "COMPLETED";
    BulkOperationJobStatus["FAILED"] = "FAILED";
    BulkOperationJobStatus["CANCELED"] = "CANCELED";
    BulkOperationJobStatus["TIMED_OUT"] = "TIMED_OUT";
})(BulkOperationJobStatus || (exports.BulkOperationJobStatus = BulkOperationJobStatus = {}));
let ShopifyBulkOperationJob = class ShopifyBulkOperationJob {
};
exports.ShopifyBulkOperationJob = ShopifyBulkOperationJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "shopifyBulkOperationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BulkOperationJobStatus,
        default: BulkOperationJobStatus.CREATED,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "statusMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "errorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "errorDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "resultUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "partialResultUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ShopifyBulkOperationJob.prototype, "objectCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ShopifyBulkOperationJob.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ShopifyBulkOperationJob.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ShopifyBulkOperationJob.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ShopifyBulkOperationJob.prototype, "progressPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Object)
], ShopifyBulkOperationJob.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ShopifyBulkOperationJob.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => merchant_platform_connection_entity_1.MerchantPlatformConnection),
    (0, typeorm_1.JoinColumn)({ name: 'connectionId' }),
    __metadata("design:type", merchant_platform_connection_entity_1.MerchantPlatformConnection)
], ShopifyBulkOperationJob.prototype, "connection", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ShopifyBulkOperationJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ShopifyBulkOperationJob.prototype, "updatedAt", void 0);
exports.ShopifyBulkOperationJob = ShopifyBulkOperationJob = __decorate([
    (0, typeorm_1.Entity)('shopify_bulk_operation_jobs')
], ShopifyBulkOperationJob);
//# sourceMappingURL=shopify-bulk-operation-job.entity.js.map