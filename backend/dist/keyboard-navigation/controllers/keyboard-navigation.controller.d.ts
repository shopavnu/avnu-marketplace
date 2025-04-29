import { KeyboardNavigationService } from '../services/keyboard-navigation.service';
import { SectionMappingService } from '../services/section-mapping.service';
import { KeyboardShortcutService } from '../services/keyboard-shortcut.service';
import { FocusStateService } from '../services/focus-state.service';
import { NavigationSection } from '../entities/navigation-section.entity';
import { FocusState } from '../entities/focus-state.entity';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';
export declare class KeyboardNavigationController {
    private readonly keyboardNavigationService;
    private readonly sectionMappingService;
    private readonly keyboardShortcutService;
    private readonly focusStateService;
    constructor(keyboardNavigationService: KeyboardNavigationService, sectionMappingService: SectionMappingService, keyboardShortcutService: KeyboardShortcutService, focusStateService: FocusStateService);
    getNavigationSections(route: string): Promise<NavigationSection[]>;
    getSectionById(id: string): Promise<NavigationSection>;
    createSection(sectionData: Partial<NavigationSection>): Promise<NavigationSection>;
    updateSection(id: string, sectionData: Partial<NavigationSection>): Promise<NavigationSection>;
    deleteSection(id: string): Promise<boolean>;
    getKeyboardShortcuts(userId: string, route?: string): Promise<KeyboardShortcut[]>;
    getShortcutById(id: string): Promise<KeyboardShortcut>;
    createShortcut(shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    updateShortcut(id: string, shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    deleteShortcut(id: string): Promise<boolean>;
    saveUserShortcut(userId: string, shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    resetUserShortcuts(userId: string): Promise<boolean>;
    getFocusState(userId: string, sessionId: string, route?: string): Promise<FocusState | null>;
    saveFocusState(focusData: Partial<FocusState>): Promise<FocusState>;
    clearFocusStates(userId: string, sessionId: string): Promise<boolean>;
    getNavigationState(route: string, userId: string, sessionId: string): Promise<import("../services/keyboard-navigation.service").NavigationStateResponse>;
    initializeNavigationSystem(): Promise<{
        success: boolean;
        message: string;
    }>;
}
