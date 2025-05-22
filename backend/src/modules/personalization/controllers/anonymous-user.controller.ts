import { Controller, Post, Get, Body, Req, Res, Query, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AnonymousUserService } from '../services/anonymous-user.service';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';
import { ProductsService } from '../../products/products.service';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';

/**
 * Controller for anonymous user tracking and personalization
 */
@Controller('api/personalization')
export class AnonymousUserController {
  constructor(
    private readonly anonymousUserService: AnonymousUserService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Track user interaction
   */
  @Post('track')
  async trackInteraction(
    @Body('type') type: string,
    @Body('data') data: Record<string, any>,
    @Body('durationMs') durationMs: number,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    // Convert string type to enum
    const interactionType = type as SessionInteractionType;

    await this.anonymousUserService.trackInteraction(req, res, interactionType, data, durationMs);

    return { success: true };
  }

  /**
   * Get recent searches for the current user
   */
  @Get('recent-searches')
  @UseGuards(OptionalAuthGuard)
  async getRecentSearches(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('limit') limit?: number,
  ): Promise<{ searches: any[] }> {
    // If user is authenticated, get from user profile
    if (req.user) {
      // TODO: Implement user profile search history
      return { searches: [] };
    }

    // Otherwise, get from anonymous user data
    const limitNumber = limit ? Number(limit) : 5;
    const searches = await this.anonymousUserService.getRecentSearches(req, res, limitNumber);

    return { searches };
  }

  /**
   * Get recently viewed products for the current user
   */
  @Get('recently-viewed')
  @UseGuards(OptionalAuthGuard)
  async getRecentlyViewedProducts(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('limit') limit?: number,
  ): Promise<{ products: any[] }> {
    // If user is authenticated, get from user profile
    if (req.user) {
      // TODO: Implement user profile recently viewed products
      return { products: [] };
    }

    // Otherwise, get from anonymous user data
    const limitNumber = limit ? Number(limit) : 10;
    const recentlyViewed = await this.anonymousUserService.getRecentlyViewedProducts(
      req,
      res,
      limitNumber,
    );

    // Fetch full product data
    const productIds = recentlyViewed.map(item => item.productId);
    const products = await this.productsService.findByIds(productIds);

    // Merge with view data
    const productsWithViewData = products.map(product => {
      const viewData = recentlyViewed.find(item => item.productId === product.id);
      return {
        ...product,
        viewedAt: viewData?.timestamp,
        viewTimeSeconds: viewData?.viewTimeSeconds,
      };
    });

    return { products: productsWithViewData };
  }

  /**
   * Get personalized recommendations based on anonymous user profile
   */
  @Get('recommendations')
  @UseGuards(OptionalAuthGuard)
  async getPersonalizedRecommendations(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('limit') limit?: number,
  ): Promise<{ products: any[] }> {
    // If user is authenticated, get from user profile
    if (req.user) {
      // TODO: Implement user profile recommendations
      return { products: [] };
    }

    // Get personalization weights
    const weights = await this.anonymousUserService.getPersonalizationWeights(req, res);

    // Get preferred categories and brands
    const preferredCategories = Object.entries(weights.categories || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([id]) => id);

    const preferredBrands = Object.entries(weights.brands || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([id]) => id);

    // Get recommendations based on weights
    const limitNumber = limit ? Number(limit) : 10;

    // Create a virtual user ID from the top preferences
    const virtualUserId = `anon_${preferredCategories[0] || ''}_${preferredBrands[0] || ''}`;

    // Get recommended products using the virtual user ID
    const recommendedProducts = await this.productsService.getRecommendedProducts(
      virtualUserId,
      limitNumber,
    );

    return { products: recommendedProducts };
  }

  /**
   * Clear all anonymous user data
   */
  @Post('clear')
  clearAnonymousUserData(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): { success: boolean } {
    this.anonymousUserService.clearAnonymousUserData(req, res);
    return { success: true };
  }
}
