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
var KeyboardShortcutService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.KeyboardShortcutService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const keyboard_shortcut_entity_1 = require('../entities/keyboard-shortcut.entity');
let KeyboardShortcutService = (KeyboardShortcutService_1 = class KeyboardShortcutService {
  constructor(keyboardShortcutRepository) {
    this.keyboardShortcutRepository = keyboardShortcutRepository;
    this.logger = new common_1.Logger(KeyboardShortcutService_1.name);
  }
  async createShortcut(shortcutData) {
    this.logger.log(`Creating keyboard shortcut: ${shortcutData.name}`);
    if (await this.checkShortcutConflict(shortcutData)) {
      throw new Error('Shortcut key combination conflicts with an existing shortcut');
    }
    const shortcut = this.keyboardShortcutRepository.create(shortcutData);
    return this.keyboardShortcutRepository.save(shortcut);
  }
  async updateShortcut(id, shortcutData) {
    this.logger.log(`Updating keyboard shortcut: ${id}`);
    if (await this.checkShortcutConflict(shortcutData, id)) {
      throw new Error('Shortcut key combination conflicts with an existing shortcut');
    }
    await this.keyboardShortcutRepository.update(id, shortcutData);
    return this.keyboardShortcutRepository.findOne({ where: { id } });
  }
  async deleteShortcut(id) {
    this.logger.log(`Deleting keyboard shortcut: ${id}`);
    const result = await this.keyboardShortcutRepository.delete(id);
    return result.affected > 0;
  }
  async getShortcutById(id) {
    return this.keyboardShortcutRepository.findOne({ where: { id } });
  }
  async getGlobalShortcuts() {
    return this.keyboardShortcutRepository.find({
      where: { isGlobal: true, isActive: true },
    });
  }
  async getShortcutsByRoute(route) {
    return this.keyboardShortcutRepository.find({
      where: [
        { route, isActive: true },
        { isGlobal: true, isActive: true },
      ],
    });
  }
  async getUserShortcuts(userId) {
    return this.keyboardShortcutRepository.find({
      where: [
        { userId, isActive: true },
        { isGlobal: true, isActive: true },
      ],
    });
  }
  async checkShortcutConflict(shortcutData, excludeId) {
    const { shortcutKey, isGlobal, route, userId } = shortcutData;
    if (!shortcutKey) return false;
    const conditions = {
      isActive: true,
    };
    if (isGlobal) {
      conditions.isGlobal = true;
    } else if (route) {
      conditions.route = route;
    } else if (userId) {
      conditions.userId = userId;
    }
    const conflicts = await this.keyboardShortcutRepository.find({
      where: conditions,
    });
    for (const conflict of conflicts) {
      if (excludeId && conflict.id === excludeId) continue;
      const conflictKey = conflict.shortcutKey;
      if (
        conflictKey.key === shortcutKey.key &&
        conflictKey.altKey === shortcutKey.altKey &&
        conflictKey.ctrlKey === shortcutKey.ctrlKey &&
        conflictKey.shiftKey === shortcutKey.shiftKey &&
        conflictKey.metaKey === shortcutKey.metaKey
      ) {
        return true;
      }
    }
    return false;
  }
  async initializeDefaultShortcuts() {
    const defaultShortcuts = [
      {
        name: 'Skip to Main Content',
        description: 'Skip to main content area',
        shortcutKey: { key: 'm', altKey: true },
        isGlobal: true,
        action: 'focusSection:Main Content',
      },
      {
        name: 'Skip to Navigation',
        description: 'Skip to main navigation',
        shortcutKey: { key: 'n', altKey: true },
        isGlobal: true,
        action: 'focusSection:Main Navigation',
      },
      {
        name: 'Skip to Footer',
        description: 'Skip to footer area',
        shortcutKey: { key: 'f', altKey: true },
        isGlobal: true,
        action: 'focusSection:Footer',
      },
      {
        name: 'Go to Home',
        description: 'Navigate to home page',
        shortcutKey: { key: 'h', altKey: true },
        isGlobal: true,
        action: 'navigate:/',
      },
      {
        name: 'Go to Products',
        description: 'Navigate to products page',
        shortcutKey: { key: 'p', altKey: true },
        isGlobal: true,
        action: 'navigate:/products',
      },
      {
        name: 'Focus Search',
        description: 'Focus the search input',
        shortcutKey: { key: 's', altKey: true },
        isGlobal: true,
        action: 'focusElement:search-input',
      },
    ];
    for (const shortcut of defaultShortcuts) {
      const existingShortcut = await this.keyboardShortcutRepository.findOne({
        where: { name: shortcut.name },
      });
      if (!existingShortcut) {
        await this.createShortcut(shortcut);
        this.logger.log(`Created default shortcut: ${shortcut.name}`);
      }
    }
  }
});
exports.KeyboardShortcutService = KeyboardShortcutService;
exports.KeyboardShortcutService =
  KeyboardShortcutService =
  KeyboardShortcutService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(keyboard_shortcut_entity_1.KeyboardShortcut)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      KeyboardShortcutService,
    );
//# sourceMappingURL=keyboard-shortcut.service.js.map
