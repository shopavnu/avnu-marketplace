import { VendorStatus } from '../entities/vendor.entity';
import { ApplicationReviewService } from '../application-review.service';
import { DocumentVerificationService } from '../document-verification.service';
import { VendorRegistrationService } from '../vendor-registration.service';
interface ApplicationStatusResponse {
  id: string;
  status: VendorStatus;
  submittedAt: Date;
  estimatedReviewTime: string;
}
interface DocumentDetails {
  id: string;
  name: string;
  status: string;
  documentType: string;
  submittedAt: Date;
  rejectionReason?: string;
}
interface ApplicationDetailsResponse {
  id: string;
  status: VendorStatus;
  submittedAt: Date;
  reviewCompletedAt?: Date;
  currentStep: string;
  rejectionReason?: string;
  businessName: string;
  businessEmail: string;
  documents: DocumentDetails[];
  history: unknown[];
  nextSteps: string;
}
interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}
export declare class VendorApplicationStatusController {
  private readonly _vendorRegistrationService;
  private readonly _applicationReviewService;
  private readonly _documentVerificationService;
  constructor(
    _vendorRegistrationService: VendorRegistrationService,
    _applicationReviewService: ApplicationReviewService,
    _documentVerificationService: DocumentVerificationService,
  );
  getApplicationStatus(id: string): Promise<ApplicationStatusResponse>;
  getApplicationDetails(
    id: string,
    req: {
      user: AuthenticatedUser;
    },
  ): Promise<ApplicationDetailsResponse>;
  private _getNextStepsForStatus;
}
export {};
