import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyboardNavigationService } from './services/keyboard-navigation.service';
import { KeyboardNavigationController } from './controllers/keyboard-navigation.controller';
import { KeyboardNavigationResolver } from './resolvers/keyboard-navigation.resolver';
import { FocusStateService } from './services/focus-state.service';
import { KeyboardShortcutService } from './services/keyboard-shortcut.service';
import { SectionMappingService } from './services/section-mapping.service';
import { NavigationSection } from './entities/navigation-section.entity';
import { FocusState } from './entities/focus-state.entity';
import { KeyboardShortcut } from './entities/keyboard-shortcut.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavigationSection, FocusState, KeyboardShortcut])],
  controllers: [KeyboardNavigationController],
  providers: [
    KeyboardNavigationService,
    KeyboardNavigationResolver,
    FocusStateService,
    KeyboardShortcutService,
    SectionMappingService,
  ],
  exports: [
    KeyboardNavigationService,
    FocusStateService,
    KeyboardShortcutService,
    SectionMappingService,
  ],
})
export class KeyboardNavigationModule {}
