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
exports.Vendor = exports.BusinessType = exports.VendorStatus = void 0;
const typeorm_1 = require('typeorm');
var VendorStatus;
(function (VendorStatus) {
  VendorStatus['PENDING'] = 'pending';
  VendorStatus['UNDER_REVIEW'] = 'under_review';
  VendorStatus['APPROVED'] = 'approved';
  VendorStatus['REJECTED'] = 'rejected';
  VendorStatus['SUSPENDED'] = 'suspended';
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
var BusinessType;
(function (BusinessType) {
  BusinessType['INDIVIDUAL'] = 'individual';
  BusinessType['LLC'] = 'llc';
  BusinessType['CORPORATION'] = 'corporation';
  BusinessType['PARTNERSHIP'] = 'partnership';
  BusinessType['OTHER'] = 'other';
})(BusinessType || (exports.BusinessType = BusinessType = {}));
let Vendor = class Vendor {};
exports.Vendor = Vendor;
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)('uuid'), __metadata('design:type', String)],
  Vendor.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  Vendor.prototype,
  'businessName',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ length: 255 }),
    (0, typeorm_1.Index)({ unique: true }),
    __metadata('design:type', String),
  ],
  Vendor.prototype,
  'businessEmail',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 50 }), __metadata('design:type', String)],
  Vendor.prototype,
  'phone',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: BusinessType,
      default: BusinessType.INDIVIDUAL,
    }),
    __metadata('design:type', String),
  ],
  Vendor.prototype,
  'businessType',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255, nullable: true }), __metadata('design:type', String)],
  Vendor.prototype,
  'website',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ type: 'text', nullable: true }), __metadata('design:type', String)],
  Vendor.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: VendorStatus,
      default: VendorStatus.PENDING,
    }),
    __metadata('design:type', String),
  ],
  Vendor.prototype,
  'status',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255, nullable: true }), __metadata('design:type', String)],
  Vendor.prototype,
  'businessId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata('design:type', Array),
  ],
  Vendor.prototype,
  'productCategories',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ default: false }), __metadata('design:type', Boolean)],
  Vendor.prototype,
  'isVerified',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', Date)],
  Vendor.prototype,
  'verifiedAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  Vendor.prototype,
  'verifiedBy',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', String)],
  Vendor.prototype,
  'rejectionReason',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: 0, type: 'decimal', precision: 10, scale: 2 }),
    __metadata('design:type', Number),
  ],
  Vendor.prototype,
  'commissionRate',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ default: true }), __metadata('design:type', Boolean)],
  Vendor.prototype,
  'canListNewProducts',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ default: 0 }), __metadata('design:type', Number)],
  Vendor.prototype,
  'productsCount',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToOne)('VendorBankingDetails', 'vendor', {
      cascade: true,
    }),
    __metadata('design:type', Object),
  ],
  Vendor.prototype,
  'bankingDetails',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)('VendorDocument', 'vendor', {
      cascade: true,
    }),
    __metadata('design:type', Array),
  ],
  Vendor.prototype,
  'documents',
  void 0,
);
__decorate(
  [(0, typeorm_1.OneToMany)('Product', 'vendor'), __metadata('design:type', Array)],
  Vendor.prototype,
  'products',
  void 0,
);
__decorate(
  [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' }), __metadata('design:type', Date)],
  Vendor.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }), __metadata('design:type', Date)],
  Vendor.prototype,
  'updatedAt',
  void 0,
);
exports.Vendor = Vendor = __decorate([(0, typeorm_1.Entity)('vendors')], Vendor);
//# sourceMappingURL=vendor.entity.js.map
