import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  // Removed unused OneToMany import
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';
import { Merchant } from './merchant.entity';

export enum CampaignType {
  PRODUCT_PROMOTION = 'product_promotion',
  RETARGETING = 'retargeting',
  BRAND_AWARENESS = 'brand_awareness',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum TargetAudience {
  ALL = 'all',
  PREVIOUS_VISITORS = 'previous_visitors',
  CART_ABANDONERS = 'cart_abandoners',
  PREVIOUS_CUSTOMERS = 'previous_customers',
}

registerEnumType(CampaignType, { name: 'CampaignType' });
registerEnumType(CampaignStatus, { name: 'CampaignStatus' });
registerEnumType(TargetAudience, { name: 'TargetAudience' });

@ObjectType()
@Entity('merchant_ad_campaigns')
export class MerchantAdCampaign {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  merchantId: string;

  @Field(() => Merchant)
  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => CampaignType)
  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.PRODUCT_PROMOTION,
  })
  type: CampaignType;

  @Field(() => CampaignStatus)
  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Field(() => [String])
  @Column('simple-array')
  productIds: string[];

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budget: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  spent: number;

  @Field(() => TargetAudience)
  @Column({
    type: 'enum',
    enum: TargetAudience,
    default: TargetAudience.ALL,
  })
  targetAudience: TargetAudience;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  targetDemographics: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  targetLocations: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  targetInterests: string[];

  @Field(() => GraphQLISODateTime)
  @Column()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  impressions: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  clicks: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  clickThroughRate: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  conversions: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionRate: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  lastUpdatedByMerchantAt: Date;
}
