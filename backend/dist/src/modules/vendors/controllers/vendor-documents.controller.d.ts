import { Response } from 'express';
import { DocumentType, DocumentStatus, VendorDocument } from '../entities/vendor-document.entity';
import { DocumentUploadService } from '../document-upload-updated.service';
import { DocumentVerificationService, VerificationResult } from '../document-verification.service';
export declare class VendorDocumentsController {
    private readonly _documentUploadService;
    private readonly _documentVerificationService;
    constructor(_documentUploadService: DocumentUploadService, _documentVerificationService: DocumentVerificationService);
    uploadDocument(file: Express.Multer.File, body: {
        documentType: DocumentType;
        applicationId: string;
        documentName: string;
    }, _req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<VendorDocument>;
    getDocument(id: string): Promise<VendorDocument>;
    downloadDocumentFile(id: string, res: Response): Promise<void>;
    verifyDocument(id: string, body: {
        status: DocumentStatus;
        notes?: string;
        rejectionReason?: string;
    }, _req: {
        user: {
            id: string;
            email: string;
            roles: string[];
        };
    }): Promise<VendorDocument>;
    runAutoVerification(id: string): Promise<VerificationResult>;
    deleteDocument(id: string): Promise<void>;
    getDocumentsByApplication(applicationId: string): Promise<VendorDocument[]>;
}
