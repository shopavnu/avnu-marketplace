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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VendorCreationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorCreationService = exports.VendorRepositories = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_address_entity_1 = require("./entities/vendor-address.entity");
const vendor_application_entity_1 = require("./entities/vendor-application.entity");
const vendor_banking_details_entity_1 = require("./entities/vendor-banking-details.entity");
const vendor_document_entity_1 = require("./entities/vendor-document.entity");
const vendor_entity_1 = require("./entities/vendor.entity");
const transaction_service_1 = require("../../common/transaction.service");
const vendor_event_bus_service_1 = require("../../events/vendor-event-bus.service");
let VendorRepositories = class VendorRepositories {
    constructor(vendor, vendorApplication, vendorDocument, vendorBankingDetails, vendorAddress) {
        this.vendor = vendor;
        this.vendorApplication = vendorApplication;
        this.vendorDocument = vendorDocument;
        this.vendorBankingDetails = vendorBankingDetails;
        this.vendorAddress = vendorAddress;
    }
};
exports.VendorRepositories = VendorRepositories;
exports.VendorRepositories = VendorRepositories = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_application_entity_1.VendorApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_document_entity_1.VendorDocument)),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_banking_details_entity_1.VendorBankingDetails)),
    __param(4, (0, typeorm_1.InjectRepository)(vendor_address_entity_1.VendorAddress)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VendorRepositories);
let VendorCreationService = VendorCreationService_1 = class VendorCreationService {
    constructor(_repositories, _transactionService, _eventBus) {
        this._repositories = _repositories;
        this._transactionService = _transactionService;
        this._eventBus = _eventBus;
        this._logger = new common_1.Logger(VendorCreationService_1.name);
    }
    async createVendorFromApplication(applicationId) {
        const application = await this._validateAndFetchApplication(applicationId);
        const existingVendor = await this._checkForExistingVendor(application);
        if (existingVendor) {
            return existingVendor;
        }
        return this._transactionService.executeInTransaction(async (queryRunner) => {
            const savedVendor = await this._createVendorEntity(queryRunner, application);
            await this._createBankingDetails(queryRunner, savedVendor, application.formData);
            await this._createAddressIfProvided(queryRunner, savedVendor, application.formData);
            await this._linkDocumentsToVendor(queryRunner, savedVendor.id, application.id);
            await this._updateApplicationWithVendorId(queryRunner, application, savedVendor.id);
            this._eventBus.publishVendorCreated({
                vendorId: savedVendor.id,
                applicationId: application.id,
                timestamp: new Date(),
            });
            return savedVendor;
        });
    }
    async _validateAndFetchApplication(applicationId) {
        const application = await this._repositories.vendorApplication.findOne({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${applicationId} not found`);
        }
        if (application.status !== vendor_entity_1.VendorStatus.APPROVED) {
            throw new Error(`Cannot create vendor from application with status ${application.status}`);
        }
        return application;
    }
    async _checkForExistingVendor(application) {
        if (application.vendorId) {
            const existingVendor = await this._repositories.vendor.findOne({
                where: { id: application.vendorId },
            });
            if (existingVendor) {
                return existingVendor;
            }
        }
        return null;
    }
    async _createVendorEntity(queryRunner, application) {
        const formData = application.formData;
        const vendor = new vendor_entity_1.Vendor();
        vendor.businessName = formData.businessName;
        vendor.businessEmail = formData.businessEmail;
        vendor.phone = formData.phone;
        vendor.businessType = formData.businessType;
        vendor.businessId = formData.businessId;
        vendor.productCategories = formData.productCategories;
        vendor.status = vendor_entity_1.VendorStatus.APPROVED;
        vendor.commissionRate = this._getDefaultCommissionRate(formData.businessType);
        return queryRunner.manager.save(vendor);
    }
    async _createBankingDetails(queryRunner, vendor, formData) {
        const bankingDetails = new vendor_banking_details_entity_1.VendorBankingDetails();
        bankingDetails.vendorId = vendor.id;
        bankingDetails.bankName = formData.bankName;
        bankingDetails.accountHolderName = formData.accountHolderName;
        bankingDetails.accountNumber = formData.accountNumber;
        bankingDetails.routingNumber = formData.routingNumber;
        await queryRunner.manager.save(bankingDetails);
    }
    async _createAddressIfProvided(queryRunner, vendor, formData) {
        if (formData.addressLine1) {
            const address = new vendor_address_entity_1.VendorAddress();
            address.vendorId = vendor.id;
            address.addressType = vendor_address_entity_1.AddressType.BUSINESS;
            address.addressLine1 = formData.addressLine1 || '';
            address.addressLine2 = formData.addressLine2 || '';
            address.city = formData.city || '';
            address.state = formData.state || '';
            address.postalCode = formData.postalCode || '';
            address.country = formData.country || '';
            address.isDefault = true;
            await queryRunner.manager.save(address);
        }
    }
    async _linkDocumentsToVendor(queryRunner, vendorId, applicationId) {
        const documents = await this._repositories.vendorDocument.find({
            where: { application: { id: applicationId } },
        });
        for (const document of documents) {
            document.vendorId = vendorId;
            await queryRunner.manager.save(document);
        }
    }
    async _updateApplicationWithVendorId(queryRunner, application, vendorId) {
        application.vendorId = vendorId;
        await queryRunner.manager.save(application);
    }
    _getDefaultCommissionRate(businessType) {
        switch (businessType) {
            case 'individual':
                return 15.0;
            case 'llc':
            case 'corporation':
                return 12.5;
            case 'partnership':
                return 13.5;
            default:
                return 15.0;
        }
    }
};
exports.VendorCreationService = VendorCreationService;
exports.VendorCreationService = VendorCreationService = VendorCreationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [VendorRepositories, typeof (_a = typeof transaction_service_1.TransactionService !== "undefined" && transaction_service_1.TransactionService) === "function" ? _a : Object, vendor_event_bus_service_1.VendorEventBus])
], VendorCreationService);
//# sourceMappingURL=vendor-creation.service.js.map