declare class ShortcutKey {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}
export declare class KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  shortcutKey: ShortcutKey;
  userId?: string;
  sectionId?: string;
  route?: string;
  action?: string;
  isGlobal: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export {};
