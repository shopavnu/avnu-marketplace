"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vendor_address_entity_1 = require("../../entities/vendor-address.entity");
const vendor_banking_details_entity_1 = require("../../entities/vendor-banking-details.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const transaction_service_1 = require("../../../../common/transaction.service");
const vendor_config_service_1 = require("../../../../config/vendor-config.service");
let VendorDashboardModule = class VendorDashboardModule {
};
exports.VendorDashboardModule = VendorDashboardModule;
exports.VendorDashboardModule = VendorDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vendor_entity_1.Vendor, vendor_banking_details_entity_1.VendorBankingDetails, vendor_address_entity_1.VendorAddress])],
        controllers: [],
        providers: [
            vendor_config_service_1.VendorConfigService,
            transaction_service_1.TransactionService,
        ],
        exports: [],
    })
], VendorDashboardModule);
//# sourceMappingURL=vendor-dashboard.module.js.map