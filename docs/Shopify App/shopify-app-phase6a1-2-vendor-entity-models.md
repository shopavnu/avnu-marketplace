# Phase 6A-1.2: Multi-vendor Marketplace - Vendor Entity Models

## Objectives

- Design database entities for vendor information
- Create relationships between vendors and related data
- Implement status tracking for vendor applications

## Timeline: Week 29

## Tasks & Implementation Details

### 1. Vendor Entity

Create the main vendor entity:

```typescript
// src/modules/vendors/entities/vendor.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { VendorBankingDetails } from './vendor-banking-details.entity';
import { VendorDocument } from './vendor-document.entity';
import { Product } from '../../products/entities/product.entity';

export enum VendorStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum BusinessType {
  INDIVIDUAL = 'individual',
  LLC = 'llc',
  CORPORATION = 'corporation',
  PARTNERSHIP = 'partnership',
  OTHER = 'other',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  businessName: string;

  @Column({ length: 255 })
  @Index({ unique: true })
  businessEmail: string;

  @Column({ length: 50 })
  phone: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.INDIVIDUAL,
  })
  businessType: BusinessType;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: VendorStatus, 
    default: VendorStatus.PENDING 
  })
  status: VendorStatus;

  @Column({ length: 255, nullable: true })
  businessId: string;

  @Column({ type: 'simple-array', nullable: true })
  productCategories: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  commissionRate: number;

  @Column({ default: true })
  canListNewProducts: boolean;

  @Column({ default: 0 })
  productsCount: number;

  @OneToOne(() => VendorBankingDetails, bankingDetails => bankingDetails.vendor, {
    cascade: true,
  })
  bankingDetails: VendorBankingDetails;

  @OneToMany(() => VendorDocument, document => document.vendor, {
    cascade: true,
  })
  documents: VendorDocument[];

  @OneToMany(() => Product, product => product.vendor)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 2. Vendor Banking Details Entity

Create an entity for vendor banking information:

```typescript
// src/modules/vendors/entities/vendor-banking-details.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_banking_details')
export class VendorBankingDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendorId: string;

  @OneToOne(() => Vendor, vendor => vendor.bankingDetails)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ length: 255 })
  bankName: string;

  @Column({ length: 255 })
  accountHolderName: string;

  @Column({ length: 255 })
  accountNumber: string;

  @Column({ length: 50 })
  routingNumber: string;

  @Column({ length: 50, nullable: true })
  accountType: string;

  @Column({ length: 100, nullable: true })
  currency: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. Vendor Document Entity

Create an entity for storing vendor documents:

```typescript
// src/modules/vendors/entities/vendor-document.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

export enum DocumentType {
  BUSINESS_LICENSE = 'business_license',
  IDENTITY_DOCUMENT = 'identity_document',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('vendor_documents')
export class VendorDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor, vendor => vendor.documents)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  filePath: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ length: 50, nullable: true })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 4. Vendor Application Entity

Create an entity for tracking vendor applications:

```typescript
// src/modules/vendors/entities/vendor-application.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor, VendorStatus } from './vendor.entity';

export enum ApplicationStep {
  BUSINESS_INFO = 'business_info',
  PRODUCT_INFO = 'product_info',
  PAYMENT_INFO = 'payment_info',
  VERIFICATION = 'verification',
  COMPLETED = 'completed',
}

@Entity('vendor_applications')
export class VendorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  vendorId: string;

  @OneToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @Column({
    type: 'enum',
    enum: ApplicationStep,
    default: ApplicationStep.BUSINESS_INFO,
  })
  currentStep: ApplicationStep;

  @Column({ type: 'jsonb', default: {} })
  formData: Record<string, any>;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewStartedAt: Date;

  @Column({ nullable: true })
  reviewCompletedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ default: false })
  termsAccepted: boolean;

  @Column({ default: false })
  isNotificationSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 5. Vendor Address Entity

Create an entity for vendor addresses:

