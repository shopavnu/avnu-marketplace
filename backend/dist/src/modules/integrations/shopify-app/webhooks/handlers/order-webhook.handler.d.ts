import { Repository } from 'typeorm';
import {
  BaseWebhookHandler,
  WebhookContext,
  WebhookHandlerResult,
} from '../webhook-handler.interface';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
export declare class OrderWebhookHandler extends BaseWebhookHandler {
  private readonly merchantPlatformConnectionRepository;
  private readonly logger;
  constructor(merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>);
  process(context: WebhookContext): Promise<WebhookHandlerResult>;
  private handleOrderCreate;
  private handleOrderUpdate;
  private handleOrderCancel;
  private handleOrderFulfill;
  private handleOrderPaid;
  private getMerchantIdByShop;
}
