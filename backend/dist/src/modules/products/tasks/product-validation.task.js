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
var ProductValidationTask_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidationTask = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_validation_service_1 = require("../services/product-validation.service");
const merchant_entity_1 = require("../../merchants/entities/merchant.entity");
let ProductValidationTask = ProductValidationTask_1 = class ProductValidationTask {
    constructor(productValidationService, merchantRepository) {
        this.productValidationService = productValidationService;
        this.merchantRepository = merchantRepository;
        this.logger = new common_1.Logger(ProductValidationTask_1.name);
    }
    async validateAllProducts() {
        this.logger.log('Starting daily product validation task');
        try {
            await this.productValidationService.validateAllProducts();
            this.logger.log('Daily product validation task completed successfully');
        }
        catch (error) {
            this.logger.error(`Error in daily product validation task: ${error.message}`, error.stack);
        }
    }
    async validateRecentProducts() {
        this.logger.log('Starting hourly validation for recently imported products');
        try {
            const recentMerchants = await this.merchantRepository.query(`
        SELECT DISTINCT m.id 
        FROM merchants m
        JOIN products p ON p."merchantId" = m.id
        WHERE p."createdAt" > NOW() - INTERVAL '1 hour'
        OR p."updatedAt" > NOW() - INTERVAL '1 hour'
      `);
            for (const merchant of recentMerchants) {
                await this.productValidationService.validateMerchantProducts(merchant.id);
            }
            this.logger.log(`Validated products for ${recentMerchants.length} merchants with recent imports`);
        }
        catch (error) {
            this.logger.error(`Error validating recent products: ${error.message}`, error.stack);
        }
    }
};
exports.ProductValidationTask = ProductValidationTask;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductValidationTask.prototype, "validateAllProducts", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductValidationTask.prototype, "validateRecentProducts", null);
exports.ProductValidationTask = ProductValidationTask = ProductValidationTask_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __metadata("design:paramtypes", [product_validation_service_1.ProductValidationService,
        typeorm_2.Repository])
], ProductValidationTask);
//# sourceMappingURL=product-validation.task.js.map