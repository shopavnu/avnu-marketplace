"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const products_service_1 = require("./products.service");
const product_query_optimizer_service_1 = require("./services/product-query-optimizer.service");
const services_1 = require("./services");
const products_controller_1 = require("./products.controller");
const products_resolver_1 = require("./products.resolver");
const product_entity_1 = require("./entities/product.entity");
const merchant_entity_1 = require("../merchants/entities/merchant.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const image_validation_service_1 = require("./services/image-validation.service");
const image_processing_service_1 = require("./services/image-processing.service");
const data_normalization_service_1 = require("./services/data-normalization.service");
const bulk_import_service_1 = require("./services/bulk-import.service");
const bulk_import_controller_1 = require("./controllers/bulk-import.controller");
const batch_sections_service_1 = require("./services/batch-sections.service");
const batch_sections_controller_1 = require("./controllers/batch-sections.controller");
const progressive_loading_service_1 = require("./services/progressive-loading.service");
const progressive_loading_controller_1 = require("./controllers/progressive-loading.controller");
const product_validation_service_1 = require("./services/product-validation.service");
const product_validation_task_1 = require("./tasks/product-validation.task");
const merchant_products_controller_1 = require("./controllers/merchant-products.controller");
const notifications_module_1 = require("../notifications/notifications.module");
const product_suppression_analytics_service_1 = require("./services/product-suppression-analytics.service");
const product_suppression_analytics_resolver_1 = require("./resolvers/product-suppression-analytics.resolver");
const product_cache_service_1 = require("./services/product-cache.service");
const cached_products_service_1 = require("./services/cached-products.service");
const cache_warming_service_1 = require("./services/cache-warming.service");
const product_cache_controller_1 = require("./controllers/product-cache.controller");
const cached_products_resolver_1 = require("./resolvers/cached-products.resolver");
const cache_performance_monitor_service_1 = require("./services/cache-performance-monitor.service");
const cache_performance_resolver_1 = require("./resolvers/cache-performance.resolver");
const query_cache_warmup_task_1 = require("./tasks/query-cache-warmup.task");
const query_analytics_service_1 = require("./services/query-analytics.service");
const pagination_cache_service_1 = require("./services/pagination-cache.service");
const query_analytics_resolver_1 = require("./resolvers/query-analytics.resolver");
const accessibility_service_1 = require("./services/accessibility.service");
const accessibility_resolver_1 = require("./resolvers/accessibility.resolver");
const accessibility_controller_1 = require("./controllers/accessibility.controller");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, merchant_entity_1.Merchant, category_entity_1.Category]),
            event_emitter_1.EventEmitterModule.forRoot(),
            notifications_module_1.NotificationsModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [
            products_controller_1.ProductsController,
            bulk_import_controller_1.BulkImportController,
            batch_sections_controller_1.BatchSectionsController,
            progressive_loading_controller_1.ProgressiveLoadingController,
            merchant_products_controller_1.MerchantProductsController,
            product_cache_controller_1.ProductCacheController,
            accessibility_controller_1.AccessibilityController,
        ],
        providers: [
            product_query_optimizer_service_1.ProductQueryOptimizerService,
            query_analytics_service_1.QueryAnalyticsService,
            pagination_cache_service_1.PaginationCacheService,
            query_analytics_resolver_1.QueryAnalyticsResolver,
            products_service_1.ProductsService,
            services_1.ProductService,
            services_1.CategoryService,
            products_resolver_1.ProductsResolver,
            image_validation_service_1.ImageValidationService,
            image_processing_service_1.ImageProcessingService,
            data_normalization_service_1.DataNormalizationService,
            bulk_import_service_1.BulkImportService,
            batch_sections_service_1.BatchSectionsService,
            progressive_loading_service_1.ProgressiveLoadingService,
            product_validation_service_1.ProductValidationService,
            product_validation_task_1.ProductValidationTask,
            product_suppression_analytics_service_1.ProductSuppressionAnalyticsService,
            product_suppression_analytics_resolver_1.ProductSuppressionAnalyticsResolver,
            product_cache_service_1.ProductCacheService,
            cached_products_service_1.CachedProductsService,
            cache_warming_service_1.CacheWarmingService,
            cached_products_resolver_1.CachedProductsResolver,
            cache_performance_monitor_service_1.CachePerformanceMonitorService,
            cache_performance_resolver_1.CachePerformanceResolver,
            query_cache_warmup_task_1.QueryCacheWarmupTask,
            accessibility_service_1.AccessibilityService,
            accessibility_resolver_1.AccessibilityResolver,
        ],
        exports: [
            products_service_1.ProductsService,
            services_1.ProductService,
            services_1.CategoryService,
            image_validation_service_1.ImageValidationService,
            image_processing_service_1.ImageProcessingService,
            data_normalization_service_1.DataNormalizationService,
            bulk_import_service_1.BulkImportService,
            batch_sections_service_1.BatchSectionsService,
            progressive_loading_service_1.ProgressiveLoadingService,
            product_validation_service_1.ProductValidationService,
            product_suppression_analytics_service_1.ProductSuppressionAnalyticsService,
            product_cache_service_1.ProductCacheService,
            cached_products_service_1.CachedProductsService,
            cache_warming_service_1.CacheWarmingService,
            product_query_optimizer_service_1.ProductQueryOptimizerService,
            query_analytics_service_1.QueryAnalyticsService,
            pagination_cache_service_1.PaginationCacheService,
            cached_products_resolver_1.CachedProductsResolver,
            cache_performance_monitor_service_1.CachePerformanceMonitorService,
            cache_performance_resolver_1.CachePerformanceResolver,
            query_cache_warmup_task_1.QueryCacheWarmupTask,
            accessibility_service_1.AccessibilityService,
        ],
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map