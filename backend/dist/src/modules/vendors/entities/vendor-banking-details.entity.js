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
exports.VendorBankingDetails = void 0;
const typeorm_1 = require('typeorm');
let VendorBankingDetails = class VendorBankingDetails {};
exports.VendorBankingDetails = VendorBankingDetails;
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)('uuid'), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)(), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'vendorId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToOne)('Vendor', 'bankingDetails'),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata('design:type', Object),
  ],
  VendorBankingDetails.prototype,
  'vendor',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'bankName',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'accountHolderName',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 255 }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'accountNumber',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 50 }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'routingNumber',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 50, nullable: true }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'accountType',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ length: 3, default: 'USD' }), __metadata('design:type', String)],
  VendorBankingDetails.prototype,
  'currency',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ default: false }), __metadata('design:type', Boolean)],
  VendorBankingDetails.prototype,
  'isVerified',
  void 0,
);
__decorate(
  [(0, typeorm_1.Column)({ nullable: true }), __metadata('design:type', Date)],
  VendorBankingDetails.prototype,
  'verifiedAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' }), __metadata('design:type', Date)],
  VendorBankingDetails.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }), __metadata('design:type', Date)],
  VendorBankingDetails.prototype,
  'updatedAt',
  void 0,
);
exports.VendorBankingDetails = VendorBankingDetails = __decorate(
  [(0, typeorm_1.Entity)('vendor_banking_details')],
  VendorBankingDetails,
);
//# sourceMappingURL=vendor-banking-details.entity.js.map
