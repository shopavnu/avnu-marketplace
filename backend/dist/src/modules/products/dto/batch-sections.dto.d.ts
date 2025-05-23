import { CursorPaginationDto } from '../../../common/dto/cursor-pagination.dto';
export declare class SectionRequestDto {
    id: string;
    title: string;
    pagination: CursorPaginationDto;
    filter?: Record<string, any>;
}
export declare class BatchSectionsRequestDto {
    sections: SectionRequestDto[];
    parallel?: boolean;
}
export declare class SectionResponseDto {
    id: string;
    title: string;
    items: any[];
    nextCursor?: string;
    hasMore: boolean;
    totalCount?: number;
}
export declare class BatchSectionsResponseDto {
    sections: SectionResponseDto[];
    meta: {
        totalSections: number;
        totalProducts: number;
        loadTimeMs: number;
    };
}
