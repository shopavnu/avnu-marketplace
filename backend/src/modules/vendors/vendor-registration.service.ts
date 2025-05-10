import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationStep, VendorApplication } from './entities/vendor-application.entity';
import { VendorDocument, DocumentType } from './entities/vendor-document.entity';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';

/**
 * Interface for vendor application submission data
 */
export interface IVendorApplicationDto {
  businessName: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  productCategories: string[];
  productDescription: string;
  estimatedProductCount: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  businessId: string;
  termsAgreement: boolean;
  businessLicensePath?: string;
  identityDocumentPath?: string;
}

/**
 * Interface for sanitized form data
 */
export interface ISanitizedVendorFormData {
  businessName: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  productCategories: string[];
  productDescription: string;
  estimatedProductCount: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  businessId: string;
  [key: string]: unknown; // For any additional fields
}

/**
 * Service responsible for handling vendor registration and application creation
 */
@Injectable()
export class VendorRegistrationService {
  private readonly _logger = new Logger(VendorRegistrationService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly _vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorApplication)
    private readonly _vendorApplicationRepository: Repository<VendorApplication>,
    @InjectRepository(VendorDocument)
    private readonly _vendorDocumentRepository: Repository<VendorDocument>,
    private readonly _transactionService: TransactionService,
    private readonly _eventBus: VendorEventBus,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Create a new vendor application
   */
  async createVendorApplication(
    applicationData: IVendorApplicationDto,
  ): Promise<VendorApplication> {
    // Check if business email is already registered before starting transaction
    const existingVendor = await this._vendorRepository.findOne({
      where: { businessEmail: applicationData.businessEmail },
    });

    if (existingVendor) {
      throw new BadRequestException('A vendor with this email already exists');
    }

    return this._transactionService.executeInTransaction(async queryRunner => {
      // Create a new application
      const application = new VendorApplication();
      application.status = VendorStatus.PENDING;
      application.currentStep = ApplicationStep.COMPLETED;
      application.formData = this._sanitizeFormData(applicationData);
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

      // Publish application created event - notification service will handle emails
      this._eventBus.publishVendorApplicationCreated({
        applicationId: savedApplication.id,
        businessEmail: applicationData.businessEmail,
        businessName: applicationData.businessName,
        timestamp: new Date(),
      });

      return savedApplication;
    });
  }

  /**
   * Get application status by ID
   */
  async getApplicationStatus(applicationId: string): Promise<VendorApplication> {
    const application = await this._vendorApplicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    return application;
  }

  /**
   * Sanitize form data to remove sensitive information
   */
  private _sanitizeFormData(formData: IVendorApplicationDto): ISanitizedVendorFormData {
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
}
