'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.VendorModule = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const event_emitter_1 = require('@nestjs/event-emitter');
const typeorm_1 = require('@nestjs/typeorm');
const vendor_address_entity_1 = require('./entities/vendor-address.entity');
const vendor_application_entity_1 = require('./entities/vendor-application.entity');
const vendor_banking_details_entity_1 = require('./entities/vendor-banking-details.entity');
const vendor_document_entity_1 = require('./entities/vendor-document.entity');
const vendor_entity_1 = require('./entities/vendor.entity');
const transaction_service_1 = require('../../common/transaction/transaction.service');
const vendor_config_service_1 = require('../../config/vendor-config.service');
const vendor_event_bus_service_1 = require('../../events/vendor-event-bus.service');
const application_review_service_1 = require('./application-review.service');
const admin_vendor_applications_controller_1 = require('./controllers/admin-vendor-applications.controller');
const vendor_application_status_controller_1 = require('./controllers/vendor-application-status.controller');
const vendor_documents_controller_1 = require('./controllers/vendor-documents.controller');
const vendor_registration_controller_1 = require('./controllers/vendor-registration.controller');
const document_upload_updated_service_1 = require('./document-upload-updated.service');
const document_verification_service_1 = require('./document-verification.service');
const vendor_creation_updated_service_1 = require('./vendor-creation-updated.service');
const vendor_notification_service_1 = require('./vendor-notification.service');
const vendor_registration_service_1 = require('./vendor-registration.service');
let VendorModule = class VendorModule {};
exports.VendorModule = VendorModule;
exports.VendorModule = VendorModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          vendor_entity_1.Vendor,
          vendor_application_entity_1.VendorApplication,
          vendor_document_entity_1.VendorDocument,
          vendor_banking_details_entity_1.VendorBankingDetails,
          vendor_address_entity_1.VendorAddress,
        ]),
        event_emitter_1.EventEmitterModule.forRoot(),
        config_1.ConfigModule,
      ],
      controllers: [
        vendor_registration_controller_1.VendorRegistrationController,
        vendor_application_status_controller_1.VendorApplicationStatusController,
        admin_vendor_applications_controller_1.AdminVendorApplicationsController,
        vendor_documents_controller_1.VendorDocumentsController,
      ],
      providers: [
        transaction_service_1.TransactionService,
        vendor_event_bus_service_1.VendorEventBus,
        vendor_config_service_1.VendorConfigService,
        vendor_registration_service_1.VendorRegistrationService,
        application_review_service_1.ApplicationReviewService,
        document_verification_service_1.DocumentVerificationService,
        vendor_creation_updated_service_1.VendorCreationService,
        vendor_notification_service_1.VendorNotificationService,
        document_upload_updated_service_1.DocumentUploadService,
      ],
      exports: [
        vendor_registration_service_1.VendorRegistrationService,
        application_review_service_1.ApplicationReviewService,
        document_verification_service_1.DocumentVerificationService,
        vendor_creation_updated_service_1.VendorCreationService,
        vendor_config_service_1.VendorConfigService,
      ],
    }),
  ],
  VendorModule,
);
//# sourceMappingURL=vendor.module.js.map
