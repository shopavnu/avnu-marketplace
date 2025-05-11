import * as crypto from 'crypto';
import { createWriteStream } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import * as path from 'path';

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { VendorDocument, DocumentType, DocumentStatus } from './entities/vendor-document.entity';
import { VendorConfigService } from '../../config/vendor-config.service';

/**
 * Interface defining the expected structure of uploaded files.
 * This standardizes file properties across different file upload mechanisms (Multer, Express, etc.)
 * Provides better type safety and consistency in file handling throughout the application.
 */
interface UploadedFile {
  buffer: Buffer;         // Raw file content
  originalname: string;   // Original filename from the client
  size: number;           // File size in bytes
  mimetype: string;       // MIME type of the file
}

/**
 * Service for handling document uploads with centralized configuration access
 */
@Injectable()
export class DocumentUploadService {
  private readonly _logger = new Logger(DocumentUploadService.name);
  private readonly _uploadDir: string;

  constructor(
    @InjectRepository(VendorDocument)
    private readonly _documentRepository: Repository<VendorDocument>,
    private readonly _configService: VendorConfigService, // Using the centralized config service
  ) {
    // Get configuration values from the centralized service
    this._uploadDir = this._configService.documentsUploadDir;

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this._uploadDir)) {
      fs.mkdirSync(this._uploadDir, { recursive: true });
    }
  }

  /**
   * Upload a document file
   */
  async uploadDocument(
    file: UploadedFile,
    documentType: DocumentType,
    applicationId: string,
    documentName: string,
  ): Promise<VendorDocument> {
    // Validate file using config service
    this._validateFile(file);

    // Generate secure filename
    const secureFilename = this._generateSecureFilename(file.originalname);

    // Create target directory for this application
    const targetDir = join(this._uploadDir, applicationId);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Set file path
    const filePath = join(targetDir, secureFilename);

    // Save file
    await this._saveFile(file.buffer, filePath);

    // Create document record
    const document = new VendorDocument();
    document.name = documentName;
    document.documentType = documentType;
    document.filePath = filePath;
    document.fileSize = file.size;
    document.mimeType = file.mimetype;
    document.originalFilename = file.originalname;
    document.status = DocumentStatus.PENDING;
    document.applicationId = applicationId;

    // Calculate checksum for integrity verification
    document.checksum = this._calculateChecksum(file.buffer);

    // Save document record
    return this._documentRepository.save(document);
  }

  /**
   * Validate file type and size using centralized configuration
   */
  private _validateFile(file: UploadedFile): void {
    // Get configuration from the config service
    const allowedMimeTypes = this._configService.allowedDocumentTypes;
    const maxFileSize = this._configService.maxDocumentSizeBytes;

    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Check file size
    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Generate a secure filename to prevent path traversal attacks
   */
  private _generateSecureFilename(originalFilename: string): string {
    const fileExtension = path.extname(originalFilename);
    return `${uuidv4()}${fileExtension}`;
  }

  /**
   * Save file to disk
   */
  private async _saveFile(buffer: Buffer, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', error => {
        this._logger.error(`Error saving file: ${error.message}`);
        reject(new Error(`Failed to save file: ${error.message}`));
      });

      writeStream.write(buffer);
      writeStream.end();
    });
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private _calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<VendorDocument> {
    const document = await this._documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new BadRequestException(`Document with ID ${documentId} not found`);
    }

    return document;
  }

  /**
   * Download document file
   */
  async getDocumentFile(documentId: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }> {
    const document = await this.getDocument(documentId);

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      throw new BadRequestException('Document file not found');
    }

    // Read file
    const buffer = fs.readFileSync(document.filePath);

    // Verify checksum to ensure file integrity
    const fileChecksum = this._calculateChecksum(buffer);
    if (fileChecksum !== document.checksum) {
      this._logger.error(`File integrity check failed for document ${documentId}`);
      throw new BadRequestException('File integrity check failed');
    }

    return {
      buffer,
      filename: document.originalFilename,
      mimetype: document.mimeType,
    };
  }

  /**
   * Delete document file
   */
  async deleteDocumentFile(documentId: string): Promise<boolean> {
    const document = await this.getDocument(documentId);

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return true; // File already deleted
    }

    // Delete file
    fs.unlinkSync(document.filePath);

    // Update document record
    document.filePath = ''; // Use empty string instead of null
    await this._documentRepository.save(document);

    return true;
  }
}
