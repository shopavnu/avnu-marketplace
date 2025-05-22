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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.KeyboardNavigationResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const keyboard_navigation_service_1 = require('../services/keyboard-navigation.service');
const navigation_section_entity_1 = require('../entities/navigation-section.entity');
const focus_state_entity_1 = require('../entities/focus-state.entity');
const keyboard_shortcut_entity_1 = require('../entities/keyboard-shortcut.entity');
const section_mapping_service_1 = require('../services/section-mapping.service');
const keyboard_shortcut_service_1 = require('../services/keyboard-shortcut.service');
const focus_state_service_1 = require('../services/focus-state.service');
let KeyboardNavigationResolver = class KeyboardNavigationResolver {
  constructor(
    keyboardNavigationService,
    sectionMappingService,
    keyboardShortcutService,
    focusStateService,
  ) {
    this.keyboardNavigationService = keyboardNavigationService;
    this.sectionMappingService = sectionMappingService;
    this.keyboardShortcutService = keyboardShortcutService;
    this.focusStateService = focusStateService;
  }
  async navigationSections(route) {
    return this.keyboardNavigationService.getNavigationSections(route);
  }
  async keyboardShortcuts(userId, route) {
    if (route) {
      return this.keyboardNavigationService.getUserShortcutsForRoute(userId, route);
    } else {
      return this.keyboardShortcutService.getUserShortcuts(userId);
    }
  }
  async lastFocusState(userId, sessionId, route) {
    if (route) {
      return this.focusStateService.getRouteFocusState(userId, sessionId, route);
    } else {
      return this.focusStateService.getLastFocusState(userId, sessionId);
    }
  }
  async saveFocusState(userId, sessionId, route, sectionId, elementId, elementSelector, context) {
    return this.focusStateService.saveFocusState({
      userId,
      sessionId,
      route,
      sectionId,
      elementId,
      elementSelector,
      context,
      lastActive: new Date(),
      isActive: true,
    });
  }
  async clearFocusStates(userId, sessionId) {
    return this.focusStateService.clearFocusStates(userId, sessionId);
  }
  async saveUserShortcut(
    userId,
    name,
    description,
    key,
    altKey,
    ctrlKey,
    shiftKey,
    metaKey,
    action,
    route,
    sectionId,
  ) {
    return this.keyboardNavigationService.saveUserShortcut(userId, {
      name,
      description,
      shortcutKey: {
        key,
        altKey,
        ctrlKey,
        shiftKey,
        metaKey,
      },
      action,
      route,
      sectionId,
      userId,
      isGlobal: false,
      isActive: true,
    });
  }
  async resetUserShortcuts(userId) {
    return this.keyboardNavigationService.resetUserShortcuts(userId);
  }
  async createNavigationSection(
    name,
    route,
    selector,
    priority,
    description,
    ariaLabel,
    parentSectionId,
    childSelectors,
  ) {
    return this.sectionMappingService.createSection({
      name,
      route,
      selector,
      priority,
      description,
      ariaLabel,
      parentSectionId,
      childSelectors,
      isActive: true,
    });
  }
  async updateNavigationSection(
    id,
    name,
    route,
    selector,
    priority,
    description,
    ariaLabel,
    parentSectionId,
    childSelectors,
    isActive,
  ) {
    return this.sectionMappingService.updateSection(id, {
      name,
      route,
      selector,
      priority,
      description,
      ariaLabel,
      parentSectionId,
      childSelectors,
      isActive,
    });
  }
  async deleteNavigationSection(id) {
    return this.sectionMappingService.deleteSection(id);
  }
};
exports.KeyboardNavigationResolver = KeyboardNavigationResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => [navigation_section_entity_1.NavigationSection]),
    __param(0, (0, graphql_1.Args)('route')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'navigationSections',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [keyboard_shortcut_entity_1.KeyboardShortcut]),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('route', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'keyboardShortcuts',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => focus_state_entity_1.FocusState, { nullable: true }),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('route', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'lastFocusState',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => focus_state_entity_1.FocusState),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __param(2, (0, graphql_1.Args)('route')),
    __param(3, (0, graphql_1.Args)('sectionId')),
    __param(4, (0, graphql_1.Args)('elementId', { nullable: true })),
    __param(5, (0, graphql_1.Args)('elementSelector', { nullable: true })),
    __param(6, (0, graphql_1.Args)('context', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, String, String, String, String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'saveFocusState',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'clearFocusStates',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => keyboard_shortcut_entity_1.KeyboardShortcut),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('name')),
    __param(2, (0, graphql_1.Args)('description')),
    __param(3, (0, graphql_1.Args)('key')),
    __param(4, (0, graphql_1.Args)('altKey', { nullable: true })),
    __param(5, (0, graphql_1.Args)('ctrlKey', { nullable: true })),
    __param(6, (0, graphql_1.Args)('shiftKey', { nullable: true })),
    __param(7, (0, graphql_1.Args)('metaKey', { nullable: true })),
    __param(8, (0, graphql_1.Args)('action', { nullable: true })),
    __param(9, (0, graphql_1.Args)('route', { nullable: true })),
    __param(10, (0, graphql_1.Args)('sectionId', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      String,
      String,
      Boolean,
      Boolean,
      Boolean,
      Boolean,
      String,
      String,
      String,
    ]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'saveUserShortcut',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('userId')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'resetUserShortcuts',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => navigation_section_entity_1.NavigationSection),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, graphql_1.Args)('route')),
    __param(2, (0, graphql_1.Args)('selector')),
    __param(3, (0, graphql_1.Args)('priority')),
    __param(4, (0, graphql_1.Args)('description', { nullable: true })),
    __param(5, (0, graphql_1.Args)('ariaLabel', { nullable: true })),
    __param(6, (0, graphql_1.Args)('parentSectionId', { nullable: true })),
    __param(7, (0, graphql_1.Args)('childSelectors', { type: () => [String], nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      String,
      Number,
      String,
      String,
      String,
      Array,
    ]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'createNavigationSection',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => navigation_section_entity_1.NavigationSection),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('name', { nullable: true })),
    __param(2, (0, graphql_1.Args)('route', { nullable: true })),
    __param(3, (0, graphql_1.Args)('selector', { nullable: true })),
    __param(4, (0, graphql_1.Args)('priority', { nullable: true })),
    __param(5, (0, graphql_1.Args)('description', { nullable: true })),
    __param(6, (0, graphql_1.Args)('ariaLabel', { nullable: true })),
    __param(7, (0, graphql_1.Args)('parentSectionId', { nullable: true })),
    __param(8, (0, graphql_1.Args)('childSelectors', { type: () => [String], nullable: true })),
    __param(9, (0, graphql_1.Args)('isActive', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      String,
      String,
      Number,
      String,
      String,
      String,
      Array,
      Boolean,
    ]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'updateNavigationSection',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  KeyboardNavigationResolver.prototype,
  'deleteNavigationSection',
  null,
);
exports.KeyboardNavigationResolver = KeyboardNavigationResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [
      keyboard_navigation_service_1.KeyboardNavigationService,
      section_mapping_service_1.SectionMappingService,
      keyboard_shortcut_service_1.KeyboardShortcutService,
      focus_state_service_1.FocusStateService,
    ]),
  ],
  KeyboardNavigationResolver,
);
//# sourceMappingURL=keyboard-navigation.resolver.js.map
