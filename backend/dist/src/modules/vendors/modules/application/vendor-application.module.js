"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorApplicationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const vendor_application_entity_1 = require("../../entities/vendor-application.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const transaction_service_1 = require("../../../../common/transaction.service");
const vendor_config_service_1 = require("../../../../config/vendor-config.service");
const vendor_event_bus_service_1 = require("../../../../events/vendor-event-bus.service");
const application_review_service_1 = require("../../application-review.service");
const admin_vendor_applications_controller_1 = require("../../controllers/admin-vendor-applications.controller");
const vendor_application_status_controller_1 = require("../../controllers/vendor-application-status.controller");
const vendor_registration_controller_1 = require("../../controllers/vendor-registration.controller");
const vendor_creation_updated_service_1 = require("../../vendor-creation-updated.service");
const vendor_registration_service_1 = require("../../vendor-registration.service");
let VendorApplicationModule = class VendorApplicationModule {
};
exports.VendorApplicationModule = VendorApplicationModule;
exports.VendorApplicationModule = VendorApplicationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([vendor_application_entity_1.VendorApplication, vendor_entity_1.Vendor])],
        controllers: [
            vendor_registration_controller_1.VendorRegistrationController,
            vendor_application_status_controller_1.VendorApplicationStatusController,
            admin_vendor_applications_controller_1.AdminVendorApplicationsController,
        ],
        providers: [
            application_review_service_1.ApplicationReviewService,
            vendor_registration_service_1.VendorRegistrationService,
            vendor_creation_updated_service_1.VendorCreationService,
            transaction_service_1.TransactionService,
            vendor_event_bus_service_1.VendorEventBus,
            vendor_config_service_1.VendorConfigService,
        ],
        exports: [application_review_service_1.ApplicationReviewService, vendor_registration_service_1.VendorRegistrationService, vendor_creation_updated_service_1.VendorCreationService],
    })
], VendorApplicationModule);
//# sourceMappingURL=vendor-application.module.js.map