export declare class CursorPaginationDto {
  cursor?: string;
  limit?: number;
  withCount?: boolean;
}
export declare class PaginatedResponseDto<T> {
  items: T[];
  nextCursor?: string;
  prevCursor?: string;
  totalCount?: number;
  hasMore: boolean;
}
export declare class CursorUtils {
  static encodeCursor(data: any): string;
  static decodeCursor(cursor: string): any;
}
