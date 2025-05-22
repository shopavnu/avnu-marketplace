import { IntegrationsService, IntegrationType } from './integrations.service';
export declare class IntegrationsController {
  private readonly integrationsService;
  constructor(integrationsService: IntegrationsService);
  authenticate(type: IntegrationType, credentials: any): Promise<boolean>;
  syncProducts(
    type: IntegrationType,
    body: {
      credentials: any;
      merchantId: string;
    },
  ): Promise<{
    created: number;
    updated: number;
    failed: number;
  }>;
  handleWebhook(
    type: IntegrationType,
    body: {
      payload: any;
      topic: string;
      merchantId: string;
    },
  ): Promise<void>;
}
