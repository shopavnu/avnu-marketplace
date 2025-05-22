// Export everything from product-integration.interface except SyncResult
export {
  PlatformProductDto,
  PlatformProductVariantDto,
  ProductIntegrationService,
} from './product-integration.interface';

// Export everything from integration-events.interface
// SyncResult is our canonical implementation from here
export {
  SyncResult,
  INTEGRATION_EVENTS,
  BaseIntegrationEvent,
  ProductImportedEvent,
  ProductExportedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
  SyncStartedEvent,
  SyncCompletedEvent,
} from './integration-events.interface';
