import { Controller, Get, Post, Body, Param, Query, Delete, Put } from '@nestjs/common';
import { KeyboardNavigationService } from '../services/keyboard-navigation.service';
import { SectionMappingService } from '../services/section-mapping.service';
import { KeyboardShortcutService } from '../services/keyboard-shortcut.service';
import { FocusStateService } from '../services/focus-state.service';
import { NavigationSection } from '../entities/navigation-section.entity';
import { FocusState } from '../entities/focus-state.entity';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';

@Controller('accessibility/keyboard-navigation')
export class KeyboardNavigationController {
  constructor(
    private readonly keyboardNavigationService: KeyboardNavigationService,
    private readonly sectionMappingService: SectionMappingService,
    private readonly keyboardShortcutService: KeyboardShortcutService,
    private readonly focusStateService: FocusStateService,
  ) {}

  @Get('sections')
  async getNavigationSections(@Query('route') route: string): Promise<NavigationSection[]> {
    return this.keyboardNavigationService.getNavigationSections(route);
  }

  @Get('sections/:id')
  async getSectionById(@Param('id') id: string): Promise<NavigationSection> {
    return this.sectionMappingService.getSectionById(id);
  }

  @Post('sections')
  async createSection(@Body() sectionData: Partial<NavigationSection>): Promise<NavigationSection> {
    return this.sectionMappingService.createSection(sectionData);
  }

  @Put('sections/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() sectionData: Partial<NavigationSection>,
  ): Promise<NavigationSection> {
    return this.sectionMappingService.updateSection(id, sectionData);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: string): Promise<boolean> {
    return this.sectionMappingService.deleteSection(id);
  }

  @Get('shortcuts')
  async getKeyboardShortcuts(
    @Query('userId') userId: string,
    @Query('route') route?: string,
  ): Promise<KeyboardShortcut[]> {
    if (route) {
      return this.keyboardNavigationService.getUserShortcutsForRoute(userId, route);
    } else {
      return this.keyboardShortcutService.getUserShortcuts(userId);
    }
  }

  @Get('shortcuts/:id')
  async getShortcutById(@Param('id') id: string): Promise<KeyboardShortcut> {
    return this.keyboardShortcutService.getShortcutById(id);
  }

  @Post('shortcuts')
  async createShortcut(@Body() shortcutData: Partial<KeyboardShortcut>): Promise<KeyboardShortcut> {
    return this.keyboardShortcutService.createShortcut(shortcutData);
  }

  @Put('shortcuts/:id')
  async updateShortcut(
    @Param('id') id: string,
    @Body() shortcutData: Partial<KeyboardShortcut>,
  ): Promise<KeyboardShortcut> {
    return this.keyboardShortcutService.updateShortcut(id, shortcutData);
  }

  @Delete('shortcuts/:id')
  async deleteShortcut(@Param('id') id: string): Promise<boolean> {
    return this.keyboardShortcutService.deleteShortcut(id);
  }

  @Post('shortcuts/user/:userId')
  async saveUserShortcut(
    @Param('userId') userId: string,
    @Body() shortcutData: Partial<KeyboardShortcut>,
  ): Promise<KeyboardShortcut> {
    return this.keyboardNavigationService.saveUserShortcut(userId, shortcutData);
  }

  @Delete('shortcuts/user/:userId/reset')
  async resetUserShortcuts(@Param('userId') userId: string): Promise<boolean> {
    return this.keyboardNavigationService.resetUserShortcuts(userId);
  }

  @Get('focus-state')
  async getFocusState(
    @Query('userId') userId: string,
    @Query('sessionId') sessionId: string,
    @Query('route') route?: string,
  ): Promise<FocusState | null> {
    if (route) {
      return this.focusStateService.getRouteFocusState(userId, sessionId, route);
    } else {
      return this.focusStateService.getLastFocusState(userId, sessionId);
    }
  }

  @Post('focus-state')
  async saveFocusState(@Body() focusData: Partial<FocusState>): Promise<FocusState> {
    return this.focusStateService.saveFocusState(focusData);
  }

  @Delete('focus-state')
  async clearFocusStates(
    @Query('userId') userId: string,
    @Query('sessionId') sessionId: string,
  ): Promise<boolean> {
    return this.focusStateService.clearFocusStates(userId, sessionId);
  }

  @Get('navigation-state')
  async getNavigationState(
    @Query('route') route: string,
    @Query('userId') userId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.keyboardNavigationService.getNavigationState(route, userId, sessionId);
  }

  @Post('initialize')
  async initializeNavigationSystem() {
    await this.keyboardNavigationService.initializeNavigationSystem();
    return { success: true, message: 'Keyboard navigation system initialized successfully' };
  }
}
