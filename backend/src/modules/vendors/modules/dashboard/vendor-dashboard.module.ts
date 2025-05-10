import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import entities
import { VendorAddress } from '../../entities/vendor-address.entity';
import { VendorBankingDetails } from '../../entities/vendor-banking-details.entity';
import { Vendor } from '../../entities/vendor.entity';
// Import services
import { TransactionService } from '../../../../common/transaction.service';
import { VendorConfigService } from '../../../../config/vendor-config.service';

/**
 * Module dedicated to vendor dashboard functionality
 * Note: This is a placeholder module - in a real implementation,
 * we would include services for:
 * - Vendor profile management
 * - Vendor product management
 * - Vendor order management
 * - Vendor reporting
 */
@Module({
  imports: [TypeOrmModule.forFeature([Vendor, VendorBankingDetails, VendorAddress])],
  controllers: [
    // Dashboard controllers would be implemented here
    // VendorProfileController,
    // VendorProductsController,
    // VendorOrdersController,
    // VendorReportsController,
  ],
  providers: [
    // Dashboard-specific services would be implemented here
    // VendorProfileService,
    // VendorProductService,
    // VendorOrderService,
    // VendorReportService,
    VendorConfigService,
    TransactionService,
  ],
  exports: [
    // Export services that may be needed by other modules
  ],
})
export class VendorDashboardModule {}
