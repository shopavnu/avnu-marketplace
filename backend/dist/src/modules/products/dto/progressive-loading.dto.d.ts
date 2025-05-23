export declare enum LoadingPriority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    PREFETCH = "prefetch"
}
export declare class ProgressiveLoadingDto {
    cursor?: string;
    limit?: number;
    priority?: LoadingPriority;
    fullDetails?: boolean;
    withMetadata?: boolean;
    exclude?: string[];
}
export declare class ProgressiveLoadingResponseDto<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
    metadata?: {
        totalCount?: number;
        estimatedRemainingItems?: number;
        loadTimeMs?: number;
    };
}
