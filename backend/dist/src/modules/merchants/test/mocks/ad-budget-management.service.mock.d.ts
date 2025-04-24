import { EventEmitter2 } from '@nestjs/event-emitter';
import { BudgetAllocationStrategy, BudgetForecast, BudgetUpdateResult, BudgetUtilization } from './entity-mocks';
export declare class AdBudgetManagementService {
    private readonly eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    getBudgetUtilization(merchantId: string): Promise<BudgetUtilization>;
    getBudgetForecast(merchantId: string): Promise<BudgetForecast>;
    getDailyBudget(merchantId: string): Promise<number>;
    allocateBudgetAcrossCampaigns(merchantId: string, campaignIds: string[], totalBudget: number, strategy?: BudgetAllocationStrategy): Promise<Record<string, number>>;
    recordAdSpend(campaignId: string, amount: number, impressionCount?: number): Promise<BudgetUpdateResult>;
}
