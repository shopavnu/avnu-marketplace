import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductsService } from './products.service';
import { ProductService, CategoryService } from './services';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';
import { ImageValidationService } from './services/image-validation.service';
import { ImageProcessingService } from './services/image-processing.service';
import { DataNormalizationService } from './services/data-normalization.service';
import { BulkImportService } from './services/bulk-import.service';
import { BulkImportController } from './controllers/bulk-import.controller';
import { BatchSectionsService } from './services/batch-sections.service';
import { BatchSectionsController } from './controllers/batch-sections.controller';
import { ProgressiveLoadingService } from './services/progressive-loading.service';
import { ProgressiveLoadingController } from './controllers/progressive-loading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), EventEmitterModule.forRoot()],
  controllers: [
    ProductsController,
    BulkImportController,
    BatchSectionsController,
    ProgressiveLoadingController,
  ],
  providers: [
    ProductsService,
    ProductService,
    CategoryService,
    ProductsResolver,
    ImageValidationService,
    ImageProcessingService,
    DataNormalizationService,
    BulkImportService,
    BatchSectionsService,
    ProgressiveLoadingService,
  ],
  exports: [
    ProductsService,
    ProductService,
    CategoryService,
    ImageValidationService,
    ImageProcessingService,
    DataNormalizationService,
    BulkImportService,
    BatchSectionsService,
    ProgressiveLoadingService,
  ],
})
export class ProductsModule {}
