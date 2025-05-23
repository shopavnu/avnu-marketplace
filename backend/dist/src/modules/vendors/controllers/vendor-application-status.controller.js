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
exports.VendorApplicationStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vendor_entity_1 = require("../entities/vendor.entity");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const application_review_service_1 = require("../application-review.service");
const document_verification_service_1 = require("../document-verification.service");
const vendor_registration_service_1 = require("../vendor-registration.service");
let VendorApplicationStatusController = class VendorApplicationStatusController {
    constructor(_vendorRegistrationService, _applicationReviewService, _documentVerificationService) {
        this._vendorRegistrationService = _vendorRegistrationService;
        this._applicationReviewService = _applicationReviewService;
        this._documentVerificationService = _documentVerificationService;
    }
    async getApplicationStatus(id) {
        try {
            const application = await this._vendorRegistrationService.getApplicationStatus(id);
            return {
                id: application.id,
                status: application.status,
                submittedAt: application.submittedAt,
                estimatedReviewTime: '2-3 business days',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Error retrieving application status: ${errorMessage}`);
        }
    }
    async getApplicationDetails(id, req) {
        try {
            const application = await this._applicationReviewService.getApplicationById(id);
            if (application.formData.businessEmail !== req.user.email) {
                throw new common_1.ForbiddenException('You are not authorized to view this application');
            }
            const documents = await this._documentVerificationService.getDocumentsByApplication(id);
            const history = await this._applicationReviewService.getApplicationHistory(id);
            return {
                id: application.id,
                status: application.status,
                submittedAt: application.submittedAt,
                reviewCompletedAt: application.reviewCompletedAt,
                currentStep: application.currentStep,
                rejectionReason: application.rejectionReason,
                businessName: application.formData.businessName,
                businessEmail: application.formData.businessEmail,
                documents: documents.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    status: doc.status,
                    documentType: doc.documentType,
                    submittedAt: doc.createdAt,
                    rejectionReason: doc.rejectionReason,
                })),
                history,
                nextSteps: this._getNextStepsForStatus(application.status),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.BadRequestException(`Error retrieving application details: ${errorMessage}`);
        }
    }
    _getNextStepsForStatus(status) {
        switch (status) {
            case vendor_entity_1.VendorStatus.PENDING:
                return 'Your application is in the queue for review. We typically process applications within 2-3 business days.';
            case vendor_entity_1.VendorStatus.UNDER_REVIEW:
                return 'Your application is currently being reviewed by our team. We may contact you if we need any additional information.';
            case vendor_entity_1.VendorStatus.APPROVED:
                return 'Congratulations! Your application has been approved. You can now log in to your vendor dashboard to start selling.';
            case vendor_entity_1.VendorStatus.REJECTED:
                return 'Unfortunately, your application has not been approved at this time. Please review the feedback provided and consider reapplying after addressing the concerns.';
            case vendor_entity_1.VendorStatus.SUSPENDED:
                return 'Your vendor account has been suspended. Please contact our support team for assistance with resolving this issue.';
            default:
                return 'Check back later for updates on your application status.';
        }
    }
};
exports.VendorApplicationStatusController = VendorApplicationStatusController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get basic application status by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Application ID (acts as a secure token)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorApplicationStatusController.prototype, "getApplicationStatus", null);
__decorate([
    (0, common_1.Get)('/:id/details'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed application status (authenticated)' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorApplicationStatusController.prototype, "getApplicationDetails", null);
exports.VendorApplicationStatusController = VendorApplicationStatusController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Application Status'),
    (0, common_1.Controller)('vendors/applications'),
    __metadata("design:paramtypes", [vendor_registration_service_1.VendorRegistrationService,
        application_review_service_1.ApplicationReviewService,
        document_verification_service_1.DocumentVerificationService])
], VendorApplicationStatusController);
//# sourceMappingURL=vendor-application-status.controller.js.map