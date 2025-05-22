import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum DocumentType {
  BUSINESS_LICENSE = 'business_license',
  IDENTITY_DOCUMENT = 'identity_document',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  NEEDS_REVIEW = 'needs_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('vendor_documents')
export class VendorDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vendorId!: string;

  // Using string-based references to avoid circular dependencies
  @ManyToOne('Vendor', 'documents')
  @JoinColumn({ name: 'vendor_id' })
  vendor: any; // Type will be resolved at runtime

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType!: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  filePath!: string;

  @Column({ nullable: true })
  fileSize!: number;

  @Column({ length: 100 })
  mimeType!: string;

  @Column({ length: 255 })
  originalFilename!: string;

  @Column({ nullable: true })
  checksum!: string;

  @Column({ nullable: true })
  verifiedBy!: string;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @Column({ nullable: true })
  autoVerifiedAt!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  applicationId!: string;

  // Using string-based references to avoid circular dependencies
  @ManyToOne('VendorApplication', 'documents')
  @JoinColumn({ name: 'application_id' })
  application: any; // Type will be resolved at runtime

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
