import { Merchant } from '../../merchants/entities/merchant.entity';
import { PlatformType } from '../enums/platform-type.enum';
export declare class MerchantPlatformConnection {
    id: number;
    merchantId: string;
    merchant: Merchant;
    platformType: PlatformType;
    platformIdentifier: string;
    platformStoreName: string;
    platformStoreUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
    isActive: boolean;
    lastSyncedAt: Date;
    lastSyncStatus: string;
    lastSyncError: string;
    platformConfig: Record<string, unknown>;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
