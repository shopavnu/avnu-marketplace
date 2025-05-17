import { Logger } from '@nestjs/common';
import { IntegrationType } from '../types/integration-type.enum';
export declare abstract class BaseIntegrationService {
    protected readonly logger: Logger;
    abstract readonly integrationType: IntegrationType;
    abstract initialize(): Promise<void>;
    abstract authenticate(credentials: Record<string, any>): Promise<string | null>;
    abstract syncProducts(merchantId: string, options?: Record<string, any>): Promise<{
        created: number;
        updated: number;
        failed: number;
    }>;
    abstract handleWebhook(topic: string, shop: string, data: Record<string, any>): Promise<void>;
}
