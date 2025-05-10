import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

// Import only the enum from vendor.entity to avoid circular imports
import { VendorStatus } from './vendor.entity';

export enum ApplicationStep {
  BUSINESS_INFO = 'business_info',
  PRODUCT_INFO = 'product_info',
  PAYMENT_INFO = 'payment_info',
  VERIFICATION = 'verification',
  COMPLETED = 'completed',
}

@Entity('vendor_applications')
export class VendorApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status!: VendorStatus;

  @Column({
    type: 'enum',
    enum: ApplicationStep,
    default: ApplicationStep.BUSINESS_INFO,
  })
  currentStep!: ApplicationStep;

  @Column({ type: 'jsonb', nullable: true })
  formData: any;

  @Column({ nullable: true })
  vendorId!: string;

  // Using string-based references to avoid circular dependencies
  @OneToOne('Vendor')
  @JoinColumn({ name: 'vendor_id' })
  vendor: any; // Type will be resolved at runtime

  @Column({ nullable: true })
  submittedAt!: Date;

  @Column({ nullable: true })
  reviewStartedAt!: Date;

  @Column({ nullable: true })
  reviewCompletedAt!: Date;

  @Column({ nullable: true })
  reviewedBy!: string;

  @Column({ type: 'text', nullable: true })
  adminNotes!: string;

  @Column({ nullable: true })
  rejectionReason!: string;

  // Using string-based references to avoid circular dependencies
  @OneToMany('VendorDocument', 'application')
  documents!: any[]; // Type will be resolved at runtime

  @Column({ default: false })
  termsAccepted!: boolean;

  @Column({ default: false })
  isNotificationSent!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
