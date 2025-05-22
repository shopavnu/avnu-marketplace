import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserBehaviorAnalyticsService } from '../services/user-behavior-analytics.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ScrollAnalytics } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';

@ApiTags('user-behavior-analytics')
@Controller('analytics/user-behavior')
export class UserBehaviorAnalyticsController {
  constructor(private readonly userBehaviorAnalyticsService: UserBehaviorAnalyticsService) {}

  @Post('scroll')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track vertical scrolling patterns' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Scrolling patterns tracked successfully',
  })
  @ApiBody({ type: ScrollAnalytics })
  async trackScrolling(@Body() data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics> {
    return this.userBehaviorAnalyticsService.trackScrolling(data);
  }

  @Post('heatmap')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track heatmap data' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Heatmap data tracked successfully' })
  @ApiBody({ type: HeatmapData })
  async trackHeatmapData(@Body() data: Partial<HeatmapData>): Promise<HeatmapData> {
    return this.userBehaviorAnalyticsService.trackHeatmapData(data);
  }

  @Post('heatmap/batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track batch heatmap data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Batch heatmap data tracked successfully',
  })
  @ApiBody({ type: [HeatmapData] })
  async trackBatchHeatmapData(@Body() dataItems: Partial<HeatmapData>[]): Promise<HeatmapData[]> {
    return this.userBehaviorAnalyticsService.trackBatchHeatmapData(dataItems);
  }

  @Get('scroll')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get vertical scrolling analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vertical scrolling analytics retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  async getVerticalScrollingAnalytics(@Query('period') period?: number): Promise<any> {
    return this.userBehaviorAnalyticsService.getVerticalScrollingAnalytics(period || 30);
  }

  @Get('heatmap')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get heatmap analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Heatmap analytics retrieved successfully' })
  @ApiQuery({
    name: 'pagePath',
    required: true,
    type: String,
    description: 'Page path to get heatmap data for',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  @ApiQuery({
    name: 'interactionType',
    required: false,
    enum: InteractionType,
    description: 'Interaction type filter',
  })
  async getHeatmapAnalytics(
    @Query('pagePath') pagePath: string,
    @Query('period') period?: number,
    @Query('interactionType') interactionType?: InteractionType,
  ): Promise<any> {
    return this.userBehaviorAnalyticsService.getHeatmapAnalytics(
      pagePath,
      period || 30,
      interactionType,
    );
  }

  @Get('vertical-funnel')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get vertical navigation conversion funnel' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vertical navigation funnel retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  async getVerticalNavigationFunnel(@Query('period') period?: number): Promise<any> {
    return this.userBehaviorAnalyticsService.getVerticalNavigationFunnel(period || 30);
  }
}
