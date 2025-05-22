import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/cursor-pagination.dto';

/**
 * DTO for a single section request in batch loading
 */
export class SectionRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the section',
    example: 'new-arrivals',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Section title',
    example: 'New Arrivals',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Cursor pagination parameters for this section',
    type: CursorPaginationDto,
  })
  @ValidateNested()
  @Type(() => CursorPaginationDto)
  pagination: CursorPaginationDto;

  @ApiProperty({
    description: 'Filter parameters for this section',
    required: false,
  })
  @IsOptional()
  filter?: Record<string, any>;
}

/**
 * DTO for batch loading multiple product sections
 */
export class BatchSectionsRequestDto {
  @ApiProperty({
    description: 'Array of section requests',
    type: [SectionRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRequestDto)
  sections: SectionRequestDto[];

  @ApiProperty({
    description: 'Whether to parallelize section loading (may impact performance)',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean = true;
}

/**
 * DTO for a single section response in batch loading
 */
export class SectionResponseDto {
  @ApiProperty({
    description: 'Section ID',
  })
  id: string;

  @ApiProperty({
    description: 'Section title',
  })
  title: string;

  @ApiProperty({
    description: 'Products in this section',
  })
  items: any[];

  @ApiProperty({
    description: 'Cursor for the next page',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({
    description: 'Whether there are more items available',
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Total count (if requested)',
    required: false,
  })
  totalCount?: number;
}

/**
 * DTO for batch loading response
 */
export class BatchSectionsResponseDto {
  @ApiProperty({
    description: 'Array of section responses',
    type: [SectionResponseDto],
  })
  sections: SectionResponseDto[];

  @ApiProperty({
    description: 'Metadata about the batch request',
  })
  meta: {
    totalSections: number;
    totalProducts: number;
    loadTimeMs: number;
  };
}
