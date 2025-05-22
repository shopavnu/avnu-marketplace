'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var KeyboardNavigationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.KeyboardNavigationService = void 0;
const common_1 = require('@nestjs/common');
const section_mapping_service_1 = require('./section-mapping.service');
const focus_state_service_1 = require('./focus-state.service');
const keyboard_shortcut_service_1 = require('./keyboard-shortcut.service');
let KeyboardNavigationService = (KeyboardNavigationService_1 = class KeyboardNavigationService {
  constructor(sectionMappingService, focusStateService, keyboardShortcutService) {
    this.sectionMappingService = sectionMappingService;
    this.focusStateService = focusStateService;
    this.keyboardShortcutService = keyboardShortcutService;
    this.logger = new common_1.Logger(KeyboardNavigationService_1.name);
  }
  async initializeNavigationSystem() {
    this.logger.log('Initializing keyboard navigation system');
    await this.sectionMappingService.initializeDefaultSections();
    await this.keyboardShortcutService.initializeDefaultShortcuts();
    this.logger.log('Keyboard navigation system initialized successfully');
  }
  async getNavigationState(route, userId, sessionId) {
    const routeSections = await this.sectionMappingService.getSectionsByRoute(route);
    const globalSections = await this.sectionMappingService.getSectionsByRoute('*');
    const sections = [...routeSections, ...globalSections].sort((a, b) => a.priority - b.priority);
    const shortcuts = await this.keyboardShortcutService.getShortcutsByRoute(route);
    const currentFocus = await this.focusStateService.getRouteFocusState(userId, sessionId, route);
    let nextFocusableSection = null;
    let previousFocusableSection = null;
    if (currentFocus && currentFocus.sectionId) {
      const currentSectionIndex = sections.findIndex(s => s.id === currentFocus.sectionId);
      if (currentSectionIndex !== -1) {
        if (currentSectionIndex < sections.length - 1) {
          nextFocusableSection = sections[currentSectionIndex + 1];
        }
        if (currentSectionIndex > 0) {
          previousFocusableSection = sections[currentSectionIndex - 1];
        }
      }
    }
    return {
      sections,
      shortcuts,
      currentFocus,
      nextFocusableSection,
      previousFocusableSection,
    };
  }
  async saveFocusState(focusData) {
    return this.focusStateService.saveFocusState(focusData);
  }
  async getNavigationSections(route) {
    const routeSections = await this.sectionMappingService.getSectionsByRoute(route);
    const globalSections = await this.sectionMappingService.getSectionsByRoute('*');
    return [...routeSections, ...globalSections].sort((a, b) => a.priority - b.priority);
  }
  async getUserShortcutsForRoute(userId, route) {
    const userShortcuts = await this.keyboardShortcutService.getUserShortcuts(userId);
    const routeShortcuts = await this.keyboardShortcutService.getShortcutsByRoute(route);
    const shortcutMap = new Map();
    routeShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.name, shortcut);
    });
    userShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.name, shortcut);
    });
    return Array.from(shortcutMap.values());
  }
  async saveUserShortcut(userId, shortcutData) {
    shortcutData.userId = userId;
    const existingShortcut = await this.keyboardShortcutService.getShortcutById(shortcutData.id);
    if (existingShortcut && existingShortcut.userId === userId) {
      return this.keyboardShortcutService.updateShortcut(existingShortcut.id, shortcutData);
    } else {
      return this.keyboardShortcutService.createShortcut(shortcutData);
    }
  }
  async resetUserShortcuts(userId) {
    this.logger.log(`Resetting keyboard shortcuts for user ${userId}`);
    const userShortcuts = await this.keyboardShortcutService.getUserShortcuts(userId);
    const userCustomShortcuts = userShortcuts.filter(shortcut => !shortcut.isGlobal);
    for (const shortcut of userCustomShortcuts) {
      await this.keyboardShortcutService.deleteShortcut(shortcut.id);
    }
    return true;
  }
  async getLastFocusState(userId, sessionId) {
    return this.focusStateService.getLastFocusState(userId, sessionId);
  }
});
exports.KeyboardNavigationService = KeyboardNavigationService;
exports.KeyboardNavigationService =
  KeyboardNavigationService =
  KeyboardNavigationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          section_mapping_service_1.SectionMappingService,
          focus_state_service_1.FocusStateService,
          keyboard_shortcut_service_1.KeyboardShortcutService,
        ]),
      ],
      KeyboardNavigationService,
    );
//# sourceMappingURL=keyboard-navigation.service.js.map
