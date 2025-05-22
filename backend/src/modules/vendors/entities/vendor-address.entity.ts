import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum AddressType {
  BUSINESS = 'business',
  SHIPPING = 'shipping',
  BILLING = 'billing',
  WAREHOUSE = 'warehouse',
}

@Entity('vendor_addresses')
export class VendorAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vendorId!: string;

  // Using string-based references to avoid circular dependencies
  @ManyToOne('Vendor')
  @JoinColumn({ name: 'vendor_id' })
  vendor: any; // Type will be resolved at runtime

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.BUSINESS,
  })
  addressType!: AddressType;

  @Column({ length: 255 })
  addressLine1!: string;

  @Column({ length: 255, nullable: true })
  addressLine2!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 100 })
  state!: string;

  @Column({ length: 20 })
  postalCode!: string;

  @Column({ length: 100 })
  country!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @Column({ length: 100, nullable: true })
  contactName!: string;

  @Column({ length: 50, nullable: true })
  contactPhone!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
