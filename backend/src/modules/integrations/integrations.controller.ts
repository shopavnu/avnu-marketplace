import { Controller, Post, Body, UseGuards, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService, IntegrationType } from './integrations.service';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post(':type/authenticate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with an e-commerce platform' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  authenticate(@Param('type') type: IntegrationType, @Body() credentials: any) {
    return this.integrationsService.authenticate(type, credentials);
  }

  @Post(':type/sync-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync products from an e-commerce platform' })
  @ApiResponse({ status: 200, description: 'Products synced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  syncProducts(
    @Param('type') type: IntegrationType,
    @Body() body: { credentials: any; merchantId: string },
  ) {
    return this.integrationsService.syncProducts(type, body.credentials, body.merchantId);
  }

  @Post(':type/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle webhook from an e-commerce platform' })
  @ApiResponse({ status: 200, description: 'Webhook handled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  handleWebhook(
    @Param('type') type: IntegrationType,
    @Body() body: { payload: any; topic: string; merchantId: string },
  ) {
    return this.integrationsService.handleWebhook(type, body.payload, body.topic, body.merchantId);
  }
}
