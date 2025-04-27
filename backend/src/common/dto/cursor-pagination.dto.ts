import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for cursor-based pagination requests
 * More reliable than offset pagination for continuous scroll
 */
export class CursorPaginationDto {
  @ApiProperty({
    description:
      'Cursor for the next page (typically the ID of the last item in the previous page)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Number of items to return per page',
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
  limit? = 20;

  @ApiProperty({
    description: 'Whether to include total count in response (may impact performance)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withCount? = false;
}

/**
 * Generic paginated response with cursor
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items for the current page' })
  items: T[];

  @ApiProperty({ description: 'Cursor to the next page', required: false })
  nextCursor?: string;

  @ApiProperty({ description: 'Cursor to the previous page', required: false })
  prevCursor?: string;

  @ApiProperty({ description: 'Total count of items (if requested)', required: false })
  totalCount?: number;

  @ApiProperty({ description: 'Whether there are more items available' })
  hasMore: boolean;
}

/**
 * Static methods for cursor encoding/decoding
 */
export class CursorUtils {
  /**
   * Encode cursor data to a base64 string
   * @param data Object containing cursor data (typically id and createdAt)
   * @returns Base64 encoded cursor string
   */
  static encodeCursor(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Decode a cursor string back to its original data
   * @param cursor Base64 encoded cursor string
   * @returns Decoded cursor data or null if invalid
   */
  static decodeCursor(cursor: string): any {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch (error) {
      return null;
    }
  }
}
