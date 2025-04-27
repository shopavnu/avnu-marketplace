import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BatchSectionsService } from '../services/batch-sections.service';
import { BatchSectionsRequestDto, BatchSectionsResponseDto } from '../dto/batch-sections.dto';

/**
 * Controller for batch loading multiple product sections
 * Optimized for continuous scroll interfaces
 */
@ApiTags('products-sections')
@Controller('products/sections')
export class BatchSectionsController {
  private readonly logger = new Logger(BatchSectionsController.name);

  constructor(private readonly batchSectionsService: BatchSectionsService) {}

  /**
   * Load multiple product sections in a single request
   * Ideal for continuous scroll interfaces to load different sections efficiently
   */
  @Post('batch')
  @ApiOperation({
    summary: 'Batch load multiple product sections',
    description:
      'Load multiple product sections (e.g., New Arrivals, Featured, Recommended) in a single request. Optimized for continuous scroll interfaces.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return multiple product sections',
    type: BatchSectionsResponseDto,
  })
  async loadBatchSections(
    @Body() batchRequest: BatchSectionsRequestDto,
  ): Promise<BatchSectionsResponseDto> {
    this.logger.log(`Batch loading ${batchRequest.sections.length} sections`);
    return this.batchSectionsService.loadBatchSections(batchRequest);
  }

  /**
   * Load multiple product sections in a single request (authenticated version)
   * Includes personalized recommendations and user-specific content
   */
  @Post('batch/personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Batch load personalized product sections',
    description:
      'Load multiple personalized product sections based on user preferences and history. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return multiple personalized product sections',
    type: BatchSectionsResponseDto,
  })
  async loadPersonalizedBatchSections(
    @Body() batchRequest: BatchSectionsRequestDto,
  ): Promise<BatchSectionsResponseDto> {
    this.logger.log(`Batch loading ${batchRequest.sections.length} personalized sections`);

    // Here we would add user-specific filtering and personalization
    // For now, just use the same service method
    return this.batchSectionsService.loadBatchSections(batchRequest);
  }
}
