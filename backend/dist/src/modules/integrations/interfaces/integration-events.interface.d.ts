export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  failed: number;
  errors: string[];
}
export interface IntegrationEvents {
  onSyncStart?(storeIdentifier: string, syncType: string): void;
  onSyncComplete?(storeIdentifier: string, syncType: string, result: SyncResult): void;
  onProductCreated?(merchantId: string, platformProductId: string, productData: unknown): void;
  onProductUpdated?(merchantId: string, platformProductId: string, productData: unknown): void;
  onProductDeleted?(merchantId: string, platformProductId: string): void;
}
