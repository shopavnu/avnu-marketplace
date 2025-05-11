import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { IShopifyAuthService } from '../../../common/interfaces/shopify-services.interfaces';
export declare class ShopifyAuthEnhancedService implements IShopifyAuthService {
  private readonly config;
  private readonly merchantPlatformConnectionRepository;
  private readonly logger;
  private encryptionKey;
  constructor(
    config: ConfigType<typeof shopifyConfig>,
    merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  );
  private generateSecureState;
  private isValidShopDomain;
  private verifyRequiredScopes;
  private verifyAccessToken;
  generateAuthUrl(shop: string): string;
  handleCallback(shop: string, code: string, state: string): Promise<string>;
  verifySessionToken(token: string): Promise<any>;
  storeAccessToken(
    shop: string,
    accessToken: string,
    merchantId: string,
    metadata?: {
      grantedScopes?: string;
      expiresIn?: number;
      apiVersion?: string;
    },
  ): Promise<void>;
  getAccessToken(merchantId: string): Promise<{
    shop: string;
    accessToken: string;
  }>;
  handleUninstall(shop: string): Promise<void>;
  private findOrCreateMerchantByShop;
  private generateNonce;
  private encrypt;
  private decrypt;
}
