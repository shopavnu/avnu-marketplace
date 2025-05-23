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
exports.MerchantPlatformConnection = void 0;
const typeorm_1 = require("typeorm");
const merchant_entity_1 = require("../../merchants/entities/merchant.entity");
const platform_type_enum_1 = require("../enums/platform-type.enum");
let MerchantPlatformConnection = class MerchantPlatformConnection {
    constructor() {
        this.id = 0;
        this.merchantId = '';
        this.merchant = new merchant_entity_1.Merchant();
        this.platformType = platform_type_enum_1.PlatformType.SHOPIFY;
        this.platformIdentifier = '';
        this.platformStoreName = '';
        this.platformStoreUrl = '';
        this.accessToken = '';
        this.refreshToken = '';
        this.tokenExpiresAt = new Date();
        this.isActive = true;
        this.lastSyncedAt = new Date();
        this.lastSyncStatus = '';
        this.lastSyncError = '';
        this.platformConfig = {};
        this.metadata = {};
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.MerchantPlatformConnection = MerchantPlatformConnection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MerchantPlatformConnection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => merchant_entity_1.Merchant, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'merchant_id' }),
    __metadata("design:type", merchant_entity_1.Merchant)
], MerchantPlatformConnection.prototype, "merchant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_type', type: 'varchar' }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "platformType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_identifier', nullable: true }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "platformIdentifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_store_name' }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "platformStoreName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_store_url' }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "platformStoreUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_token', nullable: true }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token', nullable: true }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_expires_at', nullable: true }),
    __metadata("design:type", Date)
], MerchantPlatformConnection.prototype, "tokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], MerchantPlatformConnection.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_synced_at', nullable: true }),
    __metadata("design:type", Date)
], MerchantPlatformConnection.prototype, "lastSyncedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_status', nullable: true }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "lastSyncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_error', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], MerchantPlatformConnection.prototype, "lastSyncError", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'platform_config', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MerchantPlatformConnection.prototype, "platformConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadata', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MerchantPlatformConnection.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MerchantPlatformConnection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MerchantPlatformConnection.prototype, "updatedAt", void 0);
exports.MerchantPlatformConnection = MerchantPlatformConnection = __decorate([
    (0, typeorm_1.Entity)({ name: 'merchant_platform_connections' })
], MerchantPlatformConnection);
//# sourceMappingURL=merchant-platform-connection.entity.js.map