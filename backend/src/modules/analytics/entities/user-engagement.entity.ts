import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

export enum EngagementType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  CATEGORY_VIEW = 'category_view',
  BRAND_VIEW = 'brand_view',
  SEARCH = 'search',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  FAVORITE = 'favorite',
  UNFAVORITE = 'unfavorite',
  SHARE = 'share',
  FILTER_USE = 'filter_use',
  SORT_USE = 'sort_use',
  RECOMMENDATION_CLICK = 'recommendation_click',
  SIGNUP = 'signup',
  LOGIN = 'login',
  ACCOUNT_UPDATE = 'account_update',
}

@ObjectType()
@Entity('user_engagement')
export class UserEngagement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  sessionId: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: EngagementType,
  })
  @Index()
  engagementType: EngagementType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  entityId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  entityType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  pagePath: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  referrer: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  durationSeconds: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  platform: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  ipAddress: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userAgent: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
