import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './services/analytics.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { UserEngagementService } from './services/user-engagement.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { UserEngagement } from './entities/user-engagement.entity';
import { TimeGranularity } from './entities/business-metrics.entity';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly userEngagementService: UserEngagementService,
    private readonly businessMetricsService: BusinessMetricsService,
  ) {}

  @Post('track/search')
  @ApiOperation({ summary: 'Track search query' })
  @ApiResponse({ status: 201, description: 'Search query tracked successfully' })
  async trackSearch(@Body() data: Partial<SearchAnalytics>) {
    return this.analyticsService.trackSearch(data);
  }

  @Post('track/engagement')
  @ApiOperation({ summary: 'Track user engagement' })
  @ApiResponse({ status: 201, description: 'User engagement tracked successfully' })
  async trackEngagement(@Body() data: Partial<UserEngagement>) {
    return this.analyticsService.trackEngagement(data);
  }

  @Post('track/page-view')
  @ApiOperation({ summary: 'Track page view' })
  @ApiResponse({ status: 201, description: 'Page view tracked successfully' })
  async trackPageView(
    @Body()
    body: {
      userId?: string;
      sessionId: string;
      pagePath: string;
      referrer?: string;
      deviceType?: string;
      platform?: string;
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    return this.userEngagementService.trackPageView(
      body.userId || null,
      body.sessionId,
      body.pagePath,
      body.referrer,
      body.deviceType,
      body.platform,
      body.userAgent,
      body.ipAddress,
    );
  }

  @Post('track/product-view')
  @ApiOperation({ summary: 'Track product view' })
  @ApiResponse({ status: 201, description: 'Product view tracked successfully' })
  async trackProductView(
    @Body()
    body: {
      userId?: string;
      sessionId: string;
      productId: string;
      pagePath: string;
      referrer?: string;
      deviceType?: string;
      platform?: string;
    },
  ) {
    return this.userEngagementService.trackProductView(
      body.userId || null,
      body.sessionId,
      body.productId,
      body.pagePath,
      body.referrer,
      body.deviceType,
      body.platform,
    );
  }

  @Post('track/add-to-cart')
  @ApiOperation({ summary: 'Track add to cart' })
  @ApiResponse({ status: 201, description: 'Add to cart tracked successfully' })
  async trackAddToCart(
    @Body()
    body: {
      userId?: string;
      sessionId: string;
      productId: string;
      quantity: number;
      pagePath: string;
      deviceType?: string;
      platform?: string;
    },
  ) {
    return this.userEngagementService.trackAddToCart(
      body.userId || null,
      body.sessionId,
      body.productId,
      body.quantity,
      body.pagePath,
      body.deviceType,
      body.platform,
    );
  }

  @Post('track/checkout-complete')
  @ApiOperation({ summary: 'Track checkout complete' })
  @ApiResponse({ status: 201, description: 'Checkout complete tracked successfully' })
  async trackCheckoutComplete(
    @Body()
    body: {
      userId?: string;
      sessionId: string;
      orderId: string;
      orderItems: any[];
      totalAmount: number;
      pagePath: string;
      deviceType?: string;
      platform?: string;
      merchantId?: string;
    },
  ) {
    // Track the complete order
    await this.analyticsService.trackOrder(
      body.orderId,
      body.userId || null,
      body.sessionId,
      body.orderItems,
      body.totalAmount,
      body.merchantId,
    );

    return { success: true };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  async getDashboardAnalytics(@Query('period') period: number = 30) {
    return this.analyticsService.getDashboardAnalytics(period);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiResponse({ status: 200, description: 'Search analytics retrieved successfully' })
  async getSearchAnalytics(@Query('period') period: number = 30) {
    return this.analyticsService.getSearchAnalytics(period);
  }

  @Get('search/top-queries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top search queries' })
  @ApiResponse({ status: 200, description: 'Top search queries retrieved successfully' })
  async getTopSearchQueries(
    @Query('limit') limit: number = 10,
    @Query('period') period: number = 30,
  ) {
    return this.searchAnalyticsService.getTopSearchQueries(limit, period);
  }

  @Get('search/zero-result-queries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get zero result search queries' })
  @ApiResponse({ status: 200, description: 'Zero result search queries retrieved successfully' })
  async getZeroResultQueries(
    @Query('limit') limit: number = 10,
    @Query('period') period: number = 30,
  ) {
    return this.searchAnalyticsService.getZeroResultQueries(limit, period);
  }

  @Get('search/nlp-comparison')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get NLP vs regular search analytics' })
  @ApiResponse({
    status: 200,
    description: 'NLP vs regular search analytics retrieved successfully',
  })
  async getNlpVsRegularSearchAnalytics(@Query('period') period: number = 30) {
    return this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period);
  }

  @Get('search/personalization-comparison')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized vs regular search analytics' })
  @ApiResponse({
    status: 200,
    description: 'Personalized vs regular search analytics retrieved successfully',
  })
  async getPersonalizedVsRegularSearchAnalytics(@Query('period') period: number = 30) {
    return this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
  }

  @Get('engagement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user engagement analytics' })
  @ApiResponse({ status: 200, description: 'User engagement analytics retrieved successfully' })
  async getUserEngagementAnalytics(@Query('period') period: number = 30) {
    return this.analyticsService.getUserEngagementAnalytics(period);
  }

  @Get('engagement/by-type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user engagement by type' })
  @ApiResponse({ status: 200, description: 'User engagement by type retrieved successfully' })
  async getUserEngagementByType(@Query('period') period: number = 30) {
    return this.userEngagementService.getUserEngagementByType(period);
  }

  @Get('engagement/top-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top viewed products' })
  @ApiResponse({ status: 200, description: 'Top viewed products retrieved successfully' })
  async getTopViewedProducts(
    @Query('limit') limit: number = 10,
    @Query('period') period: number = 30,
  ) {
    return this.userEngagementService.getTopViewedProducts(limit, period);
  }

  @Get('engagement/funnel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user engagement funnel' })
  @ApiResponse({ status: 200, description: 'User engagement funnel retrieved successfully' })
  async getUserEngagementFunnel(@Query('period') period: number = 30) {
    return this.userEngagementService.getUserEngagementFunnel(period);
  }

  @Get('business')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business metrics analytics' })
  @ApiResponse({ status: 200, description: 'Business metrics analytics retrieved successfully' })
  async getBusinessMetricsAnalytics(@Query('period') period: number = 30) {
    return this.analyticsService.getBusinessMetricsAnalytics(period);
  }

  @Get('business/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business metrics summary' })
  @ApiResponse({ status: 200, description: 'Business metrics summary retrieved successfully' })
  async getBusinessMetricsSummary(@Query('period') period: number = 30) {
    return this.businessMetricsService.getMetricsSummary(period);
  }

  @Get('business/revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue metrics' })
  @ApiResponse({ status: 200, description: 'Revenue metrics retrieved successfully' })
  async getRevenueMetrics(
    @Query('period') period: number = 30,
    @Query('granularity') granularity: TimeGranularity = TimeGranularity.DAILY,
  ) {
    return this.businessMetricsService.getRevenueMetrics(period, granularity);
  }
}
