import { Repository } from 'typeorm';
import { VendorDocument, DocumentType } from './entities/vendor-document.entity';
import { VendorConfigService } from '../../config/vendor-config.service';
export declare class DocumentUploadService {
    private readonly _documentRepository;
    private readonly _configService;
    private readonly _logger;
    private readonly _uploadDir;
    constructor(_documentRepository: Repository<VendorDocument>, _configService: VendorConfigService);
    uploadDocument(file: Express.Multer.File, documentType: DocumentType, applicationId: string, documentName: string): Promise<VendorDocument>;
    private _validateFile;
    private _generateSecureFilename;
    private _saveFile;
    private _calculateChecksum;
    getDocument(documentId: string): Promise<VendorDocument>;
    getDocumentFile(documentId: string): Promise<{
        buffer: Buffer;
        filename: string;
        mimetype: string;
    }>;
    deleteDocumentFile(documentId: string): Promise<boolean>;
}
