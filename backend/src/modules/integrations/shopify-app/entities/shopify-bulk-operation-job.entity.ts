import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';

/**
 * Status of a bulk operation job
 */
export enum BulkOperationJobStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  TIMED_OUT = 'TIMED_OUT',
}

/**
 * Entity to track Shopify bulk operation jobs
 */
@Entity('shopify_bulk_operation_jobs')
export class ShopifyBulkOperationJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  merchantId: string;

  @Column({ nullable: false })
  @Index()
  shopifyBulkOperationId: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: true, type: 'text' })
  query: string;

  @Column({
    type: 'enum',
    enum: BulkOperationJobStatus,
    default: BulkOperationJobStatus.CREATED,
  })
  @Index()
  status: BulkOperationJobStatus;

  @Column({ nullable: true })
  statusMessage: string;

  @Column({ nullable: true })
  errorCode: string;

  @Column({ nullable: true, type: 'text' })
  errorDetails: string;

  @Column({ nullable: true })
  resultUrl: string;

  @Column({ nullable: true })
  partialResultUrl: string;

  @Column({ default: 0 })
  objectCount: number;

  @Column({ default: 0 })
  fileSize: number;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 0 })
  progressPercentage: number;

  @Column({ nullable: true, type: 'json' })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  connectionId: string;

  @ManyToOne(() => MerchantPlatformConnection)
  @JoinColumn({ name: 'connectionId' })
  connection: MerchantPlatformConnection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
