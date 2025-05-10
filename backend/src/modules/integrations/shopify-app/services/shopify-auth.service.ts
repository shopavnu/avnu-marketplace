import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { PlatformType } from '../../enums/platform-type.enum';
import { shopifyConfig } from '../../../common/config/shopify-config';
import * as crypto from 'crypto';

@Injectable()
export class ShopifyAuthService {
  private readonly logger = new Logger(ShopifyAuthService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
  ) {}

  /**
   * Generate a secure nonce for OAuth state
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate the auth URL for Shopify OAuth
   */
  async getAuthUrl(shop: string): Promise<string> {
    const state = this.generateNonce();

    // Store the state temporarily - in a real app this would be in Redis/session
    // For now we're just logging it
    this.logger.log(`Generated state ${state} for shop ${shop}`);

    const url = new URL(`https://${shop}/admin/oauth/authorize`);
    url.searchParams.append('client_id', this.config.api.key || '');
    url.searchParams.append('scope', this.config.api.scopes);
    url.searchParams.append('redirect_uri', this.config.auth.callbackUrl);
    url.searchParams.append('state', state);

    return url.toString();
  }

  /**
   * Handle the OAuth callback from Shopify
   */
  async handleCallback(shop: string, code: string, state: string): Promise<boolean> {
    try {
      this.logger.log(`Processing callback for shop ${shop} with state ${state}`);

      // In a real app, validate the state parameter against stored value

      // Exchange the code for an access token
      const accessToken = await this.exchangeCodeForToken(shop, code);

      if (!accessToken) {
        this.logger.error(`Failed to get access token for shop ${shop}`);
        return false;
      }

      // Store the connection
      await this.saveShopifyConnection(shop, accessToken);

      return true;
    } catch (error) {
      this.logger.error(
        `Error in Shopify callback: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Exchange the temporary code for a permanent access token
   */
  private async exchangeCodeForToken(shop: string, _code: string): Promise<string | null> {
    try {
      // Using configuration values for API access
      this.logger.log(`Exchanging code for access token for shop ${shop}`);

      // In a production implementation, this would make an HTTP request to Shopify
      // POST https://{shop}/admin/oauth/access_token with the following payload:
      // {
      //   client_id: this.config.apiKey,
      //   client_secret: this.config.apiSecretKey,
      //   code
      // }

      // For now, return a mock token for development purposes
      const mockAccessToken = `mock_token_${Date.now()}`;
      return mockAccessToken;
    } catch (error) {
      this.logger.error(
        `Error exchanging code for token: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Save the Shopify connection to the database
   */
  private async saveShopifyConnection(
    shop: string,
    accessToken: string,
  ): Promise<MerchantPlatformConnection> {
    try {
      // Check if we already have a connection for this shop
      let connection = await this.merchantPlatformConnectionRepository.findOne({
        where: {
          platformStoreName: shop,
          platformType: PlatformType.SHOPIFY,
        },
      });

      const now = new Date();

      if (connection) {
        // Update existing connection
        connection.accessToken = accessToken;
        connection.isActive = true;
        connection.lastSyncedAt = now;
        connection.updatedAt = now;
      } else {
        // Create new connection
        connection = new MerchantPlatformConnection();
        connection.merchantId = 'default-merchant'; // In a real app, this would be the actual merchant ID
        connection.platformType = PlatformType.SHOPIFY;
        connection.platformStoreName = shop;
        connection.platformStoreUrl = `https://${shop}`;
        connection.accessToken = accessToken;
        connection.isActive = true;
        connection.lastSyncedAt = now;
        connection.createdAt = now;
        connection.updatedAt = now;
      }

      return await this.merchantPlatformConnectionRepository.save(connection);
    } catch (error) {
      this.logger.error(
        `Error saving Shopify connection: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
