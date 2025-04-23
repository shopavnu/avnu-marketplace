import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BehaviorType } from './entities/user-behavior.entity';

@ApiTags('personalization')
@Controller('personalization')
export class PersonalizationController {
  constructor(
    private readonly personalizationService: PersonalizationService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly userBehaviorService: UserBehaviorService,
  ) {}

  @Post('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user preferences' })
  @ApiResponse({ status: 201, description: 'User preferences created successfully' })
  async createPreferences(
    @Request() req,
    @Body() createUserPreferencesDto: CreateUserPreferencesDto,
  ) {
    // Override userId with authenticated user's ID
    createUserPreferencesDto.userId = req.user.id;
    return this.userPreferencesService.create(createUserPreferencesDto);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getPreferences(@Request() req) {
    return this.userPreferencesService.findByUserId(req.user.id);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences updated successfully' })
  async updatePreferences(
    @Request() req,
    @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
  ) {
    return this.userPreferencesService.update(req.user.id, updateUserPreferencesDto);
  }

  @Post('track/view/:entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track entity view' })
  @ApiResponse({ status: 201, description: 'View tracked successfully' })
  async trackView(
    @Request() req,
    @Param('entityType') entityType: 'product' | 'category' | 'brand' | 'merchant',
    @Param('entityId') entityId: string,
  ) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      BehaviorType.VIEW,
      entityId,
      entityType,
    );
    return { success: true };
  }

  @Post('track/favorite/:entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track entity favorite' })
  @ApiResponse({ status: 201, description: 'Favorite tracked successfully' })
  async trackFavorite(
    @Request() req,
    @Param('entityType') entityType: 'product' | 'category' | 'brand' | 'merchant',
    @Param('entityId') entityId: string,
  ) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      BehaviorType.FAVORITE,
      entityId,
      entityType,
    );
    return { success: true };
  }

  @Post('track/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track search query' })
  @ApiResponse({ status: 201, description: 'Search tracked successfully' })
  async trackSearch(@Request() req, @Body() body: { query: string }) {
    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      BehaviorType.SEARCH,
      body.query,
      'search',
      body.query,
    );
    return { success: true };
  }

  @Post('track/add-to-cart/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track add to cart' })
  @ApiResponse({ status: 201, description: 'Add to cart tracked successfully' })
  async trackAddToCart(
    @Request() req,
    @Param('productId') productId: string,
    @Body() body: { quantity?: number },
  ) {
    const metadata = body.quantity ? JSON.stringify({ quantity: body.quantity }) : undefined;

    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      BehaviorType.ADD_TO_CART,
      productId,
      'product',
      metadata,
    );
    return { success: true };
  }

  @Post('track/purchase/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track purchase' })
  @ApiResponse({ status: 201, description: 'Purchase tracked successfully' })
  async trackPurchase(
    @Request() req,
    @Param('productId') productId: string,
    @Body() body: { quantity?: number; price?: number },
  ) {
    const metadata = JSON.stringify({
      quantity: body.quantity || 1,
      price: body.price,
    });

    await this.personalizationService.trackInteractionAndUpdatePreferences(
      req.user.id,
      BehaviorType.PURCHASE,
      productId,
      'product',
      metadata,
    );
    return { success: true };
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(@Request() req) {
    const productIds = await this.personalizationService.generatePersonalizedRecommendations(
      req.user.id,
    );
    return { productIds };
  }

  @Post('enhance-search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enhance search with personalization' })
  @ApiResponse({ status: 200, description: 'Search enhanced successfully' })
  async enhanceSearch(@Request() req, @Body() body: { query: string; params?: any }) {
    return this.personalizationService.enhanceSearchWithPersonalization(
      req.user.id,
      body.query,
      body.params,
    );
  }

  @Get('behavior/viewed-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get most viewed products' })
  @ApiResponse({ status: 200, description: 'Most viewed products retrieved successfully' })
  async getMostViewedProducts(@Request() req) {
    return this.userBehaviorService.getMostViewedProducts(req.user.id);
  }

  @Get('behavior/favorite-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get favorite products' })
  @ApiResponse({ status: 200, description: 'Favorite products retrieved successfully' })
  async getFavoriteProducts(@Request() req) {
    return this.userBehaviorService.getFavoriteProducts(req.user.id);
  }

  @Get('behavior/recent-searches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent searches' })
  @ApiResponse({ status: 200, description: 'Recent searches retrieved successfully' })
  async getRecentSearches(@Request() req) {
    return this.userBehaviorService.getMostSearchedQueries(req.user.id);
  }
}
