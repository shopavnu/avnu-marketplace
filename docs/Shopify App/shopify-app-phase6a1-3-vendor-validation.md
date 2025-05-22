# Phase 6A-1.3: Multi-vendor Marketplace - Vendor Validation Service

## Objectives

- Implement a service for validating vendor applications
- Create business rules for vendor approval
- Develop automated and manual validation workflows

## Timeline: Week 29-30

## Tasks & Implementation Details

### 1. Vendor Registration Service

Create a service for handling vendor registrations:

```typescript
// src/modules/vendors/services/vendor-registration.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Vendor, VendorStatus, BusinessType } from '../entities/vendor.entity';
import { VendorBankingDetails } from '../entities/vendor-banking-details.entity';
import { VendorDocument, DocumentType } from '../entities/vendor-document.entity';
import { VendorApplication, ApplicationStep } from '../entities/vendor-application.entity';
import { VendorAddress, AddressType } from '../entities/vendor-address.entity';
import { EmailService } from '../../common/services/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VendorRegistrationService {
  private readonly logger = new Logger(VendorRegistrationService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorApplication)
    private readonly vendorApplicationRepository: Repository<VendorApplication>,
    @InjectRepository(VendorDocument)
    private readonly vendorDocumentRepository: Repository<VendorDocument>,
    private readonly connection: Connection,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new vendor application
   */
  async createVendorApplication(applicationData: any): Promise<VendorApplication> {
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if business email is already registered
      const existingVendor = await this.vendorRepository.findOne({
        where: { businessEmail: applicationData.businessEmail }
      });

      if (existingVendor) {
        throw new BadRequestException('A vendor with this email already exists');
      }

      // Create a new application
      const application = new VendorApplication();
      application.status = VendorStatus.PENDING;
      application.currentStep = ApplicationStep.COMPLETED;
      application.formData = this.sanitizeFormData(applicationData);
      application.termsAccepted = applicationData.termsAgreement || false;
      application.submittedAt = new Date();

      // Save the application
      const savedApplication = await queryRunner.manager.save(application);

      // Save documents
      if (applicationData.businessLicensePath) {
        const document = new VendorDocument();
        document.name = 'Business License';
        document.documentType = DocumentType.BUSINESS_LICENSE;
        document.filePath = applicationData.businessLicensePath;
        document.application = savedApplication;

        await queryRunner.manager.save(document);
      }

      if (applicationData.identityDocumentPath) {
        const document = new VendorDocument();
        document.name = 'Identity Document';
        document.documentType = DocumentType.IDENTITY_DOCUMENT;
        document.filePath = applicationData.identityDocumentPath;
        document.application = savedApplication;

        await queryRunner.manager.save(document);
      }

      // Send confirmation email
      await this.sendApplicationConfirmationEmail(
        applicationData.businessEmail,
        applicationData.businessName,
        savedApplication.id
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedApplication;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating vendor application: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Get application status by ID
   */
  async getApplicationStatus(applicationId: string): Promise<VendorApplication> {
    const application = await this.vendorApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    return application;
  }

  /**
   * Sanitize form data to remove sensitive information
   */
  private sanitizeFormData(formData: any): any {
    const sanitized = { ...formData };
    
    // Remove sensitive data
    delete sanitized.businessLicensePath;
    delete sanitized.identityDocumentPath;
    
    // Mask account numbers for security
    if (sanitized.accountNumber) {
      const length = sanitized.accountNumber.length;
      sanitized.accountNumber = 'XXXX' + sanitized.accountNumber.substring(length - 4, length);
    }
    
    if (sanitized.routingNumber) {
      const length = sanitized.routingNumber.length;
      sanitized.routingNumber = 'XXXX' + sanitized.routingNumber.substring(length - 4, length);
    }
    
    return sanitized;
  }

  /**
   * Send application confirmation email
   */
  private async sendApplicationConfirmationEmail(
    email: string,
    businessName: string,
    applicationId: string
  ): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('APP_URL');
      const statusUrl = `${appUrl}/vendor/application/${applicationId}`;
      
      await this.emailService.sendEmail({
        to: email,
        subject: 'Vendor Application Received',
        html: `
          <h1>Vendor Application Received</h1>
          <p>Dear ${businessName},</p>
          <p>Thank you for submitting your vendor application to join our marketplace.</p>
          <p>Your application is now under review. Our team will assess your information and documents within 2-3 business days.</p>
          <p>Your application ID is: <strong>${applicationId}</strong></p>
          <p>You can check the status of your application at any time by visiting:</p>
          <p><a href="${statusUrl}">${statusUrl}</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,</p>
          <p>The Marketplace Team</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Error sending confirmation email: ${error.message}`, error.stack);
      // Don't throw; this shouldn't block the application process
    }
  }
}
```

