// Export interfaces selectively to avoid ambiguous exports
export { ProductIntegrationService, SyncResult } from './interfaces/product-integration.interface';
export { PlatformType } from './enums/platform-type.enum';
export { WebhookEvent } from './interfaces/webhook-event.interface';

// Export other modules
export * from './dto';
export * from './shared.module';

// Export other interfaces that don't conflict
export * from './interfaces/integration-events.interface';
