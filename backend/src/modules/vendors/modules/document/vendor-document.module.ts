import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import entities
import { VendorApplication } from '../../entities/vendor-application.entity';
import { VendorDocument } from '../../entities/vendor-document.entity';
// Import services
import { VendorConfigService } from '../../../../config/vendor-config.service';
import { VendorEventBus } from '../../../../events/vendor-event-bus.service';
// Import controllers
import { VendorDocumentsController } from '../../controllers/vendor-documents.controller';
import { DocumentUploadService } from '../../document-upload-updated.service';
import { DocumentVerificationService } from '../../document-verification.service';

/**
 * Module dedicated to vendor document management functionality
 */
@Module({
  imports: [TypeOrmModule.forFeature([VendorDocument, VendorApplication])],
  controllers: [VendorDocumentsController],
  providers: [
    DocumentVerificationService,
    DocumentUploadService,
    VendorEventBus,
    VendorConfigService,
  ],
  exports: [DocumentVerificationService, DocumentUploadService],
})
export class VendorDocumentModule {}
