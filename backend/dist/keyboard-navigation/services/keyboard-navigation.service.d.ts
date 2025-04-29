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
export declare class KeyboardNavigationService {
    private readonly sectionMappingService;
    private readonly focusStateService;
    private readonly keyboardShortcutService;
    private readonly logger;
    constructor(sectionMappingService: SectionMappingService, focusStateService: FocusStateService, keyboardShortcutService: KeyboardShortcutService);
    initializeNavigationSystem(): Promise<void>;
    getNavigationState(route: string, userId: string, sessionId: string): Promise<NavigationStateResponse>;
    saveFocusState(focusData: Partial<FocusState>): Promise<FocusState>;
    getNavigationSections(route: string): Promise<NavigationSection[]>;
    getUserShortcutsForRoute(userId: string, route: string): Promise<KeyboardShortcut[]>;
    saveUserShortcut(userId: string, shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    resetUserShortcuts(userId: string): Promise<boolean>;
    getLastFocusState(userId: string, sessionId: string): Promise<FocusState | null>;
}
