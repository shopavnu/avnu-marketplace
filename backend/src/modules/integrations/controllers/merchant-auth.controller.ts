// @ts-strict-mode: enabled
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../../../modules/auth/guards/merchant.guard';
import { IntegrationsService } from '../integrations.service';
import { IntegrationType } from '../types/integration-type.enum';

/**
 * Controller for platform authentication operations
 */
@ApiTags('Integrations')
@Controller('merchant-auth')
export class MerchantAuthController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  /**
   * Authenticate with Shopify
   */
  @Post('shopify')
  @UseGuards(JwtAuthGuard, MerchantGuard)
  @ApiOperation({ summary: 'Authenticate with Shopify' })
  @ApiBearerAuth()
  async authenticateShopify(
    @Body()
    body: {
      shopDomain: string;
      accessToken: string;
    },
  ): Promise<{ success: boolean }> {
    const result = await this.integrationsService.authenticate(IntegrationType.SHOPIFY, {
      shopify: {
        shopDomain: body.shopDomain,
        accessToken: body.accessToken,
        apiKey: '', // Not used for this authentication flow
        apiSecret: '', // Not used for this authentication flow
      },
    });

    return { success: result };
  }

  /**
   * Authenticate with WooCommerce
   * Note: This is a placeholder for WooCommerce integration
   */
  @Post('woocommerce')
  @UseGuards(JwtAuthGuard, MerchantGuard)
  @ApiOperation({ summary: 'Authenticate with WooCommerce' })
  @ApiBearerAuth()
  async authenticateWooCommerce(
    @Body()
    body: {
      storeUrl: string;
      consumerKey: string;
      consumerSecret: string;
    },
  ): Promise<{ success: boolean }> {
    // Placeholder for WooCommerce authentication
    // As we're implementing a Shopify-first approach, this is just a stub
    return { success: false };
  }
}
