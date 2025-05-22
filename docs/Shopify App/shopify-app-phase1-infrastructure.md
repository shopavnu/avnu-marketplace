# Phase 1: Core Infrastructure

## Objectives

- Set up Shopify Partner account and app registration
- Create basic app scaffolding for embedded UI
- Enhance existing Shopify services to support app requirements
- Extend database schema for new app data
- Implement OAuth flow and session management

## Timeline: Weeks 1-2

## Tasks & Implementation Details

### 1. Shopify Partner Account Setup

**Manual Steps:**
1. Register at [partners.shopify.com](https://partners.shopify.com) if not already done
2. Create a development store for testing
3. Navigate to Apps → Create App
4. Configure app settings:
   - App name: "Avnu Marketplace"
   - App URL: Your development URL
   - Allowed redirection URLs: `https://{your-domain}/api/integrations/shopify/auth/callback`
5. Note App API Key and API Secret Key

### 2. Database Schema Extensions

Extend the existing `MerchantPlatformConnection` entity:

```typescript
// Add to merchant-platform-connection.entity.ts

@Column({ nullable: true, type: 'jsonb' })
brandInformation?: {
  logoUrl?: string;
  heroUrl?: string;
  about?: string;
  location?: string;
  causes?: string[];
};

@Column({ nullable: true, type: 'jsonb' })
shippingPolicy?: {
  mode: 'always_free' | 'free_over_threshold' | 'real_time_rates';
  threshold?: number;
  useShopifyRates: boolean;
};

@Column({ nullable: true, type: 'jsonb' })
returnPolicy?: {
  windowDays: number;
  payerIsCustomer: boolean;
  returnAddress: Address;
  contactEmail: string;
  contactPhone?: string;
};

@Column({ default: 'pending', enum: ['pending', 'approved', 'declined'] })
approvalStatus: string;

@Column({ nullable: true })
declineReason?: string;

@Column({ nullable: true })
onboardingStep?: string;
```

Create a migration:

```typescript
// Create with: npx typeorm migration:create -n MerchantPlatformConnectionEnhancement

import { MigrationInterface, QueryRunner } from 'typeorm';

export class MerchantPlatformConnectionEnhancement1683678124000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchant_platform_connection" 
      ADD COLUMN IF NOT EXISTS "brand_information" JSONB,
      ADD COLUMN IF NOT EXISTS "shipping_policy" JSONB,
      ADD COLUMN IF NOT EXISTS "return_policy" JSONB,
      ADD COLUMN IF NOT EXISTS "approval_status" VARCHAR DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "decline_reason" VARCHAR,
      ADD COLUMN IF NOT EXISTS "onboarding_step" VARCHAR
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "merchant_platform_connection" 
      DROP COLUMN IF EXISTS "brand_information",
      DROP COLUMN IF EXISTS "shipping_policy",
      DROP COLUMN IF EXISTS "return_policy",
      DROP COLUMN IF EXISTS "approval_status",
      DROP COLUMN IF EXISTS "decline_reason",
      DROP COLUMN IF EXISTS "onboarding_step"
    `);
  }
}
```

### 3. Enhanced ShopifyAuthService

Extend the existing service with these new methods:

```typescript
// Add to shopify-auth.service.ts

/**
 * Generates a Shopify app installation URL with required scopes
 */
async generateInstallUrl(shop: string): Promise<string> {
  const state = this.generateRandomState();
  const scopes = [
    'read_products', 'read_product_listings', 'read_inventory',
    'write_orders', 'read_orders', 'read_merchant_managed_fulfillment_orders',
    'read_shipping', 'read_files', 'write_files', 'read_fulfillments', 
    'read_shipping_rates', 'read_metafields', 'write_metafields'
  ];
  
  // Store state temporarily (Redis)
  await this.cacheManager.set(`shopify_oauth_state_${state}`, shop, { ttl: 600 });
  
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.append('client_id', this.shopifyApiKey);
  url.searchParams.append('scope', scopes.join(','));
  url.searchParams.append('redirect_uri', this.getCallbackUrl());
  url.searchParams.append('state', state);
  
  return url.toString();
}

/**
 * Exchanges OAuth code for permanent access token
 * and initializes merchant connection
 */
async handleCallback(code: string, shop: string, state: string): Promise<MerchantPlatformConnection> {
  // Validate state from cache
  const cachedShop = await this.cacheManager.get(`shopify_oauth_state_${state}`);
  if (!cachedShop || cachedShop !== shop) {
    throw new UnauthorizedException('Invalid OAuth state');
  }
  
  // Exchange code for access token
  const accessToken = await this.exchangeCodeForToken(code, shop);
  
  // Create or update merchant connection
  let merchantConnection = await this.merchantPlatformConnectionRepository.findOne({ 
    where: { platformStoreName: shop } 
  });
  
  if (!merchantConnection) {
    merchantConnection = new MerchantPlatformConnection();
    merchantConnection.platformType = PlatformType.SHOPIFY;
    merchantConnection.platformStoreName = shop;
  }
  
  merchantConnection.accessToken = accessToken;
  merchantConnection.isActive = true;
  merchantConnection.onboardingStep = merchantConnection.onboardingStep || 'brand_basics';
  merchantConnection.approvalStatus = merchantConnection.approvalStatus || 'pending';
  
  await this.merchantPlatformConnectionRepository.save(merchantConnection);
  
  // Register webhooks
  await this.registerWebhooks(shop, accessToken);
  
  return merchantConnection;
}

/**
 * Verifies an active session is valid and refreshes if needed
 */
async verifySession(shop: string, accessToken: string): Promise<boolean> {
  try {
    // Verify token is valid with a simple GraphQL query
    const response = await this.shopifyClientService.query(
      shop,
      accessToken,
      `{ shop { name } }`
    );
    
    return true;
  } catch (error) {
    this.logger.error(`Invalid session for shop ${shop}`, error);
    return false;
  }
}

/**
 * Verifies JWT token from frontend App Bridge
 */
async verifyJWT(token: string): Promise<{ shop: string; userId: string }> {
  try {
    const decoded = jwt.verify(token, this.shopifyApiSecret);
    return {
      shop: decoded.dest.replace('https://', ''),
      userId: decoded.sub
    };
  } catch (error) {
    throw new UnauthorizedException('Invalid JWT token');
  }
}

/**
 * Registers all required webhooks for the app
 */
async registerWebhooks(shop: string, accessToken: string): Promise<void> {
  const webhooks = [
    { topic: 'PRODUCTS_CREATE', address: `${this.config.appUrl}/webhooks/shopify/products` },
    { topic: 'PRODUCTS_UPDATE', address: `${this.config.appUrl}/webhooks/shopify/products` },
    { topic: 'PRODUCTS_DELETE', address: `${this.config.appUrl}/webhooks/shopify/products` },
    { topic: 'PRODUCT_VARIANTS_CREATE', address: `${this.config.appUrl}/webhooks/shopify/variants` },
    { topic: 'PRODUCT_VARIANTS_UPDATE', address: `${this.config.appUrl}/webhooks/shopify/variants` },
    { topic: 'INVENTORY_LEVELS_UPDATE', address: `${this.config.appUrl}/webhooks/shopify/inventory` },
    { topic: 'ORDERS_FULFILLED', address: `${this.config.appUrl}/webhooks/shopify/orders` },
    { topic: 'FULFILLMENTS_CREATE', address: `${this.config.appUrl}/webhooks/shopify/fulfillments` },
    { topic: 'FULFILLMENTS_UPDATE', address: `${this.config.appUrl}/webhooks/shopify/fulfillments` },
    { topic: 'APP_UNINSTALLED', address: `${this.config.appUrl}/webhooks/shopify/app` },
  ];
  
  // GraphQL mutation to create webhook subscriptions
  const mutation = `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  for (const webhook of webhooks) {
    try {
      await this.shopifyClientService.query(
        shop,
        accessToken,
        mutation,
        {
          topic: webhook.topic,
          webhookSubscription: {
            callbackUrl: webhook.address,
            format: 'JSON'
          }
        }
      );
      this.logger.log(`Registered webhook ${webhook.topic} for ${shop}`);
    } catch (error) {
      this.logger.error(`Failed to register webhook ${webhook.topic} for ${shop}`, error);
    }
  }
}

/**
 * Exchanges an OAuth code for a permanent token
 */
private async exchangeCodeForToken(code: string, shop: string): Promise<string> {
  const url = `https://${shop}/admin/oauth/access_token`;
  const data = {
    client_id: this.shopifyApiKey,
    client_secret: this.shopifyApiSecret,
    code
  };
  
  try {
    const response = await axios.post(url, data);
    return response.data.access_token;
  } catch (error) {
    this.logger.error(`Failed to exchange token for shop ${shop}`, error);
    throw new UnauthorizedException('Failed to authenticate with Shopify');
  }
}

/**
 * Generates a random state string for OAuth security
 */
private generateRandomState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Gets the full callback URL for OAuth
 */
private getCallbackUrl(): string {
  return `${this.config.appUrl}/api/integrations/shopify/auth/callback`;
}
```

### 4. Auth Controller for OAuth

Create a controller to handle app installation and OAuth:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-auth.controller.ts

import { Controller, Get, Req, Res, Query, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ShopifyAuthService } from '../services/shopify-auth.service';

@Controller('api/integrations/shopify/auth')
export class ShopifyAuthController {
  constructor(private readonly shopifyAuthService: ShopifyAuthService) {}

  /**
   * Entry point for app installation
   */
  @Get()
  async auth(@Query('shop') shop: string, @Res() response: Response): Promise<void> {
    if (!shop) {
      throw new BadRequestException('Missing shop parameter');
    }
    
    // Validate shop format (myshop.myshopify.com)
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/)) {
      throw new BadRequestException('Invalid shop domain');
    }
    
    // Generate and redirect to install URL
    const installUrl = await this.shopifyAuthService.generateInstallUrl(shop);
    response.redirect(installUrl);
  }

  /**
   * OAuth callback endpoint
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('shop') shop: string,
    @Query('state') state: string,
    @Res() response: Response
  ): Promise<void> {
    if (!code || !shop || !state) {
      throw new BadRequestException('Missing required parameters');
    }
    
    try {
      // Process OAuth callback
      const merchantConnection = await this.shopifyAuthService.handleCallback(code, shop, state);
      
      // Redirect to the embedded app
      response.redirect(`https://${shop}/admin/apps/avnu-marketplace`);
    } catch (error) {
      this.logger.error('OAuth callback failed', error);
      response.status(500).send('Authentication failed');
    }
  }
  
  /**
   * App installation status endpoint
   */
  @Get('status/:shop')
  async getAppStatus(@Param('shop') shop: string): Promise<any> {
    const merchantConnection = await this.merchantPlatformConnectionRepository.findOne({
      where: { platformStoreName: shop }
    });
    
    if (!merchantConnection) {
      return { installed: false };
    }
    
    return {
      installed: true,
      onboardingStep: merchantConnection.onboardingStep,
      approvalStatus: merchantConnection.approvalStatus
    };
  }
}
```

### 5. Webhook Verification Middleware

Create middleware to verify Shopify webhooks:

```typescript
// src/modules/integrations/shopify-app/middleware/shopify-webhook.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShopifyWebhookMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hmac = req.headers['x-shopify-hmac-sha256'] as string;
    
    if (!hmac) {
      throw new UnauthorizedException('Missing HMAC signature');
    }
    
    // Get raw body
    const rawBody = JSON.stringify(req.body);
    
    // Calculate HMAC
    const shopifyApiSecret = this.configService.get<string>('shopify.apiSecret');
    const calculatedHmac = createHmac('sha256', shopifyApiSecret)
      .update(rawBody, 'utf8')
      .digest('base64');
    
    // Verify signature
    if (calculatedHmac !== hmac) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }
    
    next();
  }
}
```

### 6. Basic Webhook Controller

Create a controller to receive Shopify webhooks:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-webhook.controller.ts

import { Controller, Post, Headers, Body, Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhooks/shopify')
@SkipThrottle() // Skip rate limiting for webhooks
export class ShopifyWebhookController {
  private readonly logger = new Logger(ShopifyWebhookController.name);

  @Post('products')
  async handleProductWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    // Process webhook based on topic
    // Will be implemented in Phase 3
    
    return { success: true };
  }
  
  @Post('variants')
  async handleVariantWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    return { success: true };
  }
  
  @Post('inventory')
  async handleInventoryWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    return { success: true };
  }
  
  @Post('orders')
  async handleOrderWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    return { success: true };
  }
  
  @Post('fulfillments')
  async handleFulfillmentWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    return { success: true };
  }
  
  @Post('app')
  async handleAppWebhook(
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() data: any,
  ) {
    this.logger.log(`Received ${topic} webhook from ${shop}`);
    
    // Handle app uninstallation
    if (topic === 'APP_UNINSTALLED') {
      // Will be implemented in Phase 3
    }
    
    return { success: true };
  }
}
```

### 7. Shopify Module Configuration

Update the module configuration:

```typescript
// src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ShopifyClientService } from './services/shopify-client.service';
import { ShopifyFulfillmentService } from './services/shopify-fulfillment.service';
import { ShopifyBulkOperationService } from './services/shopify-bulk-operation.service';
import { ShopifyAuthController } from './controllers/shopify-auth.controller';
import { ShopifyWebhookController } from './controllers/shopify-webhook.controller';
import { ShopifyWebhookMiddleware } from './middleware/shopify-webhook.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    ConfigModule,
  ],
  providers: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifyFulfillmentService,
    ShopifyBulkOperationService,
  ],
  controllers: [
    ShopifyAuthController,
    ShopifyWebhookController,
  ],
  exports: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifyFulfillmentService,
    ShopifyBulkOperationService,
  ],
})
export class ShopifyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShopifyWebhookMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

### 8. Environment Configuration

Add required environment variables in `.env` file:

```
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-app-domain.com
SHOPIFY_SCOPES=read_products,read_product_listings,read_inventory,write_orders,read_orders,read_merchant_managed_fulfillment_orders,read_shipping,read_files,write_files,read_fulfillments,read_shipping_rates,read_metafields,write_metafields
```

Update configuration in `shopify-config.ts`:

```typescript
// src/modules/common/config/shopify-config.ts

import { registerAs } from '@nestjs/config';

export const shopifyConfig = registerAs('shopify', () => ({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecret: process.env.SHOPIFY_API_SECRET,
  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SHOPIFY_SCOPES?.split(',') || [],
  // Add any other config values
}));
```

### 9. Remix Embedded App Setup

For the embedded Shopify admin app, we'll use Remix with the Shopify App template:

1. Create a new Remix app:

```bash
npx create-remix@latest --template shopify/shopify-app-template-remix avnu-shopify-app
```

2. Configure the app in `app/shopify.server.ts`:

```typescript
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: [
    "read_products",
    "read_product_listings",
    "read_inventory",
    "write_orders",
    "read_orders",
    "read_merchant_managed_fulfillment_orders",
    "read_shipping",
    "read_files",
    "write_files",
    "read_fulfillments",
    "read_shipping_rates",
    "read_metafields",
    "write_metafields"
  ],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  apiVersion: LATEST_API_VERSION,
  restResources,
  webhooks: {
    // Will be handled by the NestJS backend
  },
  // Create a connection to the Avnu backend
  hooks: {
    afterAuth: async ({ session }) => {
      // Communicate with Avnu backend after successful auth
      try {
        const response = await fetch(`${process.env.AVNU_API_URL}/api/integrations/shopify/auth/store-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            shop: session.shop,
            accessToken: session.accessToken
          })
        });
        
        if (!response.ok) {
          console.error(`Failed to register session with Avnu backend: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error communicating with Avnu backend', error);
      }
    }
  }
});
```

3. Create a `.env` file in the Remix app:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-app-domain.com
AVNU_API_URL=https://your-avnu-api.com
```

## Dependencies & Prerequisites

- Shopify Partner account
- NestJS backend with existing Shopify services
- PostgreSQL database
- Redis for cache and queue management
- Remix development environment

## Testing Guidelines

1. **OAuth Flow:**
   - Test installation URL generation
   - Verify callback handling and token exchange
   - Ensure token storage works correctly

2. **Webhook Verification:**
   - Validate HMAC calculation
   - Ensure webhook routes are protected

3. **Database Schema:**
   - Verify migration runs successfully
   - Test CRUD operations on extended entity

## Next Phase

Once the infrastructure is in place, proceed to [Phase 2: Onboarding UI](./shopify-app-phase2-onboarding.md) to implement the merchant onboarding experience.
