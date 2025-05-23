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
var BatchSectionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchSectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const batch_sections_service_1 = require("../services/batch-sections.service");
const batch_sections_dto_1 = require("../dto/batch-sections.dto");
let BatchSectionsController = BatchSectionsController_1 = class BatchSectionsController {
    constructor(batchSectionsService) {
        this.batchSectionsService = batchSectionsService;
        this.logger = new common_1.Logger(BatchSectionsController_1.name);
    }
    async loadBatchSections(batchRequest) {
        this.logger.log(`Batch loading ${batchRequest.sections.length} sections`);
        return this.batchSectionsService.loadBatchSections(batchRequest);
    }
    async loadPersonalizedBatchSections(batchRequest) {
        this.logger.log(`Batch loading ${batchRequest.sections.length} personalized sections`);
        return this.batchSectionsService.loadBatchSections(batchRequest);
    }
};
exports.BatchSectionsController = BatchSectionsController;
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Batch load multiple product sections',
        description: 'Load multiple product sections (e.g., New Arrivals, Featured, Recommended) in a single request. Optimized for continuous scroll interfaces.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return multiple product sections',
        type: batch_sections_dto_1.BatchSectionsResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [batch_sections_dto_1.BatchSectionsRequestDto]),
    __metadata("design:returntype", Promise)
], BatchSectionsController.prototype, "loadBatchSections", null);
__decorate([
    (0, common_1.Post)('batch/personalized'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Batch load personalized product sections',
        description: 'Load multiple personalized product sections based on user preferences and history. Requires authentication.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return multiple personalized product sections',
        type: batch_sections_dto_1.BatchSectionsResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [batch_sections_dto_1.BatchSectionsRequestDto]),
    __metadata("design:returntype", Promise)
], BatchSectionsController.prototype, "loadPersonalizedBatchSections", null);
exports.BatchSectionsController = BatchSectionsController = BatchSectionsController_1 = __decorate([
    (0, swagger_1.ApiTags)('products-sections'),
    (0, common_1.Controller)('products/sections'),
    __metadata("design:paramtypes", [batch_sections_service_1.BatchSectionsService])
], BatchSectionsController);
//# sourceMappingURL=batch-sections.controller.js.map