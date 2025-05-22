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
exports.VendorDocument = exports.DocumentStatus = exports.DocumentType = void 0;
const typeorm_1 = require('typeorm');
var DocumentType;
(function (DocumentType) {
  DocumentType['BUSINESS_LICENSE'] = 'business_license';
  DocumentType['IDENTITY_DOCUMENT'] = 'identity_document';
  DocumentType['TAX_CERTIFICATE'] = 'tax_certificate';
  DocumentType['BANK_STATEMENT'] = 'bank_statement';
  DocumentType['OTHER'] = 'other';
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
  DocumentStatus['PENDING'] = 'pending';
  DocumentStatus['NEEDS_REVIEW'] = 'needs_review';
  DocumentStatus['VERIFIED'] = 'verified';
  DocumentStatus['REJECTED'] = 'rejected';
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let VendorDocument = class VendorDocument {};
exports.VendorDocument = VendorDocument;
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)('uuid'), __metadata('design:type', String)],
  VendorDocument.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)(), __metadata('design:type', String)],
  VendorDocument.prototype,
  'vendorId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)('Vendor', 'documents'),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata('design:type', Object),
  ],
  VendorDocument.prototype,
  'vendor',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: DocumentType,
      default: DocumentType.OTHER,
    }),
    __metadata('design:type', String),
  ],
  VendorDocument.prototype,
  'documentType',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: DocumentStatus,
      default: DocumentStatus.PENDING,
    }),
    __metadata('design:type', String),
  ],
  VendorDocument.prototype,
  'status',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'text' }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'filePath',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', Number)],
  VendorDocument.prototype,
  'fileSize',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 100 }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'mimeType',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'originalFilename',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'checksum',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'verifiedBy',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', Date)],
  VendorDocument.prototype,
  'verifiedAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', Date)],
  VendorDocument.prototype,
  'autoVerifiedAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'text', nullable: true }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'notes',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'rejectionReason',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  VendorDocument.prototype,
  'applicationId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)('VendorApplication', 'documents'),
    (0, typeorm_1.JoinColumn)({ name: 'application_id' }),
    __metadata('design:type', Object),
  ],
  VendorDocument.prototype,
  'application',
  void 0,
);
__decorate(
  [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' }), __metadata('design:type', Date)],
  VendorDocument.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }), __metadata('design:type', Date)],
  VendorDocument.prototype,
  'updatedAt',
  void 0,
);
exports.VendorDocument = VendorDocument = __decorate(
  [(0, typeorm_1.Entity)('vendor_documents')],
  VendorDocument,
);
//# sourceMappingURL=vendor-document.entity.js.map
