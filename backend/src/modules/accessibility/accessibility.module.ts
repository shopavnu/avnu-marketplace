import { Module } from '@nestjs/common';
import { KeyboardNavigationModule } from './keyboard-navigation/keyboard-navigation.module';

@Module({
  imports: [KeyboardNavigationModule],
  exports: [KeyboardNavigationModule],
})
export class AccessibilityModule {}
