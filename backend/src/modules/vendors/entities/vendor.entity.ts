import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';

export enum VendorStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum BusinessType {
  INDIVIDUAL = 'individual',
  LLC = 'llc',
  CORPORATION = 'corporation',
  PARTNERSHIP = 'partnership',
  OTHER = 'other',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  businessName!: string;

  @Column({ length: 255 })
  @Index({ unique: true })
  businessEmail!: string;

  @Column({ length: 50 })
  phone!: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    default: BusinessType.INDIVIDUAL,
  })
  businessType!: BusinessType;

  @Column({ length: 255, nullable: true })
  website!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status!: VendorStatus;

  @Column({ length: 255, nullable: true })
  businessId!: string;

  @Column({ type: 'simple-array', nullable: true })
  productCategories!: string[];

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @Column({ nullable: true })
  verifiedBy!: string;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  commissionRate!: number;

  @Column({ default: true })
  canListNewProducts!: boolean;

  @Column({ default: 0 })
  productsCount!: number;

  // Using string-based references to avoid circular dependencies
  @OneToOne('VendorBankingDetails', 'vendor', {
    cascade: true,
  })
  bankingDetails: any; // Type will be resolved at runtime

  // Using string-based references to avoid circular dependencies
  @OneToMany('VendorDocument', 'vendor', {
    cascade: true,
  })
  documents!: any[]; // Type will be resolved at runtime

  // Using string-based references to avoid circular dependencies
  @OneToMany('Product', 'vendor')
  products!: any[]; // Type will be resolved at runtime

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
