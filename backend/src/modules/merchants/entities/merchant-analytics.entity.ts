import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { Merchant } from './merchant.entity';

@ObjectType()
@Entity('merchant_analytics')
export class MerchantAnalytics {
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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  productId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  categoryId: string;

  @Field(() => GraphQLISODateTime)
  @Column()
  date: Date;

  @Field(() => String)
  @Column()
  timeFrame: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;

  @Field(() => Int)
  @Column({ default: 0 })
  orders: number;

  @Field(() => Int)
  @Column({ default: 0 })
  productViews: number;

  @Field(() => Int)
  @Column({ default: 0 })
  organicImpressions: number;

  @Field(() => Int)
  @Column({ default: 0 })
  paidImpressions: number;

  @Field(() => Int)
  @Column({ default: 0 })
  clicks: number;

  @Field(() => Int)
  @Column({ default: 0 })
  addToCarts: number;

  @Field(() => Int)
  @Column({ default: 0 })
  abandonedCarts: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clickThroughRate: number;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  demographics: string[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
