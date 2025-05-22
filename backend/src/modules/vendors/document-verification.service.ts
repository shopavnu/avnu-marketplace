import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VendorDocument, DocumentStatus } from './entities/vendor-document.entity';
import { VendorEventBus } from '../../events/vendor-event-bus.service';

/**
 * Interface for document verification result
 */
export interface VerificationResult {
  isVerified: boolean;
  status: DocumentStatus;
  notes?: string;
  rejectionReason?: string;
}

/**
 * Service specifically for document verification processes
 */
@Injectable()
export class DocumentVerificationService {
  private readonly _logger = new Logger(DocumentVerificationService.name);

  constructor(
    @InjectRepository(VendorDocument)
    private readonly _documentRepository: Repository<VendorDocument>,
    private readonly _eventBus: VendorEventBus,
  ) {}

  /**
   * Verify a document
   */
  async verifyDocument(
    documentId: string,
    status: DocumentStatus,
    data: {
      adminId: string;
      notes?: string;
      rejectionReason?: string;
    },
  ): Promise<VendorDocument> {
    // Get document
    const document = await this._documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Record previous status for event emission
    const previousStatus = document.status;

    // Update document status
    document.status = status;
    document.verifiedBy = data.adminId;
    document.verifiedAt = new Date();
    document.notes = data.notes || '';
    document.rejectionReason = data.rejectionReason || '';

    // Save updated document
    const _updatedDocument = await this._documentRepository.save(document);

    // Publish event
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

  /**
   * Get all documents for a vendor/application
   */
  async getDocumentsByApplication(applicationId: string): Promise<VendorDocument[]> {
    return this._documentRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if all required documents are verified
   */
  async areAllDocumentsVerified(applicationId: string): Promise<boolean> {
    const documents = await this.getDocumentsByApplication(applicationId);

    // No documents found
    if (documents.length === 0) {
      return false;
    }

    // Check if all documents are verified
    return documents.every(doc => doc.status === DocumentStatus.VERIFIED);
  }

  /**
   * Check if any documents are rejected
   */
  async hasRejectedDocuments(applicationId: string): Promise<boolean> {
    const documents = await this.getDocumentsByApplication(applicationId);

    // Check if any documents are rejected
    return documents.some(doc => doc.status === DocumentStatus.REJECTED);
  }

  /**
   * Run auto-verification rules for documents
   * This could include calling external verification services
   */
  async runAutoVerification(documentId: string): Promise<VerificationResult> {
    const document = await this._documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Record previous status for event emission
    const previousStatus = document.status;
    let result: VerificationResult = {
      isVerified: false,
      status: DocumentStatus.PENDING,
    };

    // Simple file extension and type validation
    if (this._isValidFileType(document)) {
      // For now, just mark as "needs review" for manual verification
      // In a real system, this could call external verification APIs
      result = {
        isVerified: true,
        status: DocumentStatus.NEEDS_REVIEW,
        notes: 'Document passed automated checks and needs manual review',
      };
    } else {
      result = {
        isVerified: false,
        status: DocumentStatus.REJECTED,
        rejectionReason: 'Invalid file type or format',
        notes: 'Document failed automated verification',
      };
    }

    // Update document with verification result
    document.status = result.status;
    document.notes = result.notes || '';
    document.rejectionReason = result.rejectionReason || '';
    document.autoVerifiedAt = new Date();

    const _updatedDocument = await this._documentRepository.save(document);

    // Publish event for document status change
    this._eventBus.publishDocumentStatusChanged({
      documentId,
      applicationId: document.applicationId,
      previousStatus,
      newStatus: result.status,
      adminId: 'system', // Auto-verification is done by the system
      timestamp: new Date(),
      notes: result.notes,
      reason: result.rejectionReason,
    });

    return result;
  }

  /**
   * Check if the document is a valid file type
   */
  private _isValidFileType(document: VendorDocument): boolean {
    // Verify by MIME type
    const validMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    return validMimeTypes.includes(document.mimeType);
  }
}