### 2. Vendor Validation Service

Create a service for validating vendor applications:

```typescript
// src/modules/vendors/services/vendor-validation.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { VendorBankingDetails } from '../entities/vendor-banking-details.entity';
import { VendorDocument, DocumentStatus } from '../entities/vendor-document.entity';
import { VendorApplication } from '../entities/vendor-application.entity';
import { VendorAddress, AddressType } from '../entities/vendor-address.entity';
import { EmailService } from '../../common/services/email.service';
import { ConfigService } from '@nestjs/config';

interface ApplicationReviewData {
  status: VendorStatus;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy: string;
}

interface DocumentReviewData {
  status: DocumentStatus;
  notes?: string;
  rejectionReason?: string;
  reviewedBy: string;
}

@Injectable()
export class VendorValidationService {
  private readonly logger = new Logger(VendorValidationService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorApplication)
    private readonly vendorApplicationRepository: Repository<VendorApplication>,
    @InjectRepository(VendorDocument)
    private readonly vendorDocumentRepository: Repository<VendorDocument>,
    @InjectRepository(VendorBankingDetails)
    private readonly vendorBankingDetailsRepository: Repository<VendorBankingDetails>,
    private readonly connection: Connection,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Start the review process for an application
   */
  async startApplicationReview(applicationId: string, adminId: string): Promise<VendorApplication> {
    const application = await this.vendorApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (application.status !== VendorStatus.PENDING) {
      throw new BadRequestException(`Application is already under review or has been processed`);
    }

    // Update application status
    application.status = VendorStatus.UNDER_REVIEW;
    application.reviewStartedAt = new Date();
    application.reviewedBy = adminId;

    return this.vendorApplicationRepository.save(application);
  }

  /**
   * Review and approve/reject an application
   */
  async reviewApplication(applicationId: string, reviewData: ApplicationReviewData): Promise<VendorApplication> {
    // Start transaction
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const application = await this.vendorApplicationRepository.findOne({
        where: { id: applicationId }
      });

      if (!application) {
        throw new NotFoundException(`Application with ID ${applicationId} not found`);
      }

      // Update application with review data
      application.status = reviewData.status;
      application.adminNotes = reviewData.adminNotes;
      application.rejectionReason = reviewData.rejectionReason;
      application.reviewedBy = reviewData.reviewedBy;
      application.reviewCompletedAt = new Date();

      // If approved, create vendor record
      if (reviewData.status === VendorStatus.APPROVED) {
        const vendor = await this.createVendorFromApplication(application, queryRunner);
        application.vendorId = vendor.id;
      }

      // Save application
      const updatedApplication = await queryRunner.manager.save(application);

      // Send notification email
      await this.sendApplicationStatusEmail(application);

      // Commit transaction
      await queryRunner.commitTransaction();

      return updatedApplication;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error reviewing application: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Review a specific document
   */
  async reviewDocument(documentId: string, reviewData: DocumentReviewData): Promise<VendorDocument> {
    const document = await this.vendorDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['vendor'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Update document status
    document.status = reviewData.status;
    document.notes = reviewData.notes;
    document.rejectionReason = reviewData.rejectionReason;
    document.verifiedBy = reviewData.reviewedBy;
    document.verifiedAt = new Date();

    return this.vendorDocumentRepository.save(document);
  }

  /**
   * Create a vendor record from an approved application
   */
  private async createVendorFromApplication(
    application: VendorApplication,
    queryRunner: any
  ): Promise<Vendor> {
    const formData = application.formData;

    // Create vendor
    const vendor = new Vendor();
    vendor.businessName = formData.businessName;
    vendor.businessEmail = formData.businessEmail;
    vendor.phone = formData.phone;
    vendor.businessType = formData.businessType;
    vendor.businessId = formData.businessId;
    vendor.productCategories = formData.productCategories;
    vendor.status = VendorStatus.APPROVED;
    
    // Set default commission rate based on business type
    vendor.commissionRate = this.getDefaultCommissionRate(formData.businessType);

    // Save vendor
    const savedVendor = await queryRunner.manager.save(vendor);

    // Create banking details
    const bankingDetails = new VendorBankingDetails();
    bankingDetails.vendorId = savedVendor.id;
    bankingDetails.bankName = formData.bankName;
    bankingDetails.accountHolderName = formData.accountHolderName;
    bankingDetails.accountNumber = formData.accountNumber;
    bankingDetails.routingNumber = formData.routingNumber;

    await queryRunner.manager.save(bankingDetails);

    // Create business address if provided
    if (formData.addressLine1) {
      const address = new VendorAddress();
      address.vendorId = savedVendor.id;
      address.addressType = AddressType.BUSINESS;
      address.addressLine1 = formData.addressLine1;
      address.addressLine2 = formData.addressLine2;
      address.city = formData.city;
      address.state = formData.state;
      address.postalCode = formData.postalCode;
      address.country = formData.country;
      address.isDefault = true;

      await queryRunner.manager.save(address);
    }

    // Link documents to the vendor
    const documents = await this.vendorDocumentRepository.find({
      where: { application: { id: application.id } }
    });

    for (const document of documents) {
      document.vendorId = savedVendor.id;
      await queryRunner.manager.save(document);
    }

    return savedVendor;
  }

  /**
   * Get default commission rate based on business type
   */
  private getDefaultCommissionRate(businessType: string): number {
    switch (businessType) {
      case 'individual':
        return 15.0;
      case 'llc':
      case 'corporation':
        return 12.5;
      case 'partnership':
        return 13.5;
      default:
        return 15.0;
    }
  }

  /**
   * Send application status email
   */
  private async sendApplicationStatusEmail(application: VendorApplication): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('APP_URL');
      const statusUrl = `${appUrl}/vendor/application/${application.id}`;
      const formData = application.formData;
      
      let subject, content;
      
      if (application.status === VendorStatus.APPROVED) {
        subject = 'Vendor Application Approved';
        content = `
          <h1>Your Vendor Application Has Been Approved!</h1>
          <p>Dear ${formData.businessName},</p>
          <p>Congratulations! Your application to become a vendor on our marketplace has been approved.</p>
          <p>You can now log in to your vendor dashboard to start listing products and managing your store.</p>
          <p><a href="${appUrl}/vendor/login">Login to Vendor Dashboard</a></p>
          <p>We're excited to have you join our marketplace and look forward to a successful partnership.</p>
          <p>Best regards,</p>
          <p>The Marketplace Team</p>
        `;
      } else if (application.status === VendorStatus.REJECTED) {
        subject = 'Vendor Application Status Update';
        content = `
          <h1>Vendor Application Status Update</h1>
          <p>Dear ${formData.businessName},</p>
          <p>Thank you for your interest in becoming a vendor on our marketplace.</p>
          <p>After careful review, we are unable to approve your application at this time.</p>
          ${application.rejectionReason ? `<p><strong>Reason:</strong> ${application.rejectionReason}</p>` : ''}
          <p>You may reapply after addressing the issues mentioned above.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,</p>
          <p>The Marketplace Team</p>
        `;
      } else {
        // Status update for other status changes
        subject = 'Vendor Application Status Update';
        content = `
          <h1>Vendor Application Status Update</h1>
          <p>Dear ${formData.businessName},</p>
          <p>The status of your vendor application has been updated to: <strong>${application.status.replace('_', ' ').toUpperCase()}</strong>.</p>
          <p>You can check the details of your application at any time by visiting:</p>
          <p><a href="${statusUrl}">${statusUrl}</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,</p>
          <p>The Marketplace Team</p>
        `;
      }
      
      await this.emailService.sendEmail({
        to: formData.businessEmail,
        subject,
        html: content,
      });
      
      // Mark notification as sent
      application.isNotificationSent = true;
      await this.vendorApplicationRepository.save(application);
    } catch (error) {
      this.logger.error(`Error sending status email: ${error.message}`, error.stack);
      // Don't throw; this shouldn't block the application process
    }
  }
}
```

