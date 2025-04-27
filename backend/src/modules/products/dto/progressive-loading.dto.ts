import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Loading priority for progressive loading
 */
export enum LoadingPriority {
  HIGH = 'high', // Load immediately (visible content)
  MEDIUM = 'medium', // Load soon (just outside viewport)
  LOW = 'low', // Load when resources available (far from viewport)
  PREFETCH = 'prefetch', // Just prefetch, don't render yet
}

/**
 * DTO for progressive loading request
 * Optimized for continuous scroll interfaces
 */
export class ProgressiveLoadingDto {
  @ApiProperty({
    description: 'Cursor for pagination',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Number of items to return',
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({
    description: 'Loading priority (affects what data is included)',
    required: false,
    enum: LoadingPriority,
    default: LoadingPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(LoadingPriority)
  priority?: LoadingPriority = LoadingPriority.HIGH;

  @ApiProperty({
    description: 'Whether to include full product details or just essential data',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  fullDetails?: boolean = false;

  @ApiProperty({
    description: 'Whether to include metadata like total counts',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withMetadata?: boolean = false;

  @ApiProperty({
    description: 'Array of product IDs to exclude (e.g., already loaded)',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclude?: string[] = [];
}

/**
 * Response for progressive loading
 */
export class ProgressiveLoadingResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
  })
  items: T[];

  @ApiProperty({
    description: 'Cursor for the next page',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Whether there are more items to load',
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Metadata (if requested)',
    required: false,
  })
  metadata?: {
    totalCount?: number;
    estimatedRemainingItems?: number;
    loadTimeMs?: number;
  };
}
