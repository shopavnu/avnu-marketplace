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
exports.UserPreferenceProfileController = void 0;
const common_1 = require("@nestjs/common");
const user_preference_profile_service_1 = require("../services/user-preference-profile.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_preference_profile_entity_1 = require("../entities/user-preference-profile.entity");
const swagger_1 = require("@nestjs/swagger");
let UserPreferenceProfileController = class UserPreferenceProfileController {
    constructor(userPreferenceProfileService) {
        this.userPreferenceProfileService = userPreferenceProfileService;
    }
    async getUserPreferenceProfile(req) {
        const userId = req.user.userId;
        return this.userPreferenceProfileService.getUserPreferenceProfile(userId);
    }
    async updateProfileFromSession(req, sessionId) {
        const userId = req.user.userId;
        return this.userPreferenceProfileService.updateProfileFromSession(userId, sessionId);
    }
    async getPersonalizedRecommendations(req) {
        const userId = req.user.userId;
        return this.userPreferenceProfileService.getPersonalizedRecommendations(userId);
    }
};
exports.UserPreferenceProfileController = UserPreferenceProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user preference profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns the user preference profile',
        type: user_preference_profile_entity_1.UserPreferenceProfile,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPreferenceProfileController.prototype, "getUserPreferenceProfile", null);
__decorate([
    (0, common_1.Post)('update-from-session/:sessionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user preference profile from session data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Updates and returns the user preference profile',
        type: user_preference_profile_entity_1.UserPreferenceProfile,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserPreferenceProfileController.prototype, "updateProfileFromSession", null);
__decorate([
    (0, common_1.Get)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized product recommendations' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns personalized product recommendations',
        type: [String],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserPreferenceProfileController.prototype, "getPersonalizedRecommendations", null);
exports.UserPreferenceProfileController = UserPreferenceProfileController = __decorate([
    (0, swagger_1.ApiTags)('User Preference Profile'),
    (0, common_1.Controller)('user-preference-profile'),
    __metadata("design:paramtypes", [user_preference_profile_service_1.UserPreferenceProfileService])
], UserPreferenceProfileController);
//# sourceMappingURL=user-preference-profile.controller.js.map