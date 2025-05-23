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
exports.VendorApplication = exports.ApplicationStep = void 0;
const typeorm_1 = require("typeorm");
const vendor_entity_1 = require("./vendor.entity");
var ApplicationStep;
(function (ApplicationStep) {
    ApplicationStep["BUSINESS_INFO"] = "business_info";
    ApplicationStep["PRODUCT_INFO"] = "product_info";
    ApplicationStep["PAYMENT_INFO"] = "payment_info";
    ApplicationStep["VERIFICATION"] = "verification";
    ApplicationStep["COMPLETED"] = "completed";
})(ApplicationStep || (exports.ApplicationStep = ApplicationStep = {}));
let VendorApplication = class VendorApplication {
};
exports.VendorApplication = VendorApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: vendor_entity_1.VendorStatus,
        default: vendor_entity_1.VendorStatus.PENDING,
    }),
    __metadata("design:type", String)
], VendorApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApplicationStep,
        default: ApplicationStep.BUSINESS_INFO,
    }),
    __metadata("design:type", String)
], VendorApplication.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VendorApplication.prototype, "formData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VendorApplication.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('Vendor'),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Object)
], VendorApplication.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], VendorApplication.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], VendorApplication.prototype, "reviewStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], VendorApplication.prototype, "reviewCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VendorApplication.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VendorApplication.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VendorApplication.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('VendorDocument', 'application'),
    __metadata("design:type", Array)
], VendorApplication.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorApplication.prototype, "termsAccepted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorApplication.prototype, "isNotificationSent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorApplication.prototype, "updatedAt", void 0);
exports.VendorApplication = VendorApplication = __decorate([
    (0, typeorm_1.Entity)('vendor_applications')
], VendorApplication);
//# sourceMappingURL=vendor-application.entity.js.map