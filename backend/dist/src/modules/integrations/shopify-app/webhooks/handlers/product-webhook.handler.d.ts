import { Repository } from 'typeorm';
import {
  BaseWebhookHandler,
  WebhookContext,
  WebhookHandlerResult,
} from '../webhook-handler.interface';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
export declare class ProductWebhookHandler extends BaseWebhookHandler {
  private readonly merchantPlatformConnectionRepository;
  private readonly logger;
  constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>);
  process(context: WebhookContext): Promise<WebhookHandlerResult>;
  private handleProductCreate;
  private handleProductUpdate;
  private handleProductDelete;
  private getMerchantIdByShop;
}
