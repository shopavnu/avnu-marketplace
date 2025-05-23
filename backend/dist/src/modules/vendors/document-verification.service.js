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
var DocumentVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentVerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_document_entity_1 = require("./entities/vendor-document.entity");
const vendor_event_bus_service_1 = require("../../events/vendor-event-bus.service");
let DocumentVerificationService = DocumentVerificationService_1 = class DocumentVerificationService {
    constructor(_documentRepository, _eventBus) {
        this._documentRepository = _documentRepository;
        this._eventBus = _eventBus;
        this._logger = new common_1.Logger(DocumentVerificationService_1.name);
    }
    async verifyDocument(documentId, status, data) {
        const document = await this._documentRepository.findOne({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found`);
        }
        const previousStatus = document.status;
        document.status = status;
        document.verifiedBy = data.adminId;
        document.verifiedAt = new Date();
        document.notes = data.notes || '';
        document.rejectionReason = data.rejectionReason || '';
        const _updatedDocument = await this._documentRepository.save(document);
        this._eventBus.publishDocumentStatusChanged({
            documentId,
            applicationId: document.applicationId,
            previousStatus,
            newStatus: status,
            adminId: data.adminId,
            timestamp: new Date(),
            notes: data.notes,
            reason: data.rejectionReason,
        });
        return _updatedDocument;
    }
    async getDocumentsByApplication(applicationId) {
        return this._documentRepository.find({
            where: { applicationId },
            order: { createdAt: 'DESC' },
        });
    }
    async areAllDocumentsVerified(applicationId) {
        const documents = await this.getDocumentsByApplication(applicationId);
        if (documents.length === 0) {
            return false;
        }
        return documents.every(doc => doc.status === vendor_document_entity_1.DocumentStatus.VERIFIED);
    }
    async hasRejectedDocuments(applicationId) {
        const documents = await this.getDocumentsByApplication(applicationId);
        return documents.some(doc => doc.status === vendor_document_entity_1.DocumentStatus.REJECTED);
    }
    async runAutoVerification(documentId) {
        const document = await this._documentRepository.findOne({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found`);
        }
        const previousStatus = document.status;
        let result = {
            isVerified: false,
            status: vendor_document_entity_1.DocumentStatus.PENDING,
        };
        if (this._isValidFileType(document)) {
            result = {
                isVerified: true,
                status: vendor_document_entity_1.DocumentStatus.NEEDS_REVIEW,
                notes: 'Document passed automated checks and needs manual review',
            };
        }
        else {
            result = {
                isVerified: false,
                status: vendor_document_entity_1.DocumentStatus.REJECTED,
                rejectionReason: 'Invalid file type or format',
                notes: 'Document failed automated verification',
            };
        }
        document.status = result.status;
        document.notes = result.notes || '';
        document.rejectionReason = result.rejectionReason || '';
        document.autoVerifiedAt = new Date();
        const _updatedDocument = await this._documentRepository.save(document);
        this._eventBus.publishDocumentStatusChanged({
            documentId,
            applicationId: document.applicationId,
            previousStatus,
            newStatus: result.status,
            adminId: 'system',
            timestamp: new Date(),
            notes: result.notes,
            reason: result.rejectionReason,
        });
        return result;
    }
    _isValidFileType(document) {
        const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        return validMimeTypes.includes(document.mimeType);
    }
};
exports.DocumentVerificationService = DocumentVerificationService;
exports.DocumentVerificationService = DocumentVerificationService = DocumentVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_document_entity_1.VendorDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        vendor_event_bus_service_1.VendorEventBus])
], DocumentVerificationService);
//# sourceMappingURL=document-verification.service.js.map