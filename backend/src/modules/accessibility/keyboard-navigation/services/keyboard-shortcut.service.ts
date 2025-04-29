import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';

@Injectable()
export class KeyboardShortcutService {
  private readonly logger = new Logger(KeyboardShortcutService.name);

  constructor(
    @InjectRepository(KeyboardShortcut)
    private readonly keyboardShortcutRepository: Repository<KeyboardShortcut>,
  ) {}

  /**
   * Create a new keyboard shortcut
   * @param shortcutData Keyboard shortcut data
   * @returns Created keyboard shortcut
   */
  async createShortcut(shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut> {
    this.logger.log(`Creating keyboard shortcut: ${shortcutData.name}`);

    // Check for conflicts with existing shortcuts
    if (await this.checkShortcutConflict(shortcutData)) {
      throw new Error('Shortcut key combination conflicts with an existing shortcut');
    }

    const shortcut = this.keyboardShortcutRepository.create(shortcutData);
    return this.keyboardShortcutRepository.save(shortcut);
  }

  /**
   * Update an existing keyboard shortcut
   * @param id Shortcut ID
   * @param shortcutData Updated shortcut data
   * @returns Updated keyboard shortcut
   */
  async updateShortcut(
    id: string,
    shortcutData: Partial<KeyboardShortcut>,
  ): Promise<KeyboardShortcut> {
    this.logger.log(`Updating keyboard shortcut: ${id}`);

    // Check for conflicts with existing shortcuts (excluding this one)
    if (await this.checkShortcutConflict(shortcutData, id)) {
      throw new Error('Shortcut key combination conflicts with an existing shortcut');
    }

    await this.keyboardShortcutRepository.update(id, shortcutData);
    return this.keyboardShortcutRepository.findOne({ where: { id } });
  }

  /**
   * Delete a keyboard shortcut
   * @param id Shortcut ID
   * @returns Boolean indicating success
   */
  async deleteShortcut(id: string): Promise<boolean> {
    this.logger.log(`Deleting keyboard shortcut: ${id}`);
    const result = await this.keyboardShortcutRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Get a keyboard shortcut by ID
   * @param id Shortcut ID
   * @returns Keyboard shortcut
   */
  async getShortcutById(id: string): Promise<KeyboardShortcut> {
    return this.keyboardShortcutRepository.findOne({ where: { id } });
  }

  /**
   * Get all global keyboard shortcuts
   * @returns Array of keyboard shortcuts
   */
  async getGlobalShortcuts(): Promise<KeyboardShortcut[]> {
    return this.keyboardShortcutRepository.find({
      where: { isGlobal: true, isActive: true },
    });
  }

  /**
   * Get all keyboard shortcuts for a specific route
   * @param route Route path
   * @returns Array of keyboard shortcuts
   */
  async getShortcutsByRoute(route: string): Promise<KeyboardShortcut[]> {
    return this.keyboardShortcutRepository.find({
      where: [
        { route, isActive: true },
        { isGlobal: true, isActive: true },
      ],
    });
  }

  /**
   * Get all keyboard shortcuts for a specific user
   * @param userId User ID
   * @returns Array of keyboard shortcuts
   */
  async getUserShortcuts(userId: string): Promise<KeyboardShortcut[]> {
    return this.keyboardShortcutRepository.find({
      where: [
        { userId, isActive: true },
        { isGlobal: true, isActive: true },
      ],
    });
  }

  /**
   * Check if a shortcut key combination conflicts with existing shortcuts
   * @param shortcutData Shortcut data to check
   * @param excludeId Optional ID to exclude from conflict check
   * @returns Boolean indicating if there's a conflict
   */
  private async checkShortcutConflict(
    shortcutData: Partial<KeyboardShortcut>,
    excludeId?: string,
  ): Promise<boolean> {
    const { shortcutKey, isGlobal, route, userId } = shortcutData;

    if (!shortcutKey) return false;

    // Build query conditions
    const conditions: any = {
      isActive: true,
    };

    // For global shortcuts, check against all other global shortcuts
    if (isGlobal) {
      conditions.isGlobal = true;
    }
    // For route-specific shortcuts, check against shortcuts for the same route
    else if (route) {
      conditions.route = route;
    }
    // For user-specific shortcuts, check against shortcuts for the same user
    else if (userId) {
      conditions.userId = userId;
    }

    // Find potential conflicts
    const conflicts = await this.keyboardShortcutRepository.find({
      where: conditions,
    });

    // Check each potential conflict
    for (const conflict of conflicts) {
      // Skip if it's the same shortcut we're updating
      if (excludeId && conflict.id === excludeId) continue;

      // Check if key combinations match
      const conflictKey = conflict.shortcutKey;
      if (
        conflictKey.key === shortcutKey.key &&
        conflictKey.altKey === shortcutKey.altKey &&
        conflictKey.ctrlKey === shortcutKey.ctrlKey &&
        conflictKey.shiftKey === shortcutKey.shiftKey &&
        conflictKey.metaKey === shortcutKey.metaKey
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  /**
   * Initialize default keyboard shortcuts
   * This can be called during application bootstrap
   */
  async initializeDefaultShortcuts(): Promise<void> {
    const defaultShortcuts = [
      // Skip to main content
      {
        name: 'Skip to Main Content',
        description: 'Skip to main content area',
        shortcutKey: { key: 'm', altKey: true },
        isGlobal: true,
        action: 'focusSection:Main Content',
      },
      // Skip to navigation
      {
        name: 'Skip to Navigation',
        description: 'Skip to main navigation',
        shortcutKey: { key: 'n', altKey: true },
        isGlobal: true,
        action: 'focusSection:Main Navigation',
      },
      // Skip to footer
      {
        name: 'Skip to Footer',
        description: 'Skip to footer area',
        shortcutKey: { key: 'f', altKey: true },
        isGlobal: true,
        action: 'focusSection:Footer',
      },
      // Home page
      {
        name: 'Go to Home',
        description: 'Navigate to home page',
        shortcutKey: { key: 'h', altKey: true },
        isGlobal: true,
        action: 'navigate:/',
      },
      // Product listing
      {
        name: 'Go to Products',
        description: 'Navigate to products page',
        shortcutKey: { key: 'p', altKey: true },
        isGlobal: true,
        action: 'navigate:/products',
      },
      // Search focus
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
}