### 3. Application Controller for Admins

Create a controller for admins to manage vendor applications:

```typescript
// src/modules/vendors/controllers/admin-vendor-applications.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VendorValidationService } from '../services/vendor-validation.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { VendorStatus } from '../entities/vendor.entity';
import { DocumentStatus } from '../entities/vendor-document.entity';

@Controller('admin/vendor-applications')
@UseGuards(AdminGuard)
export class AdminVendorApplicationsController {
  constructor(
    private readonly vendorValidationService: VendorValidationService,
  ) {}

  /**
   * Get all applications with filtering and pagination
   */
  @Get()
  async getApplications(
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    // Implementation would go here
    // This would return a paginated list of applications with filters
    return [];
  }

  /**
   * Get a specific application
   */
  @Get(':id')
  async getApplication(@Param('id') id: string) {
    // Implementation would go here
    // This would return the application details along with associated documents
    return {};
  }

  /**
   * Start application review
   */
  @Post(':id/review')
  async startReview(
    @Param('id') id: string,
    @Request() req,
  ) {
    const adminId = req.user.id;
    return this.vendorValidationService.startApplicationReview(id, adminId);
  }

  /**
   * Approve or reject an application
   */
  @Patch(':id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() reviewData: {
      status: VendorStatus;
      adminNotes?: string;
      rejectionReason?: string;
    },
    @Request() req,
  ) {
    const adminId = req.user.id;
    return this.vendorValidationService.reviewApplication(id, {
      ...reviewData,
      reviewedBy: adminId,
    });
  }

  /**
   * Update document verification status
   */
  @Patch('documents/:id/review')
  async reviewDocument(
    @Param('id') id: string,
    @Body() reviewData: {
      status: DocumentStatus;
      notes?: string;
      rejectionReason?: string;
    },
    @Request() req,
  ) {
    const adminId = req.user.id;
    return this.vendorValidationService.reviewDocument(id, {
      ...reviewData,
      reviewedBy: adminId,
    });
  }
}
```

### 4. Vendor Application Status Controller

Create a controller for vendors to check their application status:

```typescript
// src/modules/vendors/controllers/vendor-application-status.controller.ts

import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VendorRegistrationService } from '../services/vendor-registration.service';
import { VendorApplication } from '../entities/vendor-application.entity';

@Controller('vendors/applications')
export class VendorApplicationStatusController {
  constructor(
    private readonly vendorRegistrationService: VendorRegistrationService,
  ) {}

  /**
   * Get application status without authentication
   * (using application ID as a secret token)
   */
  @Get(':id')
  async getApplicationStatus(@Param('id') id: string) {
    const application = await this.vendorRegistrationService.getApplicationStatus(id);
    
    // Return simplified status information
    return {
      id: application.id,
      status: application.status,
      submittedAt: application.submittedAt,
      estimatedReviewTime: '2-3 business days',
    };
  }

  /**
   * Get detailed application status for authenticated vendors
   */
  @Get('/:id/details')
  @UseGuards(JwtAuthGuard)
  async getApplicationDetails(
    @Param('id') id: string,
    @Request() req,
  ) {
    const application = await this.vendorRegistrationService.getApplicationStatus(id);
    
    // Ensure user is authorized to view this application
    if (application.formData.businessEmail !== req.user.email) {
      throw new ForbiddenException('You are not authorized to view this application');
    }
    
    // Return more detailed information for authenticated users
    return {
      id: application.id,
      status: application.status,
      submittedAt: application.submittedAt,
      reviewCompletedAt: application.reviewCompletedAt,
      currentStep: application.currentStep,
      rejectionReason: application.rejectionReason,
      businessName: application.formData.businessName,
      businessEmail: application.formData.businessEmail,
      nextSteps: this.getNextStepsForStatus(application),
    };
  }

  /**
   * Get guidance on next steps based on application status
   */
  private getNextStepsForStatus(application: VendorApplication): string {
    switch (application.status) {
      case 'pending':
        return 'Your application is in the queue for review. We typically process applications within 2-3 business days.';
      case 'under_review':
        return 'Your application is currently being reviewed by our team. We may contact you if we need any additional information.';
      case 'approved':
        return 'Congratulations! Your application has been approved. You can now log in to your vendor dashboard to start selling.';
      case 'rejected':
        return 'Unfortunately, your application has not been approved at this time. Please review the feedback provided and consider reapplying after addressing the concerns.';
      default:
        return 'Check back later for updates on your application status.';
    }
  }
}
```

### 5. Custom Validators for Vendor Registration

Create custom validators for the registration process:

```typescript
// src/modules/vendors/validators/vendor-registration.validator.ts

import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';

@ValidatorConstraint({ name: 'UniqueBusinessEmail', async: true })
@Injectable()
export class UniqueBusinessEmailValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async validate(email: string, args: ValidationArguments) {
    const vendor = await this.vendorRepository.findOne({
      where: { businessEmail: email }
    });
    return !vendor;
  }

  defaultMessage(args: ValidationArguments) {
    return 'A vendor with this email already exists';
  }
}

@ValidatorConstraint({ name: 'ValidBusinessId', async: true })
@Injectable()
export class ValidBusinessIdValidator implements ValidatorConstraintInterface {
  async validate(businessId: string, args: ValidationArguments) {
    // This could be extended to validate tax IDs or business registration numbers
    // against external APIs or formatting rules
    
    // Simple validation: ensure it's not empty and has minimum length
    return businessId && businessId.length >= 5;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Please provide a valid business ID or tax identification number';
  }
}

@ValidatorConstraint({ name: 'ValidBankingInfo', async: true })
@Injectable()
export class ValidBankingInfoValidator implements ValidatorConstraintInterface {
  async validate(accountNumber: string, args: ValidationArguments) {
    // Simple validation: check format and length
    // This could be extended to include proper bank validation logic
    
    // For US accounts, typically 10-12 digits
    return /^\d{10,17}$/.test(accountNumber);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Please provide a valid bank account number';
  }
}

@ValidatorConstraint({ name: 'ValidRoutingNumber', async: true })
@Injectable()
export class ValidRoutingNumberValidator implements ValidatorConstraintInterface {
  async validate(routingNumber: string, args: ValidationArguments) {
    // For US routing numbers: 9 digits
    if (!/^\d{9}$/.test(routingNumber)) {
      return false;
    }
    
    // Checksum validation for US routing numbers
    let sum = 0;
    for (let i = 0; i < routingNumber.length; i += 3) {
      sum += parseInt(routingNumber[i]) * 3;
      sum += parseInt(routingNumber[i + 1]) * 7;
      sum += parseInt(routingNumber[i + 2]) * 1;
    }
    
    return sum !== 0 && sum % 10 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Please provide a valid bank routing number';
  }
}
```

## Dependencies & Prerequisites

- NestJS validation pipes
- Email service for notifications
- JWT authentication for secure access
- TypeORM for database interactions

## Business Validation Rules

1. **Business Information Validation**:
   - Business email must be unique
   - Business name must not be empty
   - Phone number must be in a valid format
   - Business ID/Tax ID must meet minimum requirements

2. **Banking Information Validation**:
   - Account numbers must be valid format
   - Routing numbers must pass checksum validation
   - Bank name must not be empty

3. **Document Validation**:
   - Documents must be valid file types (PDF, JPG, PNG)
   - Document file size must not exceed 5MB
   - Required documents must be provided

## Testing Guidelines

1. **Service Testing:**
   - Test application creation workflow
   - Test validation of vendor information
   - Test document handling and storage

2. **Email Notification Testing:**
   - Test confirmation emails
   - Test status update emails
   - Test formatting and content of emails

3. **Admin Review Testing:**
   - Test application review process
   - Test document verification workflow
   - Test approval and rejection workflows

## Next Phase

Continue to [Phase 6A-1.4: Application Status Workflow](./shopify-app-phase6a1-4-application-workflow.md) to implement the state machine for application processing.
