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
exports.KeyboardNavigationController = void 0;
const common_1 = require("@nestjs/common");
const keyboard_navigation_service_1 = require("../services/keyboard-navigation.service");
const section_mapping_service_1 = require("../services/section-mapping.service");
const keyboard_shortcut_service_1 = require("../services/keyboard-shortcut.service");
const focus_state_service_1 = require("../services/focus-state.service");
let KeyboardNavigationController = class KeyboardNavigationController {
    constructor(keyboardNavigationService, sectionMappingService, keyboardShortcutService, focusStateService) {
        this.keyboardNavigationService = keyboardNavigationService;
        this.sectionMappingService = sectionMappingService;
        this.keyboardShortcutService = keyboardShortcutService;
        this.focusStateService = focusStateService;
    }
    async getNavigationSections(route) {
        return this.keyboardNavigationService.getNavigationSections(route);
    }
    async getSectionById(id) {
        return this.sectionMappingService.getSectionById(id);
    }
    async createSection(sectionData) {
        return this.sectionMappingService.createSection(sectionData);
    }
    async updateSection(id, sectionData) {
        return this.sectionMappingService.updateSection(id, sectionData);
    }
    async deleteSection(id) {
        return this.sectionMappingService.deleteSection(id);
    }
    async getKeyboardShortcuts(userId, route) {
        if (route) {
            return this.keyboardNavigationService.getUserShortcutsForRoute(userId, route);
        }
        else {
            return this.keyboardShortcutService.getUserShortcuts(userId);
        }
    }
    async getShortcutById(id) {
        return this.keyboardShortcutService.getShortcutById(id);
    }
    async createShortcut(shortcutData) {
        return this.keyboardShortcutService.createShortcut(shortcutData);
    }
    async updateShortcut(id, shortcutData) {
        return this.keyboardShortcutService.updateShortcut(id, shortcutData);
    }
    async deleteShortcut(id) {
        return this.keyboardShortcutService.deleteShortcut(id);
    }
    async saveUserShortcut(userId, shortcutData) {
        return this.keyboardNavigationService.saveUserShortcut(userId, shortcutData);
    }
    async resetUserShortcuts(userId) {
        return this.keyboardNavigationService.resetUserShortcuts(userId);
    }
    async getFocusState(userId, sessionId, route) {
        if (route) {
            return this.focusStateService.getRouteFocusState(userId, sessionId, route);
        }
        else {
            return this.focusStateService.getLastFocusState(userId, sessionId);
        }
    }
    async saveFocusState(focusData) {
        return this.focusStateService.saveFocusState(focusData);
    }
    async clearFocusStates(userId, sessionId) {
        return this.focusStateService.clearFocusStates(userId, sessionId);
    }
    async getNavigationState(route, userId, sessionId) {
        return this.keyboardNavigationService.getNavigationState(route, userId, sessionId);
    }
    async initializeNavigationSystem() {
        await this.keyboardNavigationService.initializeNavigationSystem();
        return { success: true, message: 'Keyboard navigation system initialized successfully' };
    }
};
exports.KeyboardNavigationController = KeyboardNavigationController;
__decorate([
    (0, common_1.Get)('sections'),
    __param(0, (0, common_1.Query)('route')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getNavigationSections", null);
__decorate([
    (0, common_1.Get)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getSectionById", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "createSection", null);
__decorate([
    (0, common_1.Put)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Get)('shortcuts'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('route')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getKeyboardShortcuts", null);
__decorate([
    (0, common_1.Get)('shortcuts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getShortcutById", null);
__decorate([
    (0, common_1.Post)('shortcuts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "createShortcut", null);
__decorate([
    (0, common_1.Put)('shortcuts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "updateShortcut", null);
__decorate([
    (0, common_1.Delete)('shortcuts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "deleteShortcut", null);
__decorate([
    (0, common_1.Post)('shortcuts/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "saveUserShortcut", null);
__decorate([
    (0, common_1.Delete)('shortcuts/user/:userId/reset'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "resetUserShortcuts", null);
__decorate([
    (0, common_1.Get)('focus-state'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('route')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getFocusState", null);
__decorate([
    (0, common_1.Post)('focus-state'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "saveFocusState", null);
__decorate([
    (0, common_1.Delete)('focus-state'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "clearFocusStates", null);
__decorate([
    (0, common_1.Get)('navigation-state'),
    __param(0, (0, common_1.Query)('route')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "getNavigationState", null);
__decorate([
    (0, common_1.Post)('initialize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KeyboardNavigationController.prototype, "initializeNavigationSystem", null);
exports.KeyboardNavigationController = KeyboardNavigationController = __decorate([
    (0, common_1.Controller)('accessibility/keyboard-navigation'),
    __metadata("design:paramtypes", [keyboard_navigation_service_1.KeyboardNavigationService,
        section_mapping_service_1.SectionMappingService,
        keyboard_shortcut_service_1.KeyboardShortcutService,
        focus_state_service_1.FocusStateService])
], KeyboardNavigationController);
//# sourceMappingURL=keyboard-navigation.controller.js.map