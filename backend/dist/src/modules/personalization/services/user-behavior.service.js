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
var UserBehaviorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBehaviorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_behavior_entity_1 = require("../entities/user-behavior.entity");
let UserBehaviorService = UserBehaviorService_1 = class UserBehaviorService {
    constructor(userBehaviorRepository) {
        this.userBehaviorRepository = userBehaviorRepository;
        this.logger = new common_1.Logger(UserBehaviorService_1.name);
    }
    async trackBehavior(userId, entityId, entityType, behaviorType, metadata) {
        try {
            let behavior = await this.userBehaviorRepository.findOne({
                where: {
                    userId,
                    entityId,
                    entityType,
                    behaviorType,
                },
            });
            const now = new Date();
            if (behavior) {
                behavior.count += 1;
                behavior.lastInteractionAt = now;
                if (metadata) {
                    behavior.metadata = metadata;
                }
                return this.userBehaviorRepository.save(behavior);
            }
            else {
                behavior = this.userBehaviorRepository.create({
                    userId,
                    entityId,
                    entityType,
                    behaviorType,
                    count: 1,
                    metadata,
                    lastInteractionAt: now,
                });
                return this.userBehaviorRepository.save(behavior);
            }
        }
        catch (error) {
            this.logger.error(`Failed to track behavior: ${error.message}`);
            throw error;
        }
    }
    async trackProductView(userId, productId, metadata) {
        return this.trackBehavior(userId, productId, 'product', user_behavior_entity_1.BehaviorType.VIEW, metadata);
    }
    async trackProductFavorite(userId, productId) {
        return this.trackBehavior(userId, productId, 'product', user_behavior_entity_1.BehaviorType.FAVORITE);
    }
    async trackAddToCart(userId, productId, metadata) {
        return this.trackBehavior(userId, productId, 'product', user_behavior_entity_1.BehaviorType.ADD_TO_CART, metadata);
    }
    async trackPurchase(userId, productId, metadata) {
        return this.trackBehavior(userId, productId, 'product', user_behavior_entity_1.BehaviorType.PURCHASE, metadata);
    }
    async trackSearch(userId, searchQuery) {
        return this.trackBehavior(userId, searchQuery, 'search', user_behavior_entity_1.BehaviorType.SEARCH, searchQuery);
    }
    async getUserBehaviorsByType(userId, behaviorType, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                behaviorType,
            },
            order: {
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
    async getUserBehaviorsByEntityType(userId, entityType, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                entityType,
            },
            order: {
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
    async getMostViewedProducts(userId, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                entityType: 'product',
                behaviorType: user_behavior_entity_1.BehaviorType.VIEW,
            },
            order: {
                count: 'DESC',
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
    async getMostSearchedQueries(userId, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                entityType: 'search',
                behaviorType: user_behavior_entity_1.BehaviorType.SEARCH,
            },
            order: {
                count: 'DESC',
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
    async getFavoriteProducts(userId, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                entityType: 'product',
                behaviorType: user_behavior_entity_1.BehaviorType.FAVORITE,
            },
            order: {
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
    async getPurchaseHistory(userId, limit = 10) {
        return this.userBehaviorRepository.find({
            where: {
                userId,
                entityType: 'product',
                behaviorType: user_behavior_entity_1.BehaviorType.PURCHASE,
            },
            order: {
                lastInteractionAt: 'DESC',
            },
            take: limit,
        });
    }
};
exports.UserBehaviorService = UserBehaviorService;
exports.UserBehaviorService = UserBehaviorService = UserBehaviorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_behavior_entity_1.UserBehavior)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserBehaviorService);
//# sourceMappingURL=user-behavior.service.js.map