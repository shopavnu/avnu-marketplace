import { KeyboardNavigationService } from '../services/keyboard-navigation.service';
import { NavigationSection } from '../entities/navigation-section.entity';
import { FocusState } from '../entities/focus-state.entity';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';
import { SectionMappingService } from '../services/section-mapping.service';
import { KeyboardShortcutService } from '../services/keyboard-shortcut.service';
import { FocusStateService } from '../services/focus-state.service';
export declare class KeyboardNavigationResolver {
  private readonly keyboardNavigationService;
  private readonly sectionMappingService;
  private readonly keyboardShortcutService;
  private readonly focusStateService;
  constructor(
    keyboardNavigationService: KeyboardNavigationService,
    sectionMappingService: SectionMappingService,
    keyboardShortcutService: KeyboardShortcutService,
    focusStateService: FocusStateService,
  );
  navigationSections(route: string): Promise<NavigationSection[]>;
  keyboardShortcuts(userId: string, route?: string): Promise<KeyboardShortcut[]>;
  lastFocusState(userId: string, sessionId: string, route?: string): Promise<FocusState | null>;
  saveFocusState(
    userId: string,
    sessionId: string,
    route: string,
    sectionId: string,
    elementId?: string,
    elementSelector?: string,
    context?: string,
  ): Promise<FocusState>;
  clearFocusStates(userId: string, sessionId: string): Promise<boolean>;
  saveUserShortcut(
    userId: string,
    name: string,
    description: string,
    key: string,
    altKey?: boolean,
    ctrlKey?: boolean,
    shiftKey?: boolean,
    metaKey?: boolean,
    action?: string,
    route?: string,
    sectionId?: string,
  ): Promise<KeyboardShortcut>;
  resetUserShortcuts(userId: string): Promise<boolean>;
  createNavigationSection(
    name: string,
    route: string,
    selector: string,
    priority: number,
    description?: string,
    ariaLabel?: string,
    parentSectionId?: string,
    childSelectors?: string[],
  ): Promise<NavigationSection>;
  updateNavigationSection(
    id: string,
    name?: string,
    route?: string,
    selector?: string,
    priority?: number,
    description?: string,
    ariaLabel?: string,
    parentSectionId?: string,
    childSelectors?: string[],
    isActive?: boolean,
  ): Promise<NavigationSection>;
  deleteNavigationSection(id: string): Promise<boolean>;
}
