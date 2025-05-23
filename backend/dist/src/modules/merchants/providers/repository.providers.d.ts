import { Provider } from '@nestjs/common';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
export declare const merchantRepositoryFactories: {
    new (repository: import("typeorm").Repository<MerchantAnalytics>): {
        readonly repository: import("typeorm").Repository<MerchantAnalytics>;
        getRepository(): import("typeorm").Repository<MerchantAnalytics>;
    };
}[];
export declare const merchantRepositoryProviders: Provider[];
