import { Repository } from 'typeorm';
import { VendorDocument, DocumentStatus } from './entities/vendor-document.entity';
import { VendorEventBus } from '../../events/vendor-event-bus.service';
export interface VerificationResult {
  isVerified: boolean;
  status: DocumentStatus;
  notes?: string;
  rejectionReason?: string;
}
export declare class DocumentVerificationService {
  private readonly _documentRepository;
  private readonly _eventBus;
  private readonly _logger;
  constructor(_documentRepository: Repository<VendorDocument>, _eventBus: VendorEventBus);
  verifyDocument(
    documentId: string,
    status: DocumentStatus,
    data: {
      adminId: string;
      notes?: string;
      rejectionReason?: string;
    },
  ): Promise<VendorDocument>;
  getDocumentsByApplication(applicationId: string): Promise<VendorDocument[]>;
  areAllDocumentsVerified(applicationId: string): Promise<boolean>;
  hasRejectedDocuments(applicationId: string): Promise<boolean>;
  runAutoVerification(documentId: string): Promise<VerificationResult>;
  private _isValidFileType;
}
