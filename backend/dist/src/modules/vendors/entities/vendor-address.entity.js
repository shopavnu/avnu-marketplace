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
exports.VendorAddress = exports.AddressType = void 0;
const typeorm_1 = require("typeorm");
var AddressType;
(function (AddressType) {
    AddressType["BUSINESS"] = "business";
    AddressType["SHIPPING"] = "shipping";
    AddressType["BILLING"] = "billing";
    AddressType["WAREHOUSE"] = "warehouse";
})(AddressType || (exports.AddressType = AddressType = {}));
let VendorAddress = class VendorAddress {
};
exports.VendorAddress = VendorAddress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VendorAddress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VendorAddress.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Vendor'),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", Object)
], VendorAddress.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AddressType,
        default: AddressType.BUSINESS,
    }),
    __metadata("design:type", String)
], VendorAddress.prototype, "addressType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], VendorAddress.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], VendorAddress.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VendorAddress.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VendorAddress.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], VendorAddress.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VendorAddress.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VendorAddress.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], VendorAddress.prototype, "contactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VendorAddress.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VendorAddress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], VendorAddress.prototype, "updatedAt", void 0);
exports.VendorAddress = VendorAddress = __decorate([
    (0, typeorm_1.Entity)('vendor_addresses')
], VendorAddress);
//# sourceMappingURL=vendor-address.entity.js.map