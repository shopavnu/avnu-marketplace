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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var VendorCreationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.VendorCreationService = exports.VendorRepositoriesUpdated = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const vendor_address_entity_1 = require('./entities/vendor-address.entity');
const vendor_application_entity_1 = require('./entities/vendor-application.entity');
const vendor_banking_details_entity_1 = require('./entities/vendor-banking-details.entity');
const vendor_document_entity_1 = require('./entities/vendor-document.entity');
const vendor_entity_1 = require('./entities/vendor.entity');
const transaction_service_1 = require('../../common/transaction/transaction.service');
const vendor_config_service_1 = require('../../config/vendor-config.service');
const vendor_event_bus_service_1 = require('../../events/vendor-event-bus.service');
let VendorRepositoriesUpdated = class VendorRepositoriesUpdated {
  constructor(vendor, vendorApplication, vendorDocument, vendorBankingDetails, vendorAddress) {
    this.vendor = vendor;
    this.vendorApplication = vendorApplication;
    this.vendorDocument = vendorDocument;
    this.vendorBankingDetails = vendorBankingDetails;
    this.vendorAddress = vendorAddress;
  }
};
exports.VendorRepositoriesUpdated = VendorRepositoriesUpdated;
exports.VendorRepositoriesUpdated = VendorRepositoriesUpdated = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_application_entity_1.VendorApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_document_entity_1.VendorDocument)),
    __param(
      3,
      (0, typeorm_1.InjectRepository)(vendor_banking_details_entity_1.VendorBankingDetails),
    ),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_address_entity_1.VendorAddress)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
    ]),
  ],
  VendorRepositoriesUpdated,
);
let VendorCreationService = (VendorCreationService_1 = class VendorCreationService {
  constructor(_repositories, _transactionService, _eventBus, _configService) {
    this._repositories = _repositories;
    this._transactionService = _transactionService;
    this._eventBus = _eventBus;
    this._configService = _configService;
    this._logger = new common_1.Logger(VendorCreationService_1.name);
  }
  async createVendorFromApplication(applicationId) {
    const application = await this._repositories.vendorApplication.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new common_1.NotFoundException(`Application with ID ${applicationId} not found`);
    }
    if (application.status !== vendor_entity_1.VendorStatus.APPROVED) {
      throw new Error(`Cannot create vendor from application with status ${application.status}`);
    }
    if (application.vendorId) {
      const existingVendor = await this._repositories.vendor.findOne({
        where: { id: application.vendorId },
      });
      if (existingVendor) {
        return existingVendor;
      }
    }
    return this._transactionService.executeInTransaction(async queryRunner => {
      const savedVendor = await this._createVendorEntity(application, queryRunner);
      await this._createVendorAssociatedRecords(savedVendor, application, queryRunner);
      this._publishVendorCreatedEvent(savedVendor.id, application.id);
      return savedVendor;
    });
  }
  async _createVendorEntity(application, queryRunner) {
    const formData = application.formData;
    const vendor = new vendor_entity_1.Vendor();
    vendor.businessName = formData.businessName;
    vendor.businessEmail = formData.businessEmail;
    vendor.phone = formData.phone;
    vendor.businessType = formData.businessType;
    vendor.businessId = formData.businessId;
    vendor.productCategories = formData.productCategories;
    vendor.status = vendor_entity_1.VendorStatus.APPROVED;
    vendor.commissionRate = this._configService.defaultCommissionRate;
    return await queryRunner.manager.save(vendor);
  }
  async _createVendorAssociatedRecords(vendor, application, queryRunner) {
    const formData = application.formData;
    await this._createBankingDetails(vendor.id, formData, queryRunner);
    if (formData.addressLine1) {
      await this._createBusinessAddress(vendor.id, formData, queryRunner);
    }
    await this._linkDocumentsToVendor(vendor.id, application, queryRunner);
    application.vendorId = vendor.id;
    await queryRunner.manager.save(application);
  }
  async _createBankingDetails(vendorId, formData, queryRunner) {
    const bankingDetails = new vendor_banking_details_entity_1.VendorBankingDetails();
    bankingDetails.vendorId = vendorId;
    bankingDetails.bankName = formData.bankName;
    bankingDetails.accountHolderName = formData.accountHolderName;
    bankingDetails.accountNumber = formData.accountNumber;
    bankingDetails.routingNumber = formData.routingNumber;
    await queryRunner.manager.save(bankingDetails);
  }
  async _createBusinessAddress(vendorId, formData, queryRunner) {
    const address = new vendor_address_entity_1.VendorAddress();
    address.vendorId = vendorId;
    address.addressType = vendor_address_entity_1.AddressType.BUSINESS;
    address.addressLine1 = formData.addressLine1;
    address.addressLine2 = formData.addressLine2 || '';
    address.city = formData.city;
    address.state = formData.state;
    address.postalCode = formData.postalCode;
    address.country = formData.country;
    address.isDefault = true;
    await queryRunner.manager.save(address);
  }
  async _linkDocumentsToVendor(vendorId, application, queryRunner) {
    const documents = await this._repositories.vendorDocument.find({
      where: { application: { id: application.id } },
    });
    for (const document of documents) {
      document.vendorId = vendorId;
      await queryRunner.manager.save(document);
    }
  }
  _publishVendorCreatedEvent(vendorId, applicationId) {
    this._eventBus.publishVendorCreated({
      vendorId: vendorId,
      applicationId: applicationId,
      timestamp: new Date(),
    });
  }
});
exports.VendorCreationService = VendorCreationService;
exports.VendorCreationService =
  VendorCreationService =
  VendorCreationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          VendorRepositoriesUpdated,
          transaction_service_1.TransactionService,
          vendor_event_bus_service_1.VendorEventBus,
          vendor_config_service_1.VendorConfigService,
        ]),
      ],
      VendorCreationService,
    );
//# sourceMappingURL=vendor-creation-updated.service.js.map
