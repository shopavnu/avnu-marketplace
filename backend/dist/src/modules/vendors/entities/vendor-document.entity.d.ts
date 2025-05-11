export declare enum DocumentType {
  BUSINESS_LICENSE = 'business_license',
  IDENTITY_DOCUMENT = 'identity_document',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  OTHER = 'other',
}
export declare enum DocumentStatus {
  PENDING = 'pending',
  NEEDS_REVIEW = 'needs_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}
export declare class VendorDocument {
  id: string;
  vendorId: string;
  vendor: any;
  documentType: DocumentType;
  status: DocumentStatus;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  originalFilename: string;
  checksum: string;
  verifiedBy: string;
  verifiedAt: Date;
  autoVerifiedAt: Date;
  notes: string;
  rejectionReason: string;
  applicationId: string;
  application: any;
  createdAt: Date;
  updatedAt: Date;
}
