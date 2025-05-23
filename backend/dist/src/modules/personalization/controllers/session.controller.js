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
var SessionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("../services/session.service");
class TrackSessionInteractionDto {
}
let SessionController = SessionController_1 = class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(SessionController_1.name);
    }
    async trackInteraction(dto) {
        try {
            await this.sessionService.trackInteraction(dto.sessionId, dto.type, dto.data, dto.durationMs);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to track session interaction: ${error.message}`);
            return { success: false, error: 'Failed to track interaction' };
        }
    }
    async initializeSession({ sessionId }) {
        try {
            const session = await this.sessionService.getOrCreateSession(sessionId);
            return {
                success: true,
                sessionId: session.sessionId,
                startTime: session.startTime,
                lastActivityTime: session.lastActivityTime,
            };
        }
        catch (error) {
            this.logger.error(`Failed to initialize session: ${error.message}`);
            return { success: false, error: 'Failed to initialize session' };
        }
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TrackSessionInteractionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "trackInteraction", null);
__decorate([
    (0, common_1.Post)('initialize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "initializeSession", null);
exports.SessionController = SessionController = SessionController_1 = __decorate([
    (0, common_1.Controller)('session'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map