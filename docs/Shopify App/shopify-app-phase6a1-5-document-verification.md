# Phase 6A-1.5: Multi-vendor Marketplace - Document Verification System

## Objectives

- Create a system for secure document uploads and storage
- Implement verification workflows for vendor documents
- Build admin tools for document review and approval

## Timeline: Week 30-31

## Tasks & Implementation Details

### 1. Document Upload Service

Create a service for secure document uploads:

```typescript
// src/modules/vendors/services/document-upload.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorDocument, DocumentType, DocumentStatus } from '../entities/vendor-document.entity';
import { ConfigService } from '@nestjs/config';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentUploadService {
  private readonly logger = new Logger(DocumentUploadService.name);
  private readonly uploadDir: string;
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    @InjectRepository(VendorDocument)
    private readonly documentRepository: Repository<VendorDocument>,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('DOCUMENT_UPLOAD_DIR') || '/tmp/vendor-docs';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload a document file
   */
  async uploadDocument(
    file: Express.Multer.File,
    documentType: DocumentType,
    applicationId: string,
    documentName: string,
  ): Promise<VendorDocument> {
    // Validate file
    this.validateFile(file);
    
    // Generate secure filename
    const secureFilename = this.generateSecureFilename(file.originalname);
    
    // Create target directory for this application
    const targetDir = join(this.uploadDir, applicationId);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Set file path
    const filePath = join(targetDir, secureFilename);
    
    // Save file
    await this.saveFile(file.buffer, filePath);
    
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
    document.checksum = this.calculateChecksum(file.buffer);
    
    // Save document record
    return this.documentRepository.save(document);
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: Express.Multer.File): void {
    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }
  }

  /**
   * Generate a secure filename to prevent path traversal attacks
   */
  private generateSecureFilename(originalFilename: string): string {
    const fileExtension = path.extname(originalFilename);
    return `${uuidv4()}${fileExtension}`;
  }

  /**
   * Save file to disk
   */
  private async saveFile(buffer: Buffer, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      
      writeStream.on('finish', () => {
        resolve();
      });
      
      writeStream.on('error', (error) => {
        this.logger.error(`Error saving file: ${error.message}`);
        reject(new Error(`Failed to save file: ${error.message}`));
      });
      
      writeStream.write(buffer);
      writeStream.end();
    });
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<VendorDocument> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId }
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
    const fileChecksum = this.calculateChecksum(buffer);
    if (fileChecksum !== document.checksum) {
      this.logger.error(`File integrity check failed for document ${documentId}`);
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
    document.filePath = null;
    await this.documentRepository.save(document);
    
    return true;
  }
}
```

### 2. Document Verification Service

Create a service for verifying vendor documents:

```typescript
// src/modules/vendors/services/document-verification.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorDocument, DocumentStatus, DocumentType } from '../entities/vendor-document.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface VerificationResult {
  isVerified: boolean;
  status: DocumentStatus;
  notes?: string;
  rejectionReason?: string;
}

@Injectable()
export class DocumentVerificationService {
  private readonly logger = new Logger(DocumentVerificationService.name);

  constructor(
    @InjectRepository(VendorDocument)
    private readonly documentRepository: Repository<VendorDocument>,
    private readonly eventEmitter: EventEmitter2,
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
    }
  ): Promise<VendorDocument> {
    // Get document
    const document = await this.documentRepository.findOne({
      where: { id: documentId }
    });

    if (!document) {
      throw new BadRequestException(`Document with ID ${documentId} not found`);
    }

    // Update document status
    document.status = status;
    document.verifiedBy = data.adminId;
    document.verifiedAt = new Date();
    document.notes = data.notes;
    document.rejectionReason = data.rejectionReason;

    // Save updated document
    const updatedDocument = await this.documentRepository.save(document);

    // Emit event
    this.eventEmitter.emit('document.status.changed', {
      documentId,
      previousStatus: document.status,
      newStatus: status,
      adminId: data.adminId,
      timestamp: new Date(),
    });

    return updatedDocument;
  }

  /**
   * Get all documents for a vendor/application
   */
  async getDocumentsByApplication(applicationId: string): Promise<VendorDocument[]> {
    return this.documentRepository.find({
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
    const document = await this.documentRepository.findOne({
      where: { id: documentId }
    });

    if (!document) {
      throw new BadRequestException(`Document with ID ${documentId} not found`);
    }

    let result: VerificationResult = {
      isVerified: false,
      status: DocumentStatus.PENDING,
    };

    // Simple file extension and type validation
    if (this.isValidFileType(document)) {
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
    document.notes = result.notes;
    document.rejectionReason = result.rejectionReason;
    document.autoVerifiedAt = new Date();

    await this.documentRepository.save(document);

    return result;
  }

  /**
   * Check if the document is a valid file type
   */
  private isValidFileType(document: VendorDocument): boolean {
    // Verify by MIME type
    const validMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    return validMimeTypes.includes(document.mimeType);
  }
}
```

### 3. Document Controller

Create a controller for document uploads and management:

```typescript
// src/modules/vendors/controllers/vendor-documents.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { DocumentUploadService } from '../services/document-upload.service';
import { DocumentVerificationService } from '../services/document-verification.service';
import { DocumentType, DocumentStatus } from '../entities/vendor-document.entity';

@Controller('vendor-documents')
export class VendorDocumentsController {
  constructor(
    private readonly documentUploadService: DocumentUploadService,
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

  /**
   * Upload a document
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      documentType: DocumentType;
      applicationId: string;
      documentName: string;
    },
    @Request() req,
  ) {
    return this.documentUploadService.uploadDocument(
      file,
      body.documentType,
      body.applicationId,
      body.documentName,
    );
  }

  /**
   * Get document by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDocument(@Param('id') id: string) {
    return this.documentUploadService.getDocument(id);
  }

  /**
   * Download document file
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimetype } = await this.documentUploadService.getDocumentFile(id);
    
    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    res.send(buffer);
  }

  /**
   * Verify a document (admin only)
   */
  @Patch(':id/verify')
  @UseGuards(AdminGuard)
  async verifyDocument(
    @Param('id') id: string,
    @Body() body: {
      status: DocumentStatus;
      notes?: string;
      rejectionReason?: string;
    },
    @Request() req,
  ) {
    const adminId = req.user.id;
    
    return this.documentVerificationService.verifyDocument(id, body.status, {
      adminId,
      notes: body.notes,
      rejectionReason: body.rejectionReason,
    });
  }

  /**
   * Delete a document (admin only)
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteDocument(@Param('id') id: string) {
    return this.documentUploadService.deleteDocumentFile(id);
  }

  /**
   * Get all documents for an application
   */
  @Get('application/:applicationId')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByApplication(@Param('applicationId') applicationId: string) {
    return this.documentVerificationService.getDocumentsByApplication(applicationId);
  }
}
```

### 4. Document Upload Component

Create a React component for document uploads:

```tsx
// src/client/components/vendors/DocumentUpload.tsx

import React, { useState } from 'react';
import { Upload, Button, Form, Input, Select, message, Card, Space } from 'antd';
import { UploadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { apiClient } from '../../services/api-client';

const { Option } = Select;

interface DocumentUploadProps {
  applicationId: string;
  onSuccess?: (document: any) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  applicationId, 
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleBeforeUpload = (file: RcFile) => {
    // Check file type
    const isValidType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    
    if (!isValidType) {
      message.error('You can only upload PDF, JPG, or PNG files!');
      return Upload.LIST_IGNORE;
    }
    
    // Check file size (5MB limit)
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    
    if (!isLessThan5MB) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleChange = (info: UploadChangeParam) => {
    setFileList(info.fileList.slice(-1)); // Only keep the latest file
  };

  const handleUpload = async (values: any) => {
    const { documentType, documentName } = values;
    
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0].originFileObj as RcFile);
    formData.append('documentType', documentType);
    formData.append('applicationId', applicationId);
    formData.append('documentName', documentName);
    
    setUploading(true);
    
    try {
      const response = await apiClient.post('/vendor-documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFileList([]);
      form.resetFields();
      message.success('Document uploaded successfully');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleBeforeUpload,
    onChange: handleChange,
    fileList,
    maxCount: 1,
    customRequest: ({ onSuccess }) => {
      // Prevent auto upload
      setTimeout(() => {
        onSuccess && onSuccess('ok');
      }, 0);
    },
  };

  return (
    <Card title="Upload Document" className="document-upload-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpload}
      >
        <Form.Item
          name="documentType"
          label="Document Type"
          rules={[{ required: true, message: 'Please select document type' }]}
        >
          <Select placeholder="Select document type">
            <Option value="BUSINESS_LICENSE">Business License</Option>
            <Option value="IDENTITY_DOCUMENT">Identity Document</Option>
            <Option value="TAX_CERTIFICATE">Tax Certificate</Option>
            <Option value="BANK_STATEMENT">Bank Statement</Option>
            <Option value="OTHER">Other Document</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="documentName"
          label="Document Name"
          rules={[{ required: true, message: 'Please enter document name' }]}
        >
          <Input placeholder="Enter document name" />
        </Form.Item>
        
        <Form.Item label="Upload File">
          <Upload
            {...uploadProps}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <div className="upload-hint" style={{ marginTop: 8 }}>
            <small>
              Supported formats: PDF, JPG, PNG (max 5MB)
            </small>
          </div>
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploading}
            disabled={fileList.length === 0}
          >
            Upload Document
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
```

### 5. Document List Component

Create a React component for displaying uploaded documents:

```tsx
// src/client/components/vendors/DocumentList.tsx

import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Typography, Space, Spin, Empty, Modal, message } from 'antd';
import { 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  DownloadOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { apiClient } from '../../services/api-client';

const { Text, Title } = Typography;

interface DocumentListProps {
  applicationId: string;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  applicationId, 
  isAdmin = false,
  onRefresh
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/vendor-documents/application/${applicationId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [applicationId]);

  const handleDownload = (documentId: string) => {
    window.open(`/api/vendor-documents/${documentId}/download`, '_blank');
  };

  const handleVerify = async (documentId: string, approved: boolean) => {
    try {
      await apiClient.patch(`/vendor-documents/${documentId}/verify`, {
        status: approved ? 'VERIFIED' : 'REJECTED',
        notes: approved ? 'Document verified by admin' : '',
        rejectionReason: approved ? '' : 'Document rejected by admin',
      });
      
      message.success(`Document ${approved ? 'verified' : 'rejected'} successfully`);
      fetchDocuments();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      message.error('Failed to update document status');
    }
  };

  const showDeleteConfirm = (documentId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this document?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, keep it',
      onOk: async () => {
        try {
          await apiClient.delete(`/vendor-documents/${documentId}`);
          message.success('Document deleted successfully');
          fetchDocuments();
          
          if (onRefresh) {
            onRefresh();
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          message.error('Failed to delete document');
        }
      },
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
    }
    if (mimeType.includes('image')) {
      return <FileImageOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    }
    return <FileOutlined style={{ fontSize: 24 }} />;
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="orange">Pending</Tag>;
      case 'NEEDS_REVIEW':
        return <Tag color="blue">Needs Review</Tag>;
      case 'VERIFIED':
        return <Tag color="green">Verified</Tag>;
      case 'REJECTED':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  if (loading) {
    return <Spin size="large" tip="Loading documents..." />;
  }

  if (documents.length === 0) {
    return (
      <Empty 
        description="No documents uploaded yet" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={documents}
      renderItem={document => (
        <List.Item>
          <Card 
            className="document-card"
            title={
              <Space>
                {getFileIcon(document.mimeType)}
                <Text>{document.name}</Text>
                {getStatusTag(document.status)}
              </Space>
            }
            extra={
              <Button 
                type="link" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(document.id)}
              >
                Download
              </Button>
            }
          >
            <div className="document-info">
              <p><strong>Type:</strong> {document.documentType}</p>
              <p><strong>Uploaded:</strong> {new Date(document.createdAt).toLocaleString()}</p>
              {document.verifiedAt && (
                <p><strong>Verified:</strong> {new Date(document.verifiedAt).toLocaleString()}</p>
              )}
              {document.notes && (
                <p><strong>Notes:</strong> {document.notes}</p>
              )}
              {document.rejectionReason && (
                <p><strong>Rejection Reason:</strong> {document.rejectionReason}</p>
              )}
            </div>
            
            {isAdmin && document.status === 'NEEDS_REVIEW' && (
              <div className="document-actions" style={{ marginTop: 16 }}>
                <Space>
                  <Button 
                    type="primary" 
                    onClick={() => handleVerify(document.id, true)}
                  >
                    Verify
                  </Button>
                  <Button 
                    danger
                    onClick={() => handleVerify(document.id, false)}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => showDeleteConfirm(document.id)}
                  >
                    Delete
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </List.Item>
      )}
    />
  );
};
```

## Dependencies & Prerequisites

- NestJS Upload module for file handling
- Secure file storage system
- React Upload component from Ant Design
- TypeORM for document metadata storage

## Security Considerations

1. **Secure Storage**:
   - All files are stored outside the web root
   - Filenames are randomized to prevent guessing
   - Checksums are verified before serving files

2. **Access Control**:
   - Only authenticated users can upload documents
   - Only admins can verify or delete documents
   - Document ACLs restrict access to owners and admins

3. **Input Validation**:
   - File type and size validation
   - MIME type checking
   - Sanitization of file names and paths

## Testing Guidelines

1. **Upload Testing:**
   - Test file upload with valid and invalid file types
   - Test file size limits
   - Test file integrity verification

2. **Verification Testing:**
   - Test document approval workflow
   - Test document rejection workflow
   - Test notification system for status changes

3. **Access Control Testing:**
   - Test permissions for different user roles
   - Test access controls for document downloading
   - Test security of file storage

## Next Phase

Continue to [Phase 6A-1.6: Vendor Dashboard](./shopify-app-phase6a1-6-vendor-dashboard.md) to implement the vendor management interface.
