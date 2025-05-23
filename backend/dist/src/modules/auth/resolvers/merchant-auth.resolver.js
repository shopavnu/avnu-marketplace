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
exports.MerchantAuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("../auth.service");
const merchant_register_dto_1 = require("../dto/merchant-register.dto");
const login_dto_1 = require("../dto/login.dto");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const public_decorator_1 = require("../decorators/public.decorator");
let MerchantAuthResolver = class MerchantAuthResolver {
    constructor(authService) {
        this.authService = authService;
    }
    async merchantRegister(merchantRegisterDto) {
        return this.authService.registerMerchant(merchantRegisterDto);
    }
    async merchantLogin(loginDto) {
        return this.authService.login(loginDto);
    }
    async merchantRefreshToken(user) {
        return this.authService.refreshToken(user.id);
    }
};
exports.MerchantAuthResolver = MerchantAuthResolver;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Mutation)(() => Object, { description: 'Register a new merchant account' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merchant_register_dto_1.MerchantRegisterDto]),
    __metadata("design:returntype", Promise)
], MerchantAuthResolver.prototype, "merchantRegister", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Mutation)(() => Object, { description: 'Login as a merchant' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], MerchantAuthResolver.prototype, "merchantLogin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, graphql_1.Mutation)(() => Object, { description: 'Refresh merchant JWT token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MerchantAuthResolver.prototype, "merchantRefreshToken", null);
exports.MerchantAuthResolver = MerchantAuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], MerchantAuthResolver);
//# sourceMappingURL=merchant-auth.resolver.js.map