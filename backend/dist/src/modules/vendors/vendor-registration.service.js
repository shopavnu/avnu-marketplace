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
var VendorRegistrationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_application_entity_1 = require("./entities/vendor-application.entity");
const vendor_document_entity_1 = require("./entities/vendor-document.entity");
const vendor_entity_1 = require("./entities/vendor.entity");
const transaction_service_1 = require("../../common/transaction.service");
const vendor_event_bus_service_1 = require("../../events/vendor-event-bus.service");
let VendorRegistrationService = VendorRegistrationService_1 = class VendorRegistrationService {
    constructor(_vendorRepository, _vendorApplicationRepository, _vendorDocumentRepository, _transactionService, _eventBus, _configService) {
        this._vendorRepository = _vendorRepository;
        this._vendorApplicationRepository = _vendorApplicationRepository;
        this._vendorDocumentRepository = _vendorDocumentRepository;
        this._transactionService = _transactionService;
        this._eventBus = _eventBus;
        this._configService = _configService;
        this._logger = new common_1.Logger(VendorRegistrationService_1.name);
    }
    async createVendorApplication(applicationData) {
        const existingVendor = await this._vendorRepository.findOne({
            where: { businessEmail: applicationData.businessEmail },
        });
        if (existingVendor) {
            throw new common_1.BadRequestException('A vendor with this email already exists');
        }
        return this._transactionService.executeInTransaction(async (queryRunner) => {
            const application = new vendor_application_entity_1.VendorApplication();
            application.status = vendor_entity_1.VendorStatus.PENDING;
            application.currentStep = vendor_application_entity_1.ApplicationStep.COMPLETED;
            application.formData = this._sanitizeFormData(applicationData);
            application.termsAccepted = applicationData.termsAgreement || false;
            application.submittedAt = new Date();
            const savedApplication = await queryRunner.manager.save(application);
            if (applicationData.businessLicensePath) {
                const document = new vendor_document_entity_1.VendorDocument();
                document.name = 'Business License';
                document.documentType = vendor_document_entity_1.DocumentType.BUSINESS_LICENSE;
                document.filePath = applicationData.businessLicensePath;
                document.application = savedApplication;
                await queryRunner.manager.save(document);
            }
            if (applicationData.identityDocumentPath) {
                const document = new vendor_document_entity_1.VendorDocument();
                document.name = 'Identity Document';
                document.documentType = vendor_document_entity_1.DocumentType.IDENTITY_DOCUMENT;
                document.filePath = applicationData.identityDocumentPath;
                document.application = savedApplication;
                await queryRunner.manager.save(document);
            }
            this._eventBus.publishVendorApplicationCreated({
                applicationId: savedApplication.id,
                businessEmail: applicationData.businessEmail,
                businessName: applicationData.businessName,
                timestamp: new Date(),
            });
            return savedApplication;
        });
    }
    async getApplicationStatus(applicationId) {
        const application = await this._vendorApplicationRepository.findOne({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.BadRequestException('Application not found');
        }
        return application;
    }
    _sanitizeFormData(formData) {
        const sanitized = { ...formData };
        delete sanitized.businessLicensePath;
        delete sanitized.identityDocumentPath;
        if (sanitized.accountNumber) {
            const length = sanitized.accountNumber.length;
            sanitized.accountNumber = 'XXXX' + sanitized.accountNumber.substring(length - 4, length);
        }
        if (sanitized.routingNumber) {
            const length = sanitized.routingNumber.length;
            sanitized.routingNumber = 'XXXX' + sanitized.routingNumber.substring(length - 4, length);
        }
        return sanitized;
    }
};
exports.VendorRegistrationService = VendorRegistrationService;
exports.VendorRegistrationService = VendorRegistrationService = VendorRegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_application_entity_1.VendorApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_document_entity_1.VendorDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof transaction_service_1.TransactionService !== "undefined" && transaction_service_1.TransactionService) === "function" ? _a : Object, vendor_event_bus_service_1.VendorEventBus,
        config_1.ConfigService])
], VendorRegistrationService);
//# sourceMappingURL=vendor-registration.service.js.map