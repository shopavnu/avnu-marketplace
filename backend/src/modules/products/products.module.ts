import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsService } from './products.service';
import { ProductService, CategoryService } from './services';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Category } from '../categories/entities/category.entity';
import { ImageValidationService } from './services/image-validation.service';
import { ImageProcessingService } from './services/image-processing.service';
import { DataNormalizationService } from './services/data-normalization.service';
import { BulkImportService } from './services/bulk-import.service';
import { BulkImportController } from './controllers/bulk-import.controller';
import { BatchSectionsService } from './services/batch-sections.service';
import { BatchSectionsController } from './controllers/batch-sections.controller';
import { ProgressiveLoadingService } from './services/progressive-loading.service';
import { ProgressiveLoadingController } from './controllers/progressive-loading.controller';
import { ProductValidationService } from './services/product-validation.service';
import { ProductValidationTask } from './tasks/product-validation.task';
import { MerchantProductsController } from './controllers/merchant-products.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductSuppressionAnalyticsService } from './services/product-suppression-analytics.service';
import { ProductSuppressionAnalyticsResolver } from './resolvers/product-suppression-analytics.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Merchant, Category]),
    EventEmitterModule.forRoot(),
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ProductsController,
    BulkImportController,
    BatchSectionsController,
    ProgressiveLoadingController,
    MerchantProductsController,
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
    ProductValidationService,
    ProductValidationTask,
    ProductSuppressionAnalyticsService,
    ProductSuppressionAnalyticsResolver,
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
    ProductValidationService,
    ProductSuppressionAnalyticsService,
  ],
})
export class ProductsModule {}
