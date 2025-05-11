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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.VendorConfigService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
let VendorConfigService = class VendorConfigService {
  constructor(configService) {
    this.configService = configService;
  }
  get documentsUploadDir() {
    return this.configService.get('VENDOR_DOCUMENTS_UPLOAD_DIR', 'uploads/vendor-documents');
  }
  get allowedDocumentTypes() {
    return ['application/pdf', 'image/jpeg', 'image/png'];
  }
  get maxDocumentSizeBytes() {
    return this.configService.get('MAX_DOCUMENT_SIZE_BYTES', 5 * 1024 * 1024);
  }
  get applicationReviewTimeoutDays() {
    return this.configService.get('VENDOR_APPLICATION_REVIEW_TIMEOUT_DAYS', 7);
  }
  get defaultCommissionRate() {
    return this.configService.get('DEFAULT_VENDOR_COMMISSION_RATE', 0.15);
  }
};
exports.VendorConfigService = VendorConfigService;
exports.VendorConfigService = VendorConfigService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
  VendorConfigService,
);
//# sourceMappingURL=vendor-config.service.js.map
