import { DocumentStatus } from '../entities/vendor-document.entity';
import { VendorStatus } from '../entities/vendor.entity';
import { ApplicationReviewService } from '../application-review.service';
import { DocumentVerificationService } from '../document-verification.service';
import { VendorCreationService } from '../vendor-creation-updated.service';
interface AdminUser {
    id: string;
    email: string;
    role: string;
}
interface ApplicationReviewDto {
    status: VendorStatus;
    adminNotes?: string;
    rejectionReason?: string;
}
interface DocumentReviewDto {
    status: DocumentStatus;
    notes?: string;
    rejectionReason?: string;
}
export declare class AdminVendorApplicationsController {
    private readonly _applicationReviewService;
    private readonly _vendorCreationService;
    private readonly _documentVerificationService;
    constructor(_applicationReviewService: ApplicationReviewService, _vendorCreationService: VendorCreationService, _documentVerificationService: DocumentVerificationService);
    getApplications(status: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<unknown[]>;
    getApplication(id: string): Promise<Record<string, unknown>>;
    startReview(id: string, req: {
        user: AdminUser;
    }): Promise<unknown>;
    updateApplicationStatus(id: string, reviewData: ApplicationReviewDto, req: {
        user: AdminUser;
    }): Promise<unknown>;
    reviewDocument(id: string, reviewData: DocumentReviewDto, req: {
        user: AdminUser;
    }): Promise<unknown>;
    getApplicationHistory(id: string): Promise<unknown[]>;
}
export {};
