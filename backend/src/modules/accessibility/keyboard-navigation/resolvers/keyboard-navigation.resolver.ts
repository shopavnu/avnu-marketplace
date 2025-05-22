import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { KeyboardNavigationService } from '../services/keyboard-navigation.service';
import { NavigationSection } from '../entities/navigation-section.entity';
import { FocusState } from '../entities/focus-state.entity';
import { KeyboardShortcut } from '../entities/keyboard-shortcut.entity';
import { SectionMappingService } from '../services/section-mapping.service';
import { KeyboardShortcutService } from '../services/keyboard-shortcut.service';
import { FocusStateService } from '../services/focus-state.service';

@Resolver()
export class KeyboardNavigationResolver {
  constructor(
    private readonly keyboardNavigationService: KeyboardNavigationService,
    private readonly sectionMappingService: SectionMappingService,
    private readonly keyboardShortcutService: KeyboardShortcutService,
    private readonly focusStateService: FocusStateService,
  ) {}

  @Query(() => [NavigationSection])
  async navigationSections(@Args('route') route: string): Promise<NavigationSection[]> {
    return this.keyboardNavigationService.getNavigationSections(route);
  }

  @Query(() => [KeyboardShortcut])
  async keyboardShortcuts(
    @Args('userId') userId: string,
    @Args('route', { nullable: true }) route?: string,
  ): Promise<KeyboardShortcut[]> {
    if (route) {
      return this.keyboardNavigationService.getUserShortcutsForRoute(userId, route);
    } else {
      return this.keyboardShortcutService.getUserShortcuts(userId);
    }
  }

  @Query(() => FocusState, { nullable: true })
  async lastFocusState(
    @Args('userId') userId: string,
    @Args('sessionId') sessionId: string,
    @Args('route', { nullable: true }) route?: string,
  ): Promise<FocusState | null> {
    if (route) {
      return this.focusStateService.getRouteFocusState(userId, sessionId, route);
    } else {
      return this.focusStateService.getLastFocusState(userId, sessionId);
    }
  }

  @Mutation(() => FocusState)
  async saveFocusState(
    @Args('userId') userId: string,
    @Args('sessionId') sessionId: string,
    @Args('route') route: string,
    @Args('sectionId') sectionId: string,
    @Args('elementId', { nullable: true }) elementId?: string,
    @Args('elementSelector', { nullable: true }) elementSelector?: string,
    @Args('context', { nullable: true }) context?: string,
  ): Promise<FocusState> {
    return this.focusStateService.saveFocusState({
      userId,
      sessionId,
      route,
      sectionId,
      elementId,
      elementSelector,
      context,
      lastActive: new Date(),
      isActive: true,
    });
  }

  @Mutation(() => Boolean)
  async clearFocusStates(
    @Args('userId') userId: string,
    @Args('sessionId') sessionId: string,
  ): Promise<boolean> {
    return this.focusStateService.clearFocusStates(userId, sessionId);
  }

  @Mutation(() => KeyboardShortcut)
  async saveUserShortcut(
    @Args('userId') userId: string,
    @Args('name') name: string,
    @Args('description') description: string,
    @Args('key') key: string,
    @Args('altKey', { nullable: true }) altKey?: boolean,
    @Args('ctrlKey', { nullable: true }) ctrlKey?: boolean,
    @Args('shiftKey', { nullable: true }) shiftKey?: boolean,
    @Args('metaKey', { nullable: true }) metaKey?: boolean,
    @Args('action', { nullable: true }) action?: string,
    @Args('route', { nullable: true }) route?: string,
    @Args('sectionId', { nullable: true }) sectionId?: string,
  ): Promise<KeyboardShortcut> {
    return this.keyboardNavigationService.saveUserShortcut(userId, {
      name,
      description,
      shortcutKey: {
        key,
        altKey,
        ctrlKey,
        shiftKey,
        metaKey,
      },
      action,
      route,
      sectionId,
      userId,
      isGlobal: false,
      isActive: true,
    });
  }

  @Mutation(() => Boolean)
  async resetUserShortcuts(@Args('userId') userId: string): Promise<boolean> {
    return this.keyboardNavigationService.resetUserShortcuts(userId);
  }

  @Mutation(() => NavigationSection)
  async createNavigationSection(
    @Args('name') name: string,
    @Args('route') route: string,
    @Args('selector') selector: string,
    @Args('priority') priority: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('ariaLabel', { nullable: true }) ariaLabel?: string,
    @Args('parentSectionId', { nullable: true }) parentSectionId?: string,
    @Args('childSelectors', { type: () => [String], nullable: true }) childSelectors?: string[],
  ): Promise<NavigationSection> {
    return this.sectionMappingService.createSection({
      name,
      route,
      selector,
      priority,
      description,
      ariaLabel,
      parentSectionId,
      childSelectors,
      isActive: true,
    });
  }

  @Mutation(() => NavigationSection)
  async updateNavigationSection(
    @Args('id') id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('route', { nullable: true }) route?: string,
    @Args('selector', { nullable: true }) selector?: string,
    @Args('priority', { nullable: true }) priority?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('ariaLabel', { nullable: true }) ariaLabel?: string,
    @Args('parentSectionId', { nullable: true }) parentSectionId?: string,
    @Args('childSelectors', { type: () => [String], nullable: true }) childSelectors?: string[],
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<NavigationSection> {
    return this.sectionMappingService.updateSection(id, {
      name,
      route,
      selector,
      priority,
      description,
      ariaLabel,
      parentSectionId,
      childSelectors,
      isActive,
    });
  }

  @Mutation(() => Boolean)
  async deleteNavigationSection(@Args('id') id: string): Promise<boolean> {
    return this.sectionMappingService.deleteSection(id);
  }
}
