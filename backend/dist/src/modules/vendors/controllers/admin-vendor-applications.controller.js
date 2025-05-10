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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminVendorApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
class AdminGuard {
}
const vendor_entity_1 = require("../entities/vendor.entity");
const application_review_service_1 = require("../application-review.service");
const document_verification_service_1 = require("../document-verification.service");
const vendor_creation_updated_service_1 = require("../vendor-creation-updated.service");
let AdminVendorApplicationsController = class AdminVendorApplicationsController {
    constructor(_applicationReviewService, _vendorCreationService, _documentVerificationService) {
        this._applicationReviewService = _applicationReviewService;
        this._vendorCreationService = _vendorCreationService;
        this._documentVerificationService = _documentVerificationService;
    }
    async getApplications(status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC') {
        return [];
    }
    async getApplication(id) {
        try {
            const application = await this._applicationReviewService.getApplicationById(id);
            const documents = await this._documentVerificationService.getDocumentsByApplication(id);
            return {
                ...application,
                documents,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Error retrieving application: ${errorMessage}`);
        }
    }
    async startReview(id, req) {
        const adminId = req.user.id;
        return this._applicationReviewService.startApplicationReview(id, adminId);
    }
    async updateApplicationStatus(id, reviewData, req) {
        const adminId = req.user.id;
        const updatedApplication = await this._applicationReviewService.updateApplicationStatus(id, reviewData.status, {
            adminId,
            notes: reviewData.adminNotes,
            reason: reviewData.rejectionReason,
        });
        if (reviewData.status === vendor_entity_1.VendorStatus.APPROVED) {
            try {
                await this._vendorCreationService.createVendorFromApplication(id);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Error creating vendor from application: ${errorMessage}`);
            }
        }
        return updatedApplication;
    }
    async reviewDocument(id, reviewData, req) {
        const adminId = req.user.id;
        return this._documentVerificationService.verifyDocument(id, reviewData.status, {
            adminId,
            notes: reviewData.notes,
            rejectionReason: reviewData.rejectionReason,
        });
    }
    async getApplicationHistory(id) {
        return this._applicationReviewService.getApplicationHistory(id);
    }
};
exports.AdminVendorApplicationsController = AdminVendorApplicationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get applications list with filtering and pagination',
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "getApplication", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Start application review process' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "startReview", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update application status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Patch)('documents/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Review document' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "reviewDocument", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application status history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminVendorApplicationsController.prototype, "getApplicationHistory", null);
exports.AdminVendorApplicationsController = AdminVendorApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Vendor Applications'),
    (0, common_1.Controller)('admin/vendor-applications'),
    (0, common_1.UseGuards)(AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [application_review_service_1.ApplicationReviewService,
        vendor_creation_updated_service_1.VendorCreationService,
        document_verification_service_1.DocumentVerificationService])
], AdminVendorApplicationsController);
//# sourceMappingURL=admin-vendor-applications.controller.js.map