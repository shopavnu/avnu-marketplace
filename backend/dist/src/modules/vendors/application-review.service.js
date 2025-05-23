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
var ApplicationReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_application_entity_1 = require("./entities/vendor-application.entity");
const vendor_entity_1 = require("./entities/vendor.entity");
const transaction_service_1 = require("../../common/transaction.service");
const vendor_event_bus_service_1 = require("../../events/vendor-event-bus.service");
let ApplicationReviewService = ApplicationReviewService_1 = class ApplicationReviewService {
    constructor(_vendorApplicationRepository, _transactionService, _eventBus) {
        this._vendorApplicationRepository = _vendorApplicationRepository;
        this._transactionService = _transactionService;
        this._eventBus = _eventBus;
        this._logger = new common_1.Logger(ApplicationReviewService_1.name);
    }
    async startApplicationReview(applicationId, adminId) {
        const application = await this._vendorApplicationRepository.findOne({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${applicationId} not found`);
        }
        if (application.status !== vendor_entity_1.VendorStatus.PENDING) {
            throw new common_1.BadRequestException(`Application is already under review or has been processed`);
        }
        const previousStatus = application.status;
        application.status = vendor_entity_1.VendorStatus.UNDER_REVIEW;
        application.reviewStartedAt = new Date();
        application.reviewedBy = adminId;
        const updatedApplication = await this._vendorApplicationRepository.save(application);
        this._eventBus.publishApplicationStatusChanged({
            applicationId,
            previousStatus,
            newStatus: vendor_entity_1.VendorStatus.UNDER_REVIEW,
            adminId,
            timestamp: new Date(),
        });
        return updatedApplication;
    }
    async getApplicationById(applicationId) {
        const application = await this._vendorApplicationRepository.findOne({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException(`Application with ID ${applicationId} not found`);
        }
        return application;
    }
    async updateApplicationStatus(applicationId, newStatus, data) {
        const application = await this.getApplicationById(applicationId);
        const previousStatus = application.status;
        application.status = newStatus;
        if ((newStatus === vendor_entity_1.VendorStatus.APPROVED || newStatus === vendor_entity_1.VendorStatus.REJECTED) &&
            !application.reviewCompletedAt) {
            application.reviewCompletedAt = new Date();
            application.reviewedBy = data.adminId;
        }
        if (newStatus === vendor_entity_1.VendorStatus.REJECTED) {
            application.rejectionReason = data.reason !== undefined ? data.reason : 'No reason provided';
        }
        if (data.notes) {
            application.adminNotes = application.adminNotes
                ? `${application.adminNotes}\n\n${new Date().toISOString()} - ${data.notes}`
                : `${new Date().toISOString()} - ${data.notes}`;
        }
        const updatedApplication = await this._vendorApplicationRepository.save(application);
        this._eventBus.publishApplicationStatusChanged({
            applicationId,
            previousStatus,
            newStatus,
            adminId: data.adminId,
            timestamp: new Date(),
            reason: data.reason,
            notes: data.notes,
        });
        return updatedApplication;
    }
    async getApplicationHistory(_applicationId) {
        return [
            {
                timestamp: new Date(Date.now() - 86400000 * 2),
                status: vendor_entity_1.VendorStatus.PENDING,
                actor: 'system',
                notes: 'Application submitted',
            },
            {
                timestamp: new Date(Date.now() - 86400000),
                status: vendor_entity_1.VendorStatus.UNDER_REVIEW,
                actor: 'admin',
                notes: 'Application review started',
            },
        ];
    }
};
exports.ApplicationReviewService = ApplicationReviewService;
exports.ApplicationReviewService = ApplicationReviewService = ApplicationReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_application_entity_1.VendorApplication)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transaction_service_1.TransactionService,
        vendor_event_bus_service_1.VendorEventBus])
], ApplicationReviewService);
//# sourceMappingURL=application-review.service.js.map