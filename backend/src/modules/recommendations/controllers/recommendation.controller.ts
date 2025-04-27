import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  Req,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductSimilarityService } from '../services/product-similarity.service';
import { PersonalizedRankingService } from '../services/personalized-ranking.service';
import { SimilarityType } from '../entities/product-similarity.entity';
import { RecommendationType } from '../entities/product-recommendation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
// Define the request type with user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isMerchant: boolean;
    merchantId?: string;
  };
}

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly productSimilarityService: ProductSimilarityService,
    private readonly personalizedRankingService: PersonalizedRankingService,
  ) {}

  @Get('similar-products/:productId')
  @ApiOperation({ summary: 'Get similar products' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'type', enum: SimilarityType, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Returns similar products' })
  async getSimilarProducts(
    @Param('productId') productId: string,
    @Query('type') type: SimilarityType = SimilarityType.HYBRID,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const similarProducts = await this.productSimilarityService.getSimilarProducts(
        productId,
        type,
        limit
      );
      
      return {
        success: true,
        data: similarProducts,
        meta: {
          count: similarProducts.length,
          similarityType: type,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get similar products: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get similar products',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'refresh', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Returns personalized recommendations' })
  async getPersonalizedRecommendations(
    @Req() req: RequestWithUser,
    @Query('limit') limit: number = 10,
    @Query('refresh') refresh: boolean = false,
  ) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new HttpException(
          {
            success: false,
            message: 'User ID is required',
          },
          HttpStatus.BAD_REQUEST
        );
      }
      
      const recommendations = await this.personalizedRankingService.getPersonalizedRecommendations(
        userId,
        limit,
        refresh
      );
      
      return {
        success: true,
        data: recommendations,
        meta: {
          count: recommendations.length,
          refresh,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get personalized recommendations: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get personalized recommendations',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('trending')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get trending products' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Returns trending products' })
  async getTrendingProducts(
    @Req() req: RequestWithUser,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const userId = req.user?.id || 'anonymous';
      
      // For anonymous users or when no personalized recommendations are available,
      // this will fall back to popularity-based recommendations
      const recommendations = await this.personalizedRankingService.getPersonalizedRecommendations(
        userId,
        limit,
        false
      );
      
      return {
        success: true,
        data: recommendations,
        meta: {
          count: recommendations.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get trending products: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get trending products',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('track/impression/:recommendationId')
  @ApiOperation({ summary: 'Track recommendation impression' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Impression tracked successfully' })
  async trackImpression(@Param('recommendationId') recommendationId: string) {
    try {
      await this.personalizedRankingService.trackImpression(recommendationId);
      
      return {
        success: true,
        message: 'Impression tracked successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to track impression: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to track impression',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('track/click/:recommendationId')
  @ApiOperation({ summary: 'Track recommendation click' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Click tracked successfully' })
  async trackClick(@Param('recommendationId') recommendationId: string) {
    try {
      await this.personalizedRankingService.trackClick(recommendationId);
      
      return {
        success: true,
        message: 'Click tracked successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to track click: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to track click',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('track/conversion/:recommendationId')
  @ApiOperation({ summary: 'Track recommendation conversion' })
  @ApiParam({ name: 'recommendationId', description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Conversion tracked successfully' })
  async trackConversion(@Param('recommendationId') recommendationId: string) {
    try {
      await this.personalizedRankingService.trackConversion(recommendationId);
      
      return {
        success: true,
        message: 'Conversion tracked successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to track conversion: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to track conversion',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('update-similarities/:productId')
  @ApiOperation({ summary: 'Update product similarities' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Similarities updated successfully' })
  async updateProductSimilarities(@Param('productId') productId: string) {
    try {
      await this.productSimilarityService.updateProductSimilarities(productId);
      
      return {
        success: true,
        message: 'Product similarities updated successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update product similarities: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update product similarities',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('batch-update-similarities')
  @ApiOperation({ summary: 'Batch update product similarities' })
  @ApiResponse({ status: 200, description: 'Similarities updated successfully' })
  async batchUpdateSimilarities(@Body() body: { productIds: string[] }) {
    try {
      await this.productSimilarityService.batchUpdateSimilarities(body.productIds);
      
      return {
        success: true,
        message: 'Product similarities updated successfully',
        meta: {
          count: body.productIds.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to batch update similarities: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to batch update similarities',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
