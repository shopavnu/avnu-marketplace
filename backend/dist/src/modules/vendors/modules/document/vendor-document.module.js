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
exports.VendorDocumentModule = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const vendor_application_entity_1 = require('../../entities/vendor-application.entity');
const vendor_document_entity_1 = require('../../entities/vendor-document.entity');
const vendor_config_service_1 = require('../../../../config/vendor-config.service');
const vendor_event_bus_service_1 = require('../../../../events/vendor-event-bus.service');
const vendor_documents_controller_1 = require('../../controllers/vendor-documents.controller');
const document_upload_updated_service_1 = require('../../document-upload-updated.service');
const document_verification_service_1 = require('../../document-verification.service');
let VendorDocumentModule = class VendorDocumentModule {};
exports.VendorDocumentModule = VendorDocumentModule;
exports.VendorDocumentModule = VendorDocumentModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          vendor_document_entity_1.VendorDocument,
          vendor_application_entity_1.VendorApplication,
        ]),
      ],
      controllers: [vendor_documents_controller_1.VendorDocumentsController],
      providers: [
        document_verification_service_1.DocumentVerificationService,
        document_upload_updated_service_1.DocumentUploadService,
        vendor_event_bus_service_1.VendorEventBus,
        vendor_config_service_1.VendorConfigService,
      ],
      exports: [
        document_verification_service_1.DocumentVerificationService,
        document_upload_updated_service_1.DocumentUploadService,
      ],
    }),
  ],
  VendorDocumentModule,
);
//# sourceMappingURL=vendor-document.module.js.map
