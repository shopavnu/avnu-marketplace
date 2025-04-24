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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedSearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const personalized_search_service_1 = require("../services/personalized-search.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let PersonalizedSearchController = class PersonalizedSearchController {
    constructor(personalizedSearchService) {
        this.personalizedSearchService = personalizedSearchService;
    }
    async personalizedSearch(req, body) {
        return this.personalizedSearchService.personalizedSearch(req.user.id, body.query, body.options || {});
    }
    async getRecommendations(req, limit) {
        return this.personalizedSearchService.getPersonalizedRecommendations(req.user.id, limit ? parseInt(limit.toString(), 10) : 10);
    }
    async getDiscoveryFeed(req, limit) {
        return this.personalizedSearchService.getDiscoveryFeed(req.user.id, {
            limit: limit ? parseInt(limit.toString(), 10) : 20,
        });
    }
    async getSimilarProducts(req, productId, limit) {
        return this.personalizedSearchService.getSimilarProducts(productId, req.user.id, limit ? parseInt(limit.toString(), 10) : 10);
    }
};
exports.PersonalizedSearchController = PersonalizedSearchController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perform a personalized search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results with personalization' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchController.prototype, "personalizedSearch", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized product recommendations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Personalized product recommendations' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('discovery-feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized discovery feed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Personalized discovery feed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchController.prototype, "getDiscoveryFeed", null);
__decorate([
    (0, common_1.Get)('similar-products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar products with personalization' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Similar products with personalization' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchController.prototype, "getSimilarProducts", null);
exports.PersonalizedSearchController = PersonalizedSearchController = __decorate([
    (0, swagger_1.ApiTags)('personalized-search'),
    (0, common_1.Controller)('personalized-search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [personalized_search_service_1.PersonalizedSearchService])
], PersonalizedSearchController);
//# sourceMappingURL=personalized-search.controller.js.map