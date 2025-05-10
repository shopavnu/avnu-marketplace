import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import entities
import { VendorApplication } from '../../entities/vendor-application.entity';
import { Vendor } from '../../entities/vendor.entity';
// Import services
import { TransactionService } from '../../../../common/transaction.service';
import { VendorConfigService } from '../../../../config/vendor-config.service';
import { VendorEventBus } from '../../../../events/vendor-event-bus.service';
import { ApplicationReviewService } from '../../application-review.service';
// Import controllers
import { AdminVendorApplicationsController } from '../../controllers/admin-vendor-applications.controller';
import { VendorApplicationStatusController } from '../../controllers/vendor-application-status.controller';
import { VendorRegistrationController } from '../../controllers/vendor-registration.controller';
import { VendorCreationService } from '../../vendor-creation-updated.service';
import { VendorRegistrationService } from '../../vendor-registration.service';

/**
 * Module dedicated to vendor application management functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([VendorApplication, Vendor])],
  controllers: [
    VendorRegistrationController,
    VendorApplicationStatusController,
    AdminVendorApplicationsController,
  ],
  providers: [
    ApplicationReviewService,
    VendorRegistrationService,
    VendorCreationService,
    TransactionService,
    VendorEventBus,
    VendorConfigService,
  ],
  exports: [ApplicationReviewService, VendorRegistrationService, VendorCreationService],
})
export class VendorApplicationModule {}
