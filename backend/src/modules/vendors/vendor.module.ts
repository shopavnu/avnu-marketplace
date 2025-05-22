import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VendorAddress } from './entities/vendor-address.entity';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorBankingDetails } from './entities/vendor-banking-details.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { Vendor } from './entities/vendor.entity';

import { TransactionService } from '../../common/transaction/transaction.service';
import { VendorConfigService } from '../../config/vendor-config.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';

import { ApplicationReviewService } from './application-review.service';
import { AdminVendorApplicationsController } from './controllers/admin-vendor-applications.controller';
import { VendorApplicationStatusController } from './controllers/vendor-application-status.controller';
import { VendorDocumentsController } from './controllers/vendor-documents.controller';
import { VendorRegistrationController } from './controllers/vendor-registration.controller';
import { DocumentUploadService } from './document-upload-updated.service';
import { DocumentVerificationService } from './document-verification.service';
import { VendorCreationService } from './vendor-creation-updated.service';
import { VendorNotificationService } from './vendor-notification.service';
import { VendorRegistrationService } from './vendor-registration.service';

/**
 * Module for vendor-related functionality
 * Now including centralized configuration service
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      VendorApplication,
      VendorDocument,
      VendorBankingDetails,
      VendorAddress,
    ]),
    EventEmitterModule.forRoot(), // Configure event emitter
    ConfigModule, // Make sure config module is imported
  ],
  controllers: [
    VendorRegistrationController,
    VendorApplicationStatusController,
    AdminVendorApplicationsController,
    VendorDocumentsController,
  ],
  providers: [
    // Common services
    TransactionService,
    VendorEventBus,
    VendorConfigService, // Added centralized config service

    // Feature-specific services
    VendorRegistrationService,
    ApplicationReviewService,
    DocumentVerificationService,
    VendorCreationService,
    VendorNotificationService,
    DocumentUploadService,
  ],
  exports: [
    // Export services that may be needed in other modules
    VendorRegistrationService,
    ApplicationReviewService,
    DocumentVerificationService,
    VendorCreationService,
    VendorConfigService, // Export the config service for use in other modules
  ],
})
export class VendorModule {}
