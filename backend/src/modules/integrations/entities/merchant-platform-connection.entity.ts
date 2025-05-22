// @ts-strict-mode: enabled
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { PlatformType } from '../enums/platform-type.enum';

@Entity({ name: 'merchant_platform_connections' })
export class MerchantPlatformConnection {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ name: 'merchant_id' })
  merchantId: string = '';

  @ManyToOne(() => Merchant, { eager: true })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant = new Merchant();

  @Column({ name: 'platform_type', type: 'varchar' })
  platformType: PlatformType = PlatformType.SHOPIFY;

  @Column({ name: 'platform_identifier', nullable: true })
  platformIdentifier: string = '';

  @Column({ name: 'platform_store_name' })
  platformStoreName: string = '';

  @Column({ name: 'platform_store_url' })
  platformStoreUrl: string = '';

  @Column({ name: 'access_token', nullable: true })
  // We initialize nullable columns with their default values
  accessToken: string = '';

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string = '';

  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date = new Date();

  @Column({ name: 'is_active', default: true })
  isActive: boolean = true;

  @Column({ name: 'last_synced_at', nullable: true })
  lastSyncedAt: Date = new Date();

  @Column({ name: 'last_sync_status', nullable: true })
  lastSyncStatus: string = '';

  @Column({ name: 'last_sync_error', nullable: true, type: 'text' })
  lastSyncError: string = '';

  @Column({ name: 'platform_config', type: 'json', nullable: true })
  platformConfig: Record<string, unknown> = {};

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();
}
