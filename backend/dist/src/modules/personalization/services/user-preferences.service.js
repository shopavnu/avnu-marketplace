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
var UserPreferencesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_preferences_entity_1 = require("../entities/user-preferences.entity");
let UserPreferencesService = UserPreferencesService_1 = class UserPreferencesService {
    constructor(userPreferencesRepository) {
        this.userPreferencesRepository = userPreferencesRepository;
        this.logger = new common_1.Logger(UserPreferencesService_1.name);
    }
    async create(createUserPreferencesDto) {
        try {
            const existingPreferences = await this.userPreferencesRepository.findOne({
                where: { userId: createUserPreferencesDto.userId },
            });
            if (existingPreferences) {
                throw new Error(`Preferences already exist for user ${createUserPreferencesDto.userId}`);
            }
            const userPreferences = this.userPreferencesRepository.create(createUserPreferencesDto);
            return this.userPreferencesRepository.save(userPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to create user preferences: ${error.message}`);
            throw error;
        }
    }
    async findByUserId(userId) {
        try {
            const userPreferences = await this.userPreferencesRepository.findOne({
                where: { userId },
            });
            if (!userPreferences) {
                throw new common_1.NotFoundException(`User preferences not found for user ${userId}`);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to find user preferences: ${error.message}`);
            throw error;
        }
    }
    async update(userId, updateUserPreferencesDto) {
        try {
            const userPreferences = await this.findByUserId(userId);
            const updatedPreferences = this.userPreferencesRepository.merge(userPreferences, updateUserPreferencesDto);
            return this.userPreferencesRepository.save(updatedPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to update user preferences: ${error.message}`);
            throw error;
        }
    }
    async findOrCreate(userId) {
        try {
            try {
                return await this.findByUserId(userId);
            }
            catch (error) {
                if (error instanceof common_1.NotFoundException) {
                    return this.create({ userId });
                }
                throw error;
            }
        }
        catch (error) {
            this.logger.error(`Failed to find or create user preferences: ${error.message}`);
            throw error;
        }
    }
    async addFavoriteCategory(userId, category) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (!userPreferences.favoriteCategories) {
                userPreferences.favoriteCategories = [];
            }
            if (!userPreferences.favoriteCategories.includes(category)) {
                userPreferences.favoriteCategories.push(category);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to add favorite category: ${error.message}`);
            throw error;
        }
    }
    async removeFavoriteCategory(userId, category) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (userPreferences.favoriteCategories) {
                userPreferences.favoriteCategories = userPreferences.favoriteCategories.filter(c => c !== category);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to remove favorite category: ${error.message}`);
            throw error;
        }
    }
    async addFavoriteValue(userId, value) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (!userPreferences.favoriteValues) {
                userPreferences.favoriteValues = [];
            }
            if (!userPreferences.favoriteValues.includes(value)) {
                userPreferences.favoriteValues.push(value);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to add favorite value: ${error.message}`);
            throw error;
        }
    }
    async removeFavoriteValue(userId, value) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (userPreferences.favoriteValues) {
                userPreferences.favoriteValues = userPreferences.favoriteValues.filter(v => v !== value);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to remove favorite value: ${error.message}`);
            throw error;
        }
    }
    async addFavoriteBrand(userId, brand) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (!userPreferences.favoriteBrands) {
                userPreferences.favoriteBrands = [];
            }
            if (!userPreferences.favoriteBrands.includes(brand)) {
                userPreferences.favoriteBrands.push(brand);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to add favorite brand: ${error.message}`);
            throw error;
        }
    }
    async removeFavoriteBrand(userId, brand) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            if (userPreferences.favoriteBrands) {
                userPreferences.favoriteBrands = userPreferences.favoriteBrands.filter(b => b !== brand);
                return this.userPreferencesRepository.save(userPreferences);
            }
            return userPreferences;
        }
        catch (error) {
            this.logger.error(`Failed to remove favorite brand: ${error.message}`);
            throw error;
        }
    }
    async setPriceSensitivity(userId, sensitivity) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            userPreferences.priceSensitivity = sensitivity;
            return this.userPreferencesRepository.save(userPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to set price sensitivity: ${error.message}`);
            throw error;
        }
    }
    async setPreferSustainable(userId, prefer) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            userPreferences.preferSustainable = prefer;
            return this.userPreferencesRepository.save(userPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to set sustainability preference: ${error.message}`);
            throw error;
        }
    }
    async setPreferEthical(userId, prefer) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            userPreferences.preferEthical = prefer;
            return this.userPreferencesRepository.save(userPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to set ethical preference: ${error.message}`);
            throw error;
        }
    }
    async setPreferLocalBrands(userId, prefer) {
        try {
            const userPreferences = await this.findOrCreate(userId);
            userPreferences.preferLocalBrands = prefer;
            return this.userPreferencesRepository.save(userPreferences);
        }
        catch (error) {
            this.logger.error(`Failed to set local brands preference: ${error.message}`);
            throw error;
        }
    }
};
exports.UserPreferencesService = UserPreferencesService;
exports.UserPreferencesService = UserPreferencesService = UserPreferencesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_preferences_entity_1.UserPreferences)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserPreferencesService);
//# sourceMappingURL=user-preferences.service.js.map