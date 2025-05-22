import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PlatformType } from '../../shared';

/**
 * Entity representing a connection between a merchant and an e-commerce platform
 */
@Entity('merchant_platform_connections')
export class MerchantPlatformConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @Column({ name: 'platform_type', type: 'enum', enum: PlatformType })
  platformType: PlatformType;

  @Column({ name: 'platform_store_name' })
  platformStoreName: string;

  @Column({ name: 'platform_access_token', nullable: true })
  platformAccessToken?: string;

  @Column({ name: 'platform_refresh_token', nullable: true })
  platformRefreshToken?: string;
  
  @Column({ name: 'platform_store_id', nullable: true })
  platformStoreId?: string;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @Column({ name: 'last_sync_status', nullable: true })
  lastSyncStatus?: string;

  @Column({ name: 'last_sync_error', type: 'text', nullable: true })
  lastSyncError?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
