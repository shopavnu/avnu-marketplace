"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProgressiveLoadingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveLoadingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const progressive_loading_service_1 = require("../services/progressive-loading.service");
const progressive_loading_dto_1 = require("../dto/progressive-loading.dto");
const data_normalization_service_1 = require("../services/data-normalization.service");
let ProgressiveLoadingController = ProgressiveLoadingController_1 = class ProgressiveLoadingController {
    constructor(progressiveLoadingService, dataNormalizationService) {
        this.progressiveLoadingService = progressiveLoadingService;
        this.dataNormalizationService = dataNormalizationService;
        this.logger = new common_1.Logger(ProgressiveLoadingController_1.name);
    }
    async loadProgressively(options) {
        this.logger.log(`Progressive loading with priority: ${options.priority}`);
        return this.progressiveLoadingService.loadProgressively(options);
    }
    async prefetchProducts(cursor, limit) {
        this.logger.log(`Prefetching products with cursor: ${cursor?.substring(0, 10)}...`);
        return this.progressiveLoadingService.prefetchProducts(cursor, limit);
    }
    async loadMoreWithExclusions(options) {
        this.logger.log(`Loading more products with ${options.exclude?.length || 0} exclusions`);
        return this.progressiveLoadingService.loadProgressively(options);
    }
};
exports.ProgressiveLoadingController = ProgressiveLoadingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Load products progressively',
        description: 'Load products incrementally as the user scrolls, with priority-based loading for visible content.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return products with next cursor',
        type: progressive_loading_dto_1.ProgressiveLoadingResponseDto,
    }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: progressive_loading_dto_1.LoadingPriority }),
    (0, swagger_1.ApiQuery)({ name: 'fullDetails', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'withMetadata', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [progressive_loading_dto_1.ProgressiveLoadingDto]),
    __metadata("design:returntype", Promise)
], ProgressiveLoadingController.prototype, "loadProgressively", null);
__decorate([
    (0, common_1.Get)('prefetch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Prefetch products for future loading',
        description: "Prefetch product data before it's needed to improve perceived performance.",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return IDs of prefetched products',
        type: [String],
    }),
    (0, swagger_1.ApiQuery)({ name: 'cursor', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('cursor')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ProgressiveLoadingController.prototype, "prefetchProducts", null);
__decorate([
    (0, common_1.Post)('load-more'),
    (0, swagger_1.ApiOperation)({
        summary: 'Load more products with exclusions',
        description: 'Load more products while excluding already loaded ones to avoid duplicates.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return additional products',
        type: progressive_loading_dto_1.ProgressiveLoadingResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [progressive_loading_dto_1.ProgressiveLoadingDto]),
    __metadata("design:returntype", Promise)
], ProgressiveLoadingController.prototype, "loadMoreWithExclusions", null);
exports.ProgressiveLoadingController = ProgressiveLoadingController = ProgressiveLoadingController_1 = __decorate([
    (0, swagger_1.ApiTags)('products-progressive'),
    (0, common_1.Controller)('products/progressive'),
    __metadata("design:paramtypes", [progressive_loading_service_1.ProgressiveLoadingService,
        data_normalization_service_1.DataNormalizationService])
], ProgressiveLoadingController);
//# sourceMappingURL=progressive-loading.controller.js.map