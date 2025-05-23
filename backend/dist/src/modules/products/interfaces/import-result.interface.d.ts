export interface ImportResult {
    created: number;
    updated: number;
    failed: number;
    errors?: string[];
    warnings?: string[];
    successIds?: string[];
    failedIds?: string[];
}
