import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('vendor_banking_details')
export class VendorBankingDetails {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vendorId!: string;

  // Using string-based references to avoid circular dependencies
  @OneToOne('Vendor', 'bankingDetails')
  @JoinColumn({ name: 'vendor_id' })
  vendor: any; // Type will be resolved at runtime

  @Column({ length: 255 })
  bankName!: string;

  @Column({ length: 255 })
  accountHolderName!: string;

  @Column({ length: 255 })
  accountNumber!: string;

  @Column({ length: 50 })
  routingNumber!: string;

  @Column({ length: 50, nullable: true })
  accountType!: string;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
