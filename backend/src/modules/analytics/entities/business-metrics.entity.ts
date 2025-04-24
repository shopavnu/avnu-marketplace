import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

export enum MetricType {
  REVENUE = 'revenue',
  ORDERS = 'orders',
  AOV = 'average_order_value',
  CONVERSION_RATE = 'conversion_rate',
  PRODUCT_VIEWS = 'product_views',
  CART_ADDS = 'cart_adds',
  CHECKOUT_STARTS = 'checkout_starts',
  CHECKOUT_COMPLETIONS = 'checkout_completions',
  CART_ABANDONMENT = 'cart_abandonment',
  NEW_USERS = 'new_users',
  RETURNING_USERS = 'returning_users',
  SEARCH_COUNT = 'search_count',
  SEARCH_CONVERSION = 'search_conversion',
  MERCHANT_REVENUE = 'merchant_revenue',
  PLATFORM_REVENUE = 'platform_revenue',
}

export enum TimeGranularity {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@ObjectType()
@Entity('business_metrics')
export class BusinessMetrics {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: MetricType,
  })
  @Index()
  metricType: MetricType;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  value: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  count: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  dimension1: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  dimension2: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  dimension3: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: TimeGranularity,
    default: TimeGranularity.DAILY,
  })
  timeGranularity: TimeGranularity;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;

  @Field(() => GraphQLISODateTime)
  @Column()
  @Index()
  periodStart: Date;

  @Field(() => GraphQLISODateTime)
  @Column()
  periodEnd: Date;
}
