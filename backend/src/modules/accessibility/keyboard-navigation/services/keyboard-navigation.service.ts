import { Injectable, Logger } from '@nestjs/common';
import { SectionMappingService } from './section-mapping.service';
import { FocusStateService } from './focus-state.service';
import { KeyboardShortcutService } from './keyboard-shortcut.service';
import { NavigationSection } from '../entities/navigation-section.entity';
import { FocusState } from '../entities/focus-state.entity';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';

export interface NavigationStateResponse {
  sections: NavigationSection[];
  shortcuts: KeyboardShortcut[];
  currentFocus?: FocusState;
  nextFocusableSection?: NavigationSection;
  previousFocusableSection?: NavigationSection;
}

@Injectable()
export class KeyboardNavigationService {
  private readonly logger = new Logger(KeyboardNavigationService.name);

  constructor(
    private readonly sectionMappingService: SectionMappingService,
    private readonly focusStateService: FocusStateService,
    private readonly keyboardShortcutService: KeyboardShortcutService,
  ) {}

  /**
   * Initialize the keyboard navigation system
   * This should be called during application bootstrap
   */
  async initializeNavigationSystem(): Promise<void> {
    this.logger.log('Initializing keyboard navigation system');

    // Initialize default sections and shortcuts
    await this.sectionMappingService.initializeDefaultSections();
    await this.keyboardShortcutService.initializeDefaultShortcuts();

    this.logger.log('Keyboard navigation system initialized successfully');
  }

  /**
   * Get navigation state for a specific route
   * @param route Route path
   * @param userId User ID
   * @param sessionId Session ID
   * @returns Navigation state response
   */
  async getNavigationState(
    route: string,
    userId: string,
    sessionId: string,
  ): Promise<NavigationStateResponse> {
    // Get sections for the route (including global sections with '*' route)
    const routeSections = await this.sectionMappingService.getSectionsByRoute(route);
    const globalSections = await this.sectionMappingService.getSectionsByRoute('*');

    // Combine and sort sections by priority
    const sections = [...routeSections, ...globalSections].sort((a, b) => a.priority - b.priority);

    // Get shortcuts for the route (including global shortcuts)
    const shortcuts = await this.keyboardShortcutService.getShortcutsByRoute(route);

    // Get current focus state if available
    const currentFocus = await this.focusStateService.getRouteFocusState(userId, sessionId, route);

    // Determine next and previous focusable sections based on current focus
    let nextFocusableSection: NavigationSection = null;
    let previousFocusableSection: NavigationSection = null;

    if (currentFocus && currentFocus.sectionId) {
      const currentSectionIndex = sections.findIndex(s => s.id === currentFocus.sectionId);

      if (currentSectionIndex !== -1) {
        // Find next focusable section
        if (currentSectionIndex < sections.length - 1) {
          nextFocusableSection = sections[currentSectionIndex + 1];
        }

        // Find previous focusable section
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

  /**
   * Save the current focus state
   * @param focusData Focus state data
   * @returns Saved focus state
   */
  async saveFocusState(focusData: Partial<FocusState>): Promise<FocusState> {
    return this.focusStateService.saveFocusState(focusData);
  }

  /**
   * Get navigation sections for a specific route
   * @param route Route path
   * @returns Array of navigation sections
   */
  async getNavigationSections(route: string): Promise<NavigationSection[]> {
    const routeSections = await this.sectionMappingService.getSectionsByRoute(route);
    const globalSections = await this.sectionMappingService.getSectionsByRoute('*');

    // Combine and sort sections by priority
    return [...routeSections, ...globalSections].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get keyboard shortcuts for a user and route
   * @param userId User ID
   * @param route Route path
   * @returns Array of keyboard shortcuts
   */
  async getUserShortcutsForRoute(userId: string, route: string): Promise<KeyboardShortcut[]> {
    const userShortcuts = await this.keyboardShortcutService.getUserShortcuts(userId);
    const routeShortcuts = await this.keyboardShortcutService.getShortcutsByRoute(route);

    // Combine shortcuts, giving preference to user-specific ones
    const shortcutMap = new Map<string, KeyboardShortcut>();

    // Add route shortcuts first
    routeShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.name, shortcut);
    });

    // Then add user shortcuts (overriding route shortcuts if needed)
    userShortcuts.forEach(shortcut => {
      shortcutMap.set(shortcut.name, shortcut);
    });

    return Array.from(shortcutMap.values());
  }

  /**
   * Create or update a user-specific keyboard shortcut
   * @param userId User ID
   * @param shortcutData Keyboard shortcut data
   * @returns Created or updated keyboard shortcut
   */
  async saveUserShortcut(
    userId: string,
    shortcutData: Partial<KeyboardShortcut>,
  ): Promise<KeyboardShortcut> {
    // Ensure userId is set
    shortcutData.userId = userId;

    // Check if shortcut already exists for this user
    const existingShortcut = await this.keyboardShortcutService.getShortcutById(shortcutData.id);

    if (existingShortcut && existingShortcut.userId === userId) {
      // Update existing shortcut
      return this.keyboardShortcutService.updateShortcut(existingShortcut.id, shortcutData);
    } else {
      // Create new shortcut
      return this.keyboardShortcutService.createShortcut(shortcutData);
    }
  }

  /**
   * Reset user keyboard shortcuts to default
   * @param userId User ID
   * @returns Boolean indicating success
   */
  async resetUserShortcuts(userId: string): Promise<boolean> {
    this.logger.log(`Resetting keyboard shortcuts for user ${userId}`);

    // Get all user-specific shortcuts
    const userShortcuts = await this.keyboardShortcutService.getUserShortcuts(userId);

    // Filter to only include non-global shortcuts
    const userCustomShortcuts = userShortcuts.filter(shortcut => !shortcut.isGlobal);

    // Delete each user-specific shortcut
    for (const shortcut of userCustomShortcuts) {
      await this.keyboardShortcutService.deleteShortcut(shortcut.id);
    }

    return true;
  }

  /**
   * Get the last focus state for a user
   * @param userId User ID
   * @param sessionId Session ID
   * @returns Focus state or null if not found
   */
  async getLastFocusState(userId: string, sessionId: string): Promise<FocusState | null> {
    return this.focusStateService.getLastFocusState(userId, sessionId);
  }
}
