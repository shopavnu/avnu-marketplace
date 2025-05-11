import { ConfigType } from '@nestjs/config';
import { IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { ShopifyVersionManagerService } from './shopify-version-manager.service';
import { ShopifyConnectionPoolManager } from '../utils/connection-pool-manager';
import { ShopifyCircuitBreaker } from '../utils/circuit-breaker';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import { ShopifyCacheManager } from '../utils/cache-manager';
export declare class ShopifyClientService implements IShopifyClientService {
  private readonly config;
  private readonly versionManager;
  private readonly connectionPool;
  private readonly circuitBreaker;
  private readonly cacheManager;
  private readonly logger;
  constructor(
    config: ConfigType<typeof shopifyConfig>,
    versionManager: ShopifyVersionManagerService,
    connectionPool: ShopifyConnectionPoolManager,
    circuitBreaker: ShopifyCircuitBreaker,
    cacheManager: ShopifyCacheManager,
    logger: ShopifyStructuredLogger,
  );
  query<T>(
    shop: string,
    accessToken: string,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T>;
  private executeGraphQLQuery;
  request<T>(
    shop: string,
    accessToken: string,
    endpoint: string,
    method?: string,
    data?: any,
  ): Promise<T>;
  private executeRestRequest;
  getShopInfo(shop: string, accessToken: string): Promise<any>;
  private extractUserErrors;
  private handleGraphQLErrors;
  private handleUserErrors;
  private handleApiError;
  private maskShopDomain;
}
