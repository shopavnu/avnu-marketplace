import { Resolver, Query, Mutation, Args, Context, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { BehaviorType } from './entities/user-behavior.entity';

@Resolver()
export class PersonalizationResolver {
  constructor(
    private readonly personalizationService: PersonalizationService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly userBehaviorService: UserBehaviorService,
  ) {}

  @Mutation(() => UserPreferences)
  @UseGuards(GqlAuthGuard)
  async createUserPreferences(
    @Args('input') createUserPreferencesDto: CreateUserPreferencesDto,
    @Context() context,
  ) {
    // Override userId with authenticated user's ID
    createUserPreferencesDto.userId = context.req.user.id;
    return this.userPreferencesService.create(createUserPreferencesDto);
  }

  @Query(() => UserPreferences)
  @UseGuards(GqlAuthGuard)
  async getUserPreferences(@Context() context) {
    return this.userPreferencesService.findByUserId(context.req.user.id);
  }

  @Mutation(() => UserPreferences)
  @UseGuards(GqlAuthGuard)
  async updateUserPreferences(
    @Args('input') updateUserPreferencesDto: UpdateUserPreferencesDto,
    @Context() context,
  ) {
    return this.userPreferencesService.update(context.req.user.id, updateUserPreferencesDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async trackEntityView(
    @Args('entityType') entityType: 'product' | 'category' | 'brand' | 'merchant',
    @Args('entityId') entityId: string,
    @Context() context,
  ) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      BehaviorType.VIEW,
      entityId,
      entityType,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async trackEntityFavorite(
    @Args('entityType') entityType: 'product' | 'category' | 'brand' | 'merchant',
    @Args('entityId') entityId: string,
    @Context() context,
  ) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      BehaviorType.FAVORITE,
      entityId,
      entityType,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async trackSearch(@Args('query') query: string, @Context() context) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      BehaviorType.SEARCH,
      query,
      'search',
      query,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async trackAddToCart(
    @Context() context,
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int, nullable: true }) quantity?: number,
  ): Promise<boolean> {
    const metadata = quantity ? JSON.stringify({ quantity }) : undefined;

    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      BehaviorType.ADD_TO_CART,
      productId,
      'product',
      metadata,
    );
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async trackPurchase(
    @Context() context,
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int, nullable: true }) quantity?: number,
    @Args('price', { type: () => Float, nullable: true }) price?: number,
  ): Promise<boolean> {
    const metadata = JSON.stringify({
      quantity: quantity || 1,
      price,
    });

    await this.personalizationService.trackInteractionAndUpdatePreferences(
      context.req.user.id,
      BehaviorType.PURCHASE,
      productId,
      'product',
      metadata,
    );
    return true;
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async getPersonalizedRecommendations(
    @Context() context,
    @Args('limit', { nullable: true }) limit?: number,
  ) {
    return this.personalizationService.generatePersonalizedRecommendations(
      context.req.user.id,
      limit || 10,
    );
  }

  @Query(() => [UserBehavior])
  @UseGuards(GqlAuthGuard)
  async getMostViewedProducts(@Context() context) {
    return this.userBehaviorService.getMostViewedProducts(context.req.user.id);
  }

  @Query(() => [UserBehavior])
  @UseGuards(GqlAuthGuard)
  async getFavoriteProducts(@Context() context) {
    return this.userBehaviorService.getFavoriteProducts(context.req.user.id);
  }

  @Query(() => [UserBehavior])
  @UseGuards(GqlAuthGuard)
  async getRecentSearches(@Context() context) {
    return this.userBehaviorService.getMostSearchedQueries(context.req.user.id);
  }
}
