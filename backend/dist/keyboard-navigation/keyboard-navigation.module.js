"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardNavigationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const keyboard_navigation_service_1 = require("./services/keyboard-navigation.service");
const keyboard_navigation_controller_1 = require("./controllers/keyboard-navigation.controller");
const keyboard_navigation_resolver_1 = require("./resolvers/keyboard-navigation.resolver");
const focus_state_service_1 = require("./services/focus-state.service");
const keyboard_shortcut_service_1 = require("./services/keyboard-shortcut.service");
const section_mapping_service_1 = require("./services/section-mapping.service");
const navigation_section_entity_1 = require("./entities/navigation-section.entity");
const focus_state_entity_1 = require("./entities/focus-state.entity");
const keyboard_shortcut_entity_1 = require("./entities/keyboard-shortcut.entity");
let KeyboardNavigationModule = class KeyboardNavigationModule {
};
exports.KeyboardNavigationModule = KeyboardNavigationModule;
exports.KeyboardNavigationModule = KeyboardNavigationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([navigation_section_entity_1.NavigationSection, focus_state_entity_1.FocusState, keyboard_shortcut_entity_1.KeyboardShortcut])],
        controllers: [keyboard_navigation_controller_1.KeyboardNavigationController],
        providers: [
            keyboard_navigation_service_1.KeyboardNavigationService,
            keyboard_navigation_resolver_1.KeyboardNavigationResolver,
            focus_state_service_1.FocusStateService,
            keyboard_shortcut_service_1.KeyboardShortcutService,
            section_mapping_service_1.SectionMappingService,
        ],
        exports: [
            keyboard_navigation_service_1.KeyboardNavigationService,
            focus_state_service_1.FocusStateService,
            keyboard_shortcut_service_1.KeyboardShortcutService,
            section_mapping_service_1.SectionMappingService,
        ],
    })
], KeyboardNavigationModule);
//# sourceMappingURL=keyboard-navigation.module.js.map