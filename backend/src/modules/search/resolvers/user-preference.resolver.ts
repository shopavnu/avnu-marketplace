import { Resolver, Mutation, Args /* Query */ } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { PreferenceCollectorService } from '../services/preference-collector.service';
import { UserPreferenceService } from '../services/user-preference.service';
import {} from /* Product */ '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';
import { UserPreferencesSurveyInput } from '../dto/user-preferences-survey.dto';
import { SearchFiltersInput } from '../dto/search-filters.input';

import { registerEnumType } from '@nestjs/graphql';

// Enum for preference types in GraphQL
enum PreferenceType {
  CATEGORIES = 'categories',
  BRANDS = 'brands',
  VALUES = 'values',
  PRICE_RANGES = 'priceRanges',
}

registerEnumType(PreferenceType, {
  name: 'PreferenceType',
  description: 'Types of user preferences that can be managed',
});

/**
 * GraphQL resolver for user preference collection and management
 */
@Resolver()
export class UserPreferenceResolver {
  constructor(
    private readonly preferenceCollectorService: PreferenceCollectorService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Track a search query for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackSearch(
    @CurrentUser() user: User,
    @Args('query') query: string,
    @Args('filters', { nullable: true, type: () => SearchFiltersInput }) filters?: SearchFiltersInput,
    @Args('resultCount', { nullable: true, type: () => Number }) resultCount?: number,
  ): Promise<boolean> {
    return this.preferenceCollectorService.trackSearch(user.id, query, filters?.filters, resultCount);
  }

  /**
   * Track a product view for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackProductView(
    @CurrentUser() user: User,
    @Args('productId') productId: string,
    @Args('referrer', { nullable: true }) referrer?: string,
  ): Promise<boolean> {
    // Get product by ID (using findByIds which returns an array)
    const products = await this.productsService.findByIds([productId]);
    const product = products.length > 0 ? products[0] : null;
    if (!product) {
      return false;
    }

    return this.preferenceCollectorService.trackProductView(user.id, product, referrer);
  }

  /**
   * Track a product added to cart for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackAddToCart(
    @CurrentUser() user: User,
    @Args('productId') productId: string,
    @Args('quantity', { nullable: true, defaultValue: 1 }) quantity: number,
  ): Promise<boolean> {
    // Get product by ID (using findByIds which returns an array)
    const products = await this.productsService.findByIds([productId]);
    const product = products.length > 0 ? products[0] : null;
    if (!product) {
      return false;
    }

    return this.preferenceCollectorService.trackAddToCart(user.id, product, quantity);
  }

  /**
   * Track a product purchase for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackPurchase(
    @CurrentUser() user: User,
    @Args('productId') productId: string,
    @Args('quantity', { nullable: true, defaultValue: 1 }) quantity: number,
  ): Promise<boolean> {
    // Get product by ID (using findByIds which returns an array)
    const products = await this.productsService.findByIds([productId]);
    const product = products.length > 0 ? products[0] : null;
    if (!product) {
      return false;
    }

    return this.preferenceCollectorService.trackPurchase(user.id, product, quantity);
  }

  /**
   * Track filter application for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackFilterApply(
    @CurrentUser() user: User,
    @Args('filters', { type: () => SearchFiltersInput }) filters: SearchFiltersInput,
  ): Promise<boolean> {
    return this.preferenceCollectorService.trackFilterApply(user.id, filters.filters);
  }

  /**
   * Track category click for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackCategoryClick(
    @CurrentUser() user: User,
    @Args('category') category: string,
  ): Promise<boolean> {
    return this.preferenceCollectorService.trackCategoryClick(user.id, category);
  }

  /**
   * Track brand click for a user
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async trackBrandClick(@CurrentUser() user: User, @Args('brand') brand: string): Promise<boolean> {
    return this.preferenceCollectorService.trackBrandClick(user.id, brand);
  }

  /**
   * Submit initial preferences survey
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async submitPreferencesSurvey(
    @CurrentUser() user: User,
    @Args('surveyData') surveyData: UserPreferencesSurveyInput,
  ): Promise<boolean> {
    return this.preferenceCollectorService.processPreferencesSurvey(user.id, surveyData);
  }

  /**
   * Clear user preferences cache
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async clearPreferencesCache(): Promise<boolean> {
    this.userPreferenceService.clearCache();
    return true;
  }

  /**
   * Apply time-based decay to a user's preferences
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async applyPreferenceDecay(@CurrentUser() user: User): Promise<boolean> {
    return this.preferenceCollectorService.applyPreferenceDecay(user.id);
  }

  /**
   * Apply immediate decay to a specific preference type
   * Useful when a user explicitly changes their interests
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async applyImmediateDecay(
    @CurrentUser() user: User,
    @Args('preferenceType') preferenceType: PreferenceType,
    @Args('decayFactor', { nullable: true, defaultValue: 0.5 }) decayFactor: number,
  ): Promise<boolean> {
    return this.preferenceCollectorService.applyImmediateDecay(
      user.id,
      preferenceType,
      decayFactor,
    );
  }
}
