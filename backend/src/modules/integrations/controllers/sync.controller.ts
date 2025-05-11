// @ts-strict-mode: enabled
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../../../modules/auth/guards/merchant.guard';
import { IntegrationsService } from '../integrations.service';
import { OrderSyncService } from '../services/order-sync.service';
import { IntegrationType } from '../types/integration-type.enum';

/**
 * Controller for platform synchronization operations
 */
@ApiTags('Integrations')
@Controller('sync')
export class SyncController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly orderSyncService: OrderSyncService,
  ) {}

  /**
   * Sync products from Shopify
   */
  @Post('shopify/products')
  @UseGuards(JwtAuthGuard, MerchantGuard)
  @ApiOperation({ summary: 'Sync products from Shopify' })
  @ApiBearerAuth()
  async syncShopifyProducts(
    @Request() req: { user: { merchantId: string } },
  ): Promise<{ added: number; updated: number; failed: number; errors?: string[] }> {
    return this.integrationsService.syncProducts(
      IntegrationType.SHOPIFY,
      {}, // Credentials not needed as we use the stored credentials
      req.user.merchantId,
    );
  }

  /**
   * Sync orders from Shopify
   */
  @Post('shopify/orders')
  @UseGuards(JwtAuthGuard, MerchantGuard)
  @ApiOperation({ summary: 'Sync orders from Shopify' })
  @ApiBearerAuth()
  async syncShopifyOrders(
    @Request() req: { user: { merchantId: string } },
  ): Promise<{ created: number; updated: number; failed: number }> {
    return this.orderSyncService.syncOrders(IntegrationType.SHOPIFY, req.user.merchantId);
  }

  /**
   * Handle webhook from Shopify
   * Note: This endpoint would typically be exposed without authentication for the platform to call
   */
  @Post('shopify/webhook')
  @ApiOperation({ summary: 'Handle webhook from Shopify' })
  async handleShopifyWebhook(
    @Body() payload: Record<string, unknown>,
    @Request() req: { headers: Record<string, string> },
  ): Promise<{ success: boolean }> {
    // Get the topic and shop domain from headers
    const topic = req.headers['x-shopify-topic'] || '';
    const _shop = req.headers['x-shopify-shop-domain'] || ''; // Prefix with underscore since it's unused

    // Extract merchant ID - in a real implementation this would be determined from the shop domain
    const merchantId = 'merchant-id-placeholder';

    const result = await this.integrationsService.handleWebhook(
      IntegrationType.SHOPIFY,
      payload,
      topic as string,
      merchantId,
    );

    return { success: result };
  }
}
