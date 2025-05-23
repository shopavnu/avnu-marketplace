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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const document_upload_updated_service_1 = require("../document-upload-updated.service");
const document_verification_service_1 = require("../document-verification.service");
let VendorDocumentsController = class VendorDocumentsController {
    constructor(_documentUploadService, _documentVerificationService) {
        this._documentUploadService = _documentUploadService;
        this._documentVerificationService = _documentVerificationService;
    }
    async uploadDocument(file, body, _req) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        try {
            return await this._documentUploadService.uploadDocument(file, body.documentType, body.applicationId, body.documentName);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDocument(id) {
        try {
            const document = await this._documentUploadService.getDocument(id);
            if (!document) {
                throw new common_1.NotFoundException(`Document with ID ${id} not found`);
            }
            return document;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error retrieving document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async downloadDocumentFile(id, res) {
        try {
            const { buffer, filename, mimetype } = await this._documentUploadService.getDocumentFile(id);
            if (!buffer) {
                throw new common_1.NotFoundException(`Document with ID ${id} not found or has no file`);
            }
            res.set({
                'Content-Type': mimetype,
                'Content-Disposition': `attachment; filename="${filename}"`,
            });
            res.send(buffer);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Document download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async verifyDocument(id, body, _req) {
        const adminId = _req.user.id;
        try {
            return await this._documentVerificationService.verifyDocument(id, body.status, {
                adminId,
                notes: body.notes,
                rejectionReason: body.rejectionReason,
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async runAutoVerification(id) {
        try {
            return await this._documentVerificationService.runAutoVerification(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Automated verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteDocument(id) {
        try {
            await this._documentUploadService.deleteDocumentFile(id);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Document deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDocumentsByApplication(applicationId) {
        try {
            return await this._documentVerificationService.getDocumentsByApplication(applicationId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error retrieving documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.VendorDocumentsController = VendorDocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload vendor document' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof common_1.UploadedFile !== "undefined" && common_1.UploadedFile) === "function" ? _a : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get document metadata' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Download document file' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "downloadDocumentFile", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Verify document (admin only)' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Post)(':id/auto-verify'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Run automated document verification (admin only)' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "runAutoVerification", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete document (admin only)' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)('application/:applicationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents for an application' }),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDocumentsController.prototype, "getDocumentsByApplication", null);
exports.VendorDocumentsController = VendorDocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Documents'),
    (0, common_1.Controller)('vendor-documents'),
    __metadata("design:paramtypes", [document_upload_updated_service_1.DocumentUploadService,
        document_verification_service_1.DocumentVerificationService])
], VendorDocumentsController);
//# sourceMappingURL=vendor-documents.controller.js.map