"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUploadService = void 0;
const crypto = __importStar(require("crypto"));
const fs_1 = require("fs");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const path = __importStar(require("path"));
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const vendor_document_entity_1 = require("./entities/vendor-document.entity");
const vendor_config_service_1 = require("../../config/vendor-config.service");
let DocumentUploadService = DocumentUploadService_1 = class DocumentUploadService {
    constructor(_documentRepository, _configService) {
        this._documentRepository = _documentRepository;
        this._configService = _configService;
        this._logger = new common_1.Logger(DocumentUploadService_1.name);
        this._uploadDir = this._configService.documentsUploadDir;
        if (!fs.existsSync(this._uploadDir)) {
            fs.mkdirSync(this._uploadDir, { recursive: true });
        }
    }
    async uploadDocument(file, documentType, applicationId, documentName) {
        this._validateFile(file);
        const secureFilename = this._generateSecureFilename(file.originalname);
        const targetDir = (0, path_1.join)(this._uploadDir, applicationId);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const filePath = (0, path_1.join)(targetDir, secureFilename);
        await this._saveFile(file.buffer, filePath);
        const document = new vendor_document_entity_1.VendorDocument();
        document.name = documentName;
        document.documentType = documentType;
        document.filePath = filePath;
        document.fileSize = file.size;
        document.mimeType = file.mimetype;
        document.originalFilename = file.originalname;
        document.status = vendor_document_entity_1.DocumentStatus.PENDING;
        document.applicationId = applicationId;
        document.checksum = this._calculateChecksum(file.buffer);
        return this._documentRepository.save(document);
    }
    _validateFile(file) {
        const allowedMimeTypes = this._configService.allowedDocumentTypes;
        const maxFileSize = this._configService.maxDocumentSizeBytes;
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
        }
        if (file.size > maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB`);
        }
    }
    _generateSecureFilename(originalFilename) {
        const fileExtension = path.extname(originalFilename);
        return `${(0, uuid_1.v4)()}${fileExtension}`;
    }
    async _saveFile(buffer, filePath) {
        return new Promise((resolve, reject) => {
            const writeStream = (0, fs_1.createWriteStream)(filePath);
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
    _calculateChecksum(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    async getDocument(documentId) {
        const document = await this._documentRepository.findOne({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.BadRequestException(`Document with ID ${documentId} not found`);
        }
        return document;
    }
    async getDocumentFile(documentId) {
        const document = await this.getDocument(documentId);
        if (!fs.existsSync(document.filePath)) {
            throw new common_1.BadRequestException('Document file not found');
        }
        const buffer = fs.readFileSync(document.filePath);
        const fileChecksum = this._calculateChecksum(buffer);
        if (fileChecksum !== document.checksum) {
            this._logger.error(`File integrity check failed for document ${documentId}`);
            throw new common_1.BadRequestException('File integrity check failed');
        }
        return {
            buffer,
            filename: document.originalFilename,
            mimetype: document.mimeType,
        };
    }
    async deleteDocumentFile(documentId) {
        const document = await this.getDocument(documentId);
        if (!fs.existsSync(document.filePath)) {
            return true;
        }
        fs.unlinkSync(document.filePath);
        document.filePath = '';
        await this._documentRepository.save(document);
        return true;
    }
};
exports.DocumentUploadService = DocumentUploadService;
exports.DocumentUploadService = DocumentUploadService = DocumentUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_document_entity_1.VendorDocument)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        vendor_config_service_1.VendorConfigService])
], DocumentUploadService);
//# sourceMappingURL=document-upload-updated.service.js.map