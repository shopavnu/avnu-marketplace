import { EventEmitter2 } from '@nestjs/event-emitter';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUpdateResult, BudgetUtilization } from './entity-mocks';
export declare class AdBudgetManagementService {
    private readonly eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    getBudgetUtilization(_merchantId: string): Promise<BudgetUtilization>;
    getBudgetForecast(_merchantId: string): Promise<BudgetForecast>;
    getDailyBudget(_merchantId: string): Promise<number>;
    allocateBudgetAcrossCampaigns(_merchantId: string, campaignIds: string[], totalBudget: number, strategy?: BudgetAllocationStrategy): Promise<Record<string, number>>;
    recordAdSpend(campaignId: string, amount: number, _impressionCount?: number): Promise<BudgetUpdateResult>;
}
