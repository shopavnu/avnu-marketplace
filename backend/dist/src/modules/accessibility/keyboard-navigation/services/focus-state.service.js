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
var FocusStateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusStateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const focus_state_entity_1 = require("../entities/focus-state.entity");
let FocusStateService = FocusStateService_1 = class FocusStateService {
    constructor(focusStateRepository) {
        this.focusStateRepository = focusStateRepository;
        this.logger = new common_1.Logger(FocusStateService_1.name);
    }
    async saveFocusState(focusData) {
        this.logger.log(`Saving focus state for user ${focusData.userId} on route ${focusData.route}`);
        focusData.lastActive = new Date();
        const existingState = await this.focusStateRepository.findOne({
            where: {
                userId: focusData.userId,
                sessionId: focusData.sessionId,
                isActive: true,
            },
        });
        if (existingState) {
            const updatedState = { ...existingState, ...focusData };
            await this.focusStateRepository.update(existingState.id, updatedState);
            return this.focusStateRepository.findOne({ where: { id: existingState.id } });
        }
        else {
            const newState = this.focusStateRepository.create(focusData);
            return this.focusStateRepository.save(newState);
        }
    }
    async getLastFocusState(userId, sessionId) {
        return this.focusStateRepository.findOne({
            where: {
                userId,
                sessionId,
                isActive: true,
            },
            order: {
                lastActive: 'DESC',
            },
        });
    }
    async getRouteFocusState(userId, sessionId, route) {
        return this.focusStateRepository.findOne({
            where: {
                userId,
                sessionId,
                route,
                isActive: true,
            },
            order: {
                lastActive: 'DESC',
            },
        });
    }
    async clearFocusStates(userId, sessionId) {
        this.logger.log(`Clearing focus states for user ${userId} in session ${sessionId}`);
        const result = await this.focusStateRepository.update({ userId, sessionId, isActive: true }, { isActive: false });
        return result.affected > 0;
    }
    async getFocusHistory(userId, limit = 10) {
        return this.focusStateRepository.find({
            where: { userId },
            order: { lastActive: 'DESC' },
            take: limit,
        });
    }
    async cleanupOldFocusStates(olderThan) {
        const result = await this.focusStateRepository.delete({
            lastActive: olderThan,
        });
        this.logger.log(`Cleaned up ${result.affected} old focus states`);
        return result.affected;
    }
};
exports.FocusStateService = FocusStateService;
exports.FocusStateService = FocusStateService = FocusStateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(focus_state_entity_1.FocusState)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FocusStateService);
//# sourceMappingURL=focus-state.service.js.map