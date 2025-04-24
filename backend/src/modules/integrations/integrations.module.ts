import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from '../products/products.module';
import { ShopifyService } from './services/shopify.service';
import { WooCommerceService } from './services/woocommerce.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [ConfigModule, ProductsModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, ShopifyService, WooCommerceService],
  exports: [IntegrationsService, ShopifyService, WooCommerceService],
})
export class IntegrationsModule {}
