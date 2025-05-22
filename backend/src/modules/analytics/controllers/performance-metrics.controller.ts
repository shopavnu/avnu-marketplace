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
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ApiPerformanceMetric } from '../entities/api-performance-metric.entity';
import { ClientPerformanceMetric } from '../entities/client-performance-metric.entity';
import { QueryPerformanceMetric } from '../entities/query-performance-metric.entity';

@ApiTags('performance-metrics')
@Controller('analytics/performance')
export class PerformanceMetricsController {
  constructor(private readonly performanceMetricsService: PerformanceMetricsService) {}

  @Post('api')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track API response time' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'API response time tracked successfully',
  })
  @ApiBody({ type: ApiPerformanceMetric })
  async trackApiResponseTime(
    @Body() data: Partial<ApiPerformanceMetric>,
  ): Promise<ApiPerformanceMetric> {
    return this.performanceMetricsService.trackApiResponseTime(
      data.endpoint,
      data.method,
      data.responseTime,
      data.statusCode,
      data.userId,
      data.sessionId,
    );
  }

  @Post('client')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track client-side performance metrics' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Client performance metrics tracked successfully',
  })
  @ApiBody({ type: ClientPerformanceMetric })
  async trackClientPerformance(
    @Body() data: Partial<ClientPerformanceMetric>,
  ): Promise<ClientPerformanceMetric> {
    return this.performanceMetricsService.trackClientPerformance(data);
  }

  @Post('query')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track query performance' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Query performance tracked successfully',
  })
  @ApiBody({ type: QueryPerformanceMetric })
  async trackQueryPerformance(
    @Body() data: Partial<QueryPerformanceMetric>,
  ): Promise<QueryPerformanceMetric> {
    return this.performanceMetricsService.trackQueryPerformance(
      data.queryId,
      data.executionTime,
      data.queryType,
      data.parameters,
      data.resultCount,
    );
  }

  @Get('api')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get API performance metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API performance metrics retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  @ApiQuery({
    name: 'slowThreshold',
    required: false,
    type: Number,
    description: 'Threshold in ms to consider an API call slow (default: 1000)',
  })
  async getApiPerformanceMetrics(
    @Query('period') period?: number,
    @Query('slowThreshold') slowThreshold?: number,
  ): Promise<any> {
    return this.performanceMetricsService.getApiPerformanceMetrics(
      period || 30,
      slowThreshold || 1000,
    );
  }

  @Get('client')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get client performance metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Client performance metrics retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  async getClientPerformanceMetrics(@Query('period') period?: number): Promise<any> {
    return this.performanceMetricsService.getClientPerformanceMetrics(period || 30);
  }

  @Get('query')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get slow query metrics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Slow query metrics retrieved successfully' })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'Period in days (default: 30)',
  })
  @ApiQuery({
    name: 'slowThreshold',
    required: false,
    type: Number,
    description: 'Threshold in ms to consider a query slow (default: 500)',
  })
  async getSlowQueryMetrics(
    @Query('period') period?: number,
    @Query('slowThreshold') slowThreshold?: number,
  ): Promise<any> {
    return this.performanceMetricsService.getSlowQueryMetrics(period || 30, slowThreshold || 500);
  }
}
