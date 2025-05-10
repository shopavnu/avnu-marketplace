import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Req,
  Res,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ShopifyAuthService } from '../services/shopify-auth.service';
import { ShopifyAppService } from '../services/shopify-app.service';
import { ShopifyWebhookService } from '../services/shopify-webhook.service';
import { Request, Response } from 'express';

@Controller('integrations/shopify')
export class ShopifyAppController {
  private readonly logger = new Logger(ShopifyAppController.name);

  constructor(
    private readonly shopifyAuthService: ShopifyAuthService,
    private readonly shopifyAppService: ShopifyAppService,
    private readonly shopifyWebhookService: ShopifyWebhookService,
  ) {}

  @Get('auth')
  async auth(@Query('shop') shop: string, @Res() response: Response): Promise<void> {
    this.logger.log(`Received authorization request for shop: ${shop}`);

    try {
      const authUrl = await this.shopifyAuthService.getAuthUrl(shop);
      response.redirect(authUrl);
    } catch (error) {
      this.logger.error(`Error in auth: ${error instanceof Error ? error.message : String(error)}`);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to initiate authorization',
      });
    }
  }

  @Get('callback')
  async callback(
    @Query('shop') shop: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ): Promise<void> {
    this.logger.log(`Received callback for shop: ${shop}`);

    try {
      const success = await this.shopifyAuthService.handleCallback(shop, code, state);

      if (success) {
        // Redirect to app interface
        response.redirect(`https://${shop}/admin/apps/avnu-marketplace`);
      } else {
        response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Authentication failed',
        });
      }
    } catch (error) {
      this.logger.error(
        `Error in callback: ${error instanceof Error ? error.message : String(error)}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  }

  @Post('webhooks')
  async handleWebhook(
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-shop-domain') shop: string,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    this.logger.log(`Received webhook: ${topic} from shop: ${shop}`);

    try {
      // Verify webhook
      const requestBody = JSON.stringify(request.body);
      const isValid = await this.shopifyWebhookService.verifyWebhook(hmac, requestBody);

      if (!isValid) {
        this.logger.warn(`Invalid webhook signature for shop: ${shop}, topic: ${topic}`);
        response.status(HttpStatus.UNAUTHORIZED).send();
        return;
      }

      // Process webhook
      await this.shopifyWebhookService.handleWebhook(topic, shop, request.body);
      response.status(HttpStatus.OK).send();
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error instanceof Error ? error.message : String(error)}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('products/sync')
  async syncProducts(@Query('shop') shop: string, @Res() response: Response): Promise<void> {
    this.logger.log(`Initiating product sync for shop: ${shop}`);

    try {
      const result = await this.shopifyAppService.syncProducts(shop);
      response.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(
        `Error syncing products: ${error instanceof Error ? error.message : String(error)}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to sync products',
      });
    }
  }

  @Get('orders/sync')
  async syncOrders(@Query('shop') shop: string, @Res() response: Response): Promise<void> {
    this.logger.log(`Initiating order sync for shop: ${shop}`);

    try {
      const result = await this.shopifyAppService.syncOrders(shop);
      response.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(
        `Error syncing orders: ${error instanceof Error ? error.message : String(error)}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to sync orders',
      });
    }
  }
}
