export interface SyncResult {
    success: boolean;
    created: number;
    added?: number;
    updated: number;
    failed: number;
    errors: string[];
    total?: number;
    totalProcessed?: number;
    platformErrors?: Record<string, string>;
    skipped?: number;
    deleted?: number;
    timestamp?: Date;
}
export declare const INTEGRATION_EVENTS: {
    PRODUCT_IMPORTED: string;
    PRODUCT_EXPORTED: string;
    PRODUCT_UPDATED: string;
    PRODUCT_DELETED: string;
    SYNC_STARTED: string;
    SYNC_COMPLETED: string;
    WEBHOOK_RECEIVED: string;
};
export interface BaseIntegrationEvent {
    eventId: string;
    timestamp: Date;
    platformType: string;
    merchantId: string;
    status: 'success' | 'failed';
    errorMessage?: string;
    origin: 'marketplace' | 'platform';
}
export interface ProductImportedEvent extends BaseIntegrationEvent {
    externalProductId: string;
    internalProductId: string;
    productData: unknown;
}
export interface ProductExportedEvent extends BaseIntegrationEvent {
    externalProductId: string;
    internalProductId: string;
    productData: unknown;
}
export interface ProductUpdatedEvent extends BaseIntegrationEvent {
    externalProductId: string;
    internalProductId: string;
    updatedFields: string[];
}
export interface ProductDeletedEvent extends BaseIntegrationEvent {
    externalProductId: string;
    internalProductId: string;
}
export interface SyncStartedEvent extends BaseIntegrationEvent {
    syncType: string;
    storeIdentifier: string;
}
export interface SyncCompletedEvent extends BaseIntegrationEvent {
    syncType: string;
    storeIdentifier: string;
    result: SyncResult;
}
