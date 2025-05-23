import { Repository } from 'typeorm';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';
export declare class KeyboardShortcutService {
    private readonly keyboardShortcutRepository;
    private readonly logger;
    constructor(keyboardShortcutRepository: Repository<KeyboardShortcut>);
    createShortcut(shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    updateShortcut(id: string, shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut>;
    deleteShortcut(id: string): Promise<boolean>;
    getShortcutById(id: string): Promise<KeyboardShortcut>;
    getGlobalShortcuts(): Promise<KeyboardShortcut[]>;
    getShortcutsByRoute(route: string): Promise<KeyboardShortcut[]>;
    getUserShortcuts(userId: string): Promise<KeyboardShortcut[]>;
    private checkShortcutConflict;
    initializeDefaultShortcuts(): Promise<void>;
}
