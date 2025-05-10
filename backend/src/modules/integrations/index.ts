// @ts-strict-mode: enabled

// Export main module
export * from './integrations.module';

// Export services for merchant platform integrations
export {
  IntegrationsService as IntegrationsServiceImpl,
  IntegrationCredentials as IntegrationCredentialsImpl,
  SyncResult as SyncResultImpl,
} from './integrations.service';
export * from './services/shopify.service';
export * from './services/woocommerce.service';
export * from './services/base-integration.service';
export * from './services/order-sync.service';

// Export controllers
export * from './integrations.controller';
export * from './controllers/merchant-auth.controller';
export * from './controllers/sync.controller';

// Export interfaces and types
export {
  IntegrationsService,
  IntegrationCredentials,
  SyncResult,
  ShopifyCredentials,
  WooCommerceCredentials,
} from './integrations.service.interface';
export * from './types/integration-type.enum';

// Export entities
export * from './entities/merchant-platform-connection.entity';

// Export enums
export * from './enums';
