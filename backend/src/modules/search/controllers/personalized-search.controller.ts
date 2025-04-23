import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PersonalizedSearchService } from '../services/personalized-search.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('personalized-search')
@Controller('personalized-search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonalizedSearchController {
  constructor(private readonly personalizedSearchService: PersonalizedSearchService) {}

  @Post()
  @ApiOperation({ summary: 'Perform a personalized search' })
  @ApiResponse({ status: 200, description: 'Search results with personalization' })
  async personalizedSearch(@Request() req, @Body() body: { query: string; options?: any }) {
    return this.personalizedSearchService.personalizedSearch(
      req.user.id,
      body.query,
      body.options || {},
    );
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized product recommendations' })
  async getRecommendations(@Request() req, @Query('limit') limit?: number) {
    return this.personalizedSearchService.getPersonalizedRecommendations(
      req.user.id,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('discovery-feed')
  @ApiOperation({ summary: 'Get personalized discovery feed' })
  @ApiResponse({ status: 200, description: 'Personalized discovery feed' })
  async getDiscoveryFeed(@Request() req, @Query('limit') limit?: number) {
    return this.personalizedSearchService.getDiscoveryFeed(req.user.id, {
      limit: limit ? parseInt(limit.toString(), 10) : 20,
    });
  }

  @Get('similar-products/:productId')
  @ApiOperation({ summary: 'Get similar products with personalization' })
  @ApiResponse({ status: 200, description: 'Similar products with personalization' })
  async getSimilarProducts(
    @Request() req,
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.personalizedSearchService.getSimilarProducts(
      productId,
      req.user.id,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }
}
