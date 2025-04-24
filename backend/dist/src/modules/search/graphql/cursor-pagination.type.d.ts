export declare class CursorPaginationType {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
}
export declare class CursorPaginationInput {
    cursor?: string;
    limit: number;
}