```typescript
// src/modules/vendors/entities/vendor-address.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';

export enum AddressType {
  BUSINESS = 'business',
  SHIPPING = 'shipping',
  BILLING = 'billing',
  WAREHOUSE = 'warehouse',
}

@Entity('vendor_addresses')
export class VendorAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.BUSINESS,
  })
  addressType: AddressType;

  @Column({ length: 255 })
  addressLine1: string;

  @Column({ length: 255, nullable: true })
  addressLine2: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 100 })
  country: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ length: 100, nullable: true })
  contactName: string;

  @Column({ length: 50, nullable: true })
  contactPhone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 6. Entity Module Configuration

Update the vendor module to include the entities:

```typescript
// src/modules/vendors/vendors.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorBankingDetails } from './entities/vendor-banking-details.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorAddress } from './entities/vendor-address.entity';
import { VendorRegistrationController } from './controllers/vendor-registration.controller';
import { VendorRegistrationService } from './services/vendor-registration.service';
// Other imports...

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      VendorBankingDetails,
      VendorDocument,
      VendorApplication,
      VendorAddress,
    ]),
  ],
  controllers: [
    VendorRegistrationController,
    // Other controllers...
  ],
  providers: [
    VendorRegistrationService,
    // Other services...
  ],
  exports: [
    VendorRegistrationService,
    // Other services...
  ],
})
export class VendorsModule {}
```

### 7. Database Migrations

Create a database migration to set up the vendor tables:

```typescript
// src/migrations/1620000000000-CreateVendorTables.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVendorTables1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vendors table
    await queryRunner.query(`
      CREATE TYPE "vendor_status_enum" AS ENUM (
        'pending', 
        'under_review', 
        'approved', 
        'rejected', 
        'suspended'
      );
      
      CREATE TYPE "business_type_enum" AS ENUM (
        'individual', 
        'llc', 
        'corporation', 
        'partnership', 
        'other'
      );
      
      CREATE TABLE "vendors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_name" character varying(255) NOT NULL,
        "business_email" character varying(255) NOT NULL,
        "phone" character varying(50) NOT NULL,
        "business_type" "business_type_enum" NOT NULL DEFAULT 'individual',
        "website" character varying(255),
        "description" text,
        "status" "vendor_status_enum" NOT NULL DEFAULT 'pending',
        "business_id" character varying(255),
        "product_categories" text[],
        "is_verified" boolean NOT NULL DEFAULT false,
        "verified_at" TIMESTAMP,
        "verified_by" character varying(255),
        "rejection_reason" text,
        "commission_rate" decimal(10,2) NOT NULL DEFAULT 0,
        "can_list_new_products" boolean NOT NULL DEFAULT true,
        "products_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendors" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_vendors_business_email" UNIQUE ("business_email")
      );
      
      CREATE INDEX "IDX_vendors_status" ON "vendors" ("status");
    `);

    // Create vendor_banking_details table
    await queryRunner.query(`
      CREATE TABLE "vendor_banking_details" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "bank_name" character varying(255) NOT NULL,
        "account_holder_name" character varying(255) NOT NULL,
        "account_number" character varying(255) NOT NULL,
        "routing_number" character varying(50) NOT NULL,
        "account_type" character varying(50),
        "currency" character varying(100),
        "is_verified" boolean NOT NULL DEFAULT false,
        "verified_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_banking_details" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_banking_details_vendor" FOREIGN KEY ("vendor_id") 
          REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_vendor_banking_details_vendor_id" UNIQUE ("vendor_id")
      );
    `);

    // Create document type and status enums
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM (
        'business_license', 
        'identity_document', 
        'tax_certificate', 
        'bank_statement', 
        'other'
      );
      
      CREATE TYPE "document_status_enum" AS ENUM (
        'pending', 
        'verified', 
        'rejected'
      );
    `);

    // Create vendor_documents table
    await queryRunner.query(`
      CREATE TABLE "vendor_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "document_type" "document_type_enum" NOT NULL DEFAULT 'other',
        "name" character varying(255) NOT NULL,
        "file_path" character varying(255) NOT NULL,
        "file_size" integer,
        "mime_type" character varying(50),
        "status" "document_status_enum" NOT NULL DEFAULT 'pending',
        "verified_at" TIMESTAMP,
        "verified_by" character varying(255),
        "rejection_reason" text,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_documents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_documents_vendor" FOREIGN KEY ("vendor_id") 
          REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
      
      CREATE INDEX "IDX_vendor_documents_vendor_id" ON "vendor_documents" ("vendor_id");
      CREATE INDEX "IDX_vendor_documents_status" ON "vendor_documents" ("status");
    `);

    // Create application step enum
    await queryRunner.query(`
      CREATE TYPE "application_step_enum" AS ENUM (
        'business_info', 
        'product_info', 
        'payment_info', 
        'verification', 
        'completed'
      );
    `);

    // Create vendor_applications table
    await queryRunner.query(`
      CREATE TABLE "vendor_applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid,
        "status" "vendor_status_enum" NOT NULL DEFAULT 'pending',
        "current_step" "application_step_enum" NOT NULL DEFAULT 'business_info',
        "form_data" jsonb NOT NULL DEFAULT '{}',
        "submitted_at" TIMESTAMP,
        "review_started_at" TIMESTAMP,
        "review_completed_at" TIMESTAMP,
        "reviewed_by" character varying(255),
        "admin_notes" text,
        "rejection_reason" text,
        "terms_accepted" boolean NOT NULL DEFAULT false,
        "is_notification_sent" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_applications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_applications_vendor" FOREIGN KEY ("vendor_id") 
          REFERENCES "vendors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      );
      
      CREATE INDEX "IDX_vendor_applications_status" ON "vendor_applications" ("status");
    `);

    // Create address type enum
    await queryRunner.query(`
      CREATE TYPE "address_type_enum" AS ENUM (
        'business', 
        'shipping', 
        'billing', 
        'warehouse'
      );
    `);

    // Create vendor_addresses table
    await queryRunner.query(`
      CREATE TABLE "vendor_addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL,
        "address_type" "address_type_enum" NOT NULL DEFAULT 'business',
        "address_line1" character varying(255) NOT NULL,
        "address_line2" character varying(255),
        "city" character varying(100) NOT NULL,
        "state" character varying(100) NOT NULL,
        "postal_code" character varying(20) NOT NULL,
        "country" character varying(100) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "contact_name" character varying(100),
        "contact_phone" character varying(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vendor_addresses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_vendor_addresses_vendor" FOREIGN KEY ("vendor_id") 
          REFERENCES "vendors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
      
      CREATE INDEX "IDX_vendor_addresses_vendor_id" ON "vendor_addresses" ("vendor_id");
      CREATE INDEX "IDX_vendor_addresses_type" ON "vendor_addresses" ("address_type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "vendor_addresses"`);
    await queryRunner.query(`DROP TYPE "address_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "vendor_applications"`);
    await queryRunner.query(`DROP TYPE "application_step_enum"`);
    
    await queryRunner.query(`DROP TABLE "vendor_documents"`);
    await queryRunner.query(`DROP TYPE "document_status_enum"`);
    await queryRunner.query(`DROP TYPE "document_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "vendor_banking_details"`);
    
    await queryRunner.query(`DROP TABLE "vendors"`);
    await queryRunner.query(`DROP TYPE "vendor_status_enum"`);
    await queryRunner.query(`DROP TYPE "business_type_enum"`);
  }
}
```

## Dependencies & Prerequisites

- TypeORM for database interaction
- PostgreSQL database with support for enums and JSON types
- UUID generator for unique identifiers

## Data Relationships

1. **One-to-One Relationships**:
   - Vendor ↔ VendorBankingDetails (A vendor has exactly one banking details record)
   - VendorApplication ↔ Vendor (An application may be linked to a vendor once approved)

2. **One-to-Many Relationships**:
   - Vendor → VendorDocuments (A vendor can have multiple documents)
   - Vendor → VendorAddresses (A vendor can have multiple addresses)
   - Vendor → Products (A vendor can have multiple products)

## Testing Guidelines

1. **Entity Validation Testing:**
   - Test entity constraints (unique email, required fields)
   - Test relationships between entities
   - Test cascade operations

2. **Migration Testing:**
   - Test forward migration to create tables
   - Test rollback migration to drop tables
   - Verify indexes and constraints

3. **Data Integrity Testing:**
   - Test saving and retrieving complex data (arrays, JSON)
   - Test enum value constraints
   - Test relationship integrity across entities

## Next Phase

Continue to [Phase 6A-1.3: Vendor Validation Service](./shopify-app-phase6a1-3-vendor-validation.md) to implement validation and application processing logic.
