import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for vendor-specific configuration
 */
@Injectable()
export class VendorConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the upload directory for vendor documents
   */
  getDocumentUploadDir(): string {
    return this.configService.get<string>('VENDOR_DOCUMENT_UPLOAD_DIR', './uploads/vendor-documents');
  }

  /**
   * Get the allowed document types for upload
   */
  getAllowedDocumentTypes(): string[] {
    return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  }

  /**
   * Get maximum file size in bytes
   */
  getMaxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB default
  }
}
