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
@Entity('merchant_products')
export class MerchantProduct {
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
  productId: string;

  @Field()
  @Column({ default: true })
  isVisible: boolean;

  @Field()
  @Column({ default: false })
  isPromoted: boolean;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyAdBudget: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  adSpendToDate: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  organicImpressions: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  paidImpressions: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionRate: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  clicks: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  cartAdds: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  cartAbandons: number;

  @Field(() => Boolean)
  @Column({ default: false })
  enableRetargeting: boolean;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  retargetingBudget: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  lastPromotedAt: Date;
}
