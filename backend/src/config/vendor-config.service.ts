import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for centralized vendor configuration
 */
@Injectable()
export class VendorConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get upload directory for vendor documents
   */
  get documentsUploadDir(): string {
    return this.configService.get<string>(
      'VENDOR_DOCUMENTS_UPLOAD_DIR',
      'uploads/vendor-documents',
    );
  }

  /**
   * Get allowed document file types
   */
  get allowedDocumentTypes(): string[] {
    return ['application/pdf', 'image/jpeg', 'image/png'];
  }

  /**
   * Get maximum document file size in bytes
   */
  get maxDocumentSizeBytes(): number {
    return this.configService.get<number>('MAX_DOCUMENT_SIZE_BYTES', 5 * 1024 * 1024); // 5MB default
  }

  /**
   * Get vendor application review timeout in days
   */
  get applicationReviewTimeoutDays(): number {
    return this.configService.get<number>('VENDOR_APPLICATION_REVIEW_TIMEOUT_DAYS', 7);
  }

  /**
   * Get default commission rate for new vendors (as decimal)
   */
  get defaultCommissionRate(): number {
    return this.configService.get<number>('DEFAULT_VENDOR_COMMISSION_RATE', 0.15); // Default 15%
  }
}
