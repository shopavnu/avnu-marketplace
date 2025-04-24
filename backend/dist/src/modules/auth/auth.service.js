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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const merchant_service_1 = require("../merchants/services/merchant.service");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    constructor(usersService, jwtService, merchantService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.merchantService = merchantService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.validateUser(email, password);
        return this.generateToken(user);
    }
    async register(registerDto) {
        const user = await this.usersService.create(registerDto);
        return this.generateToken(user);
    }
    async registerMerchant(merchantRegisterDto) {
        const { firstName, lastName, email, password, merchantName, merchantDescription, website, categories, values, } = merchantRegisterDto;
        const user = await this.usersService.create({
            firstName,
            lastName,
            email,
            password,
            role: user_entity_1.UserRole.MERCHANT,
            isMerchant: true,
        });
        const merchant = await this.merchantService.create({
            name: merchantName,
            description: merchantDescription,
            website,
            categories,
            values,
            isActive: true,
        });
        await this.merchantService.associateWithUser(merchant.id, user.id);
        return this.generateToken(user);
    }
    async refreshToken(userId) {
        const user = await this.usersService.findOne(userId);
        return this.generateToken(user);
    }
    async getMerchantForUser(userId) {
        try {
            const merchants = await this.merchantService.findByUserId(userId);
            return merchants.length > 0 ? merchants[0] : null;
        }
        catch (error) {
            console.error('Error fetching merchant for user:', error);
            return null;
        }
    }
    async generateToken(user) {
        let merchantId;
        if (user.isMerchant) {
            const merchant = await this.getMerchantForUser(user.id);
            merchantId = merchant?.id;
        }
        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isMerchant: user.isMerchant,
            merchantId,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
                isMerchant: user.isMerchant,
                role: user.role,
                merchantId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => merchant_service_1.MerchantService))),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        merchant_service_1.MerchantService])
], AuthService);
//# sourceMappingURL=auth.service.js.map