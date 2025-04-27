import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

/**
 * Recommendation types
 */
export enum RecommendationType {
  SIMILAR_PRODUCTS = 'similar_products',
  FREQUENTLY_BOUGHT_TOGETHER = 'frequently_bought_together',
  COMPLEMENTARY_PRODUCTS = 'complementary_products',
  PERSONALIZED = 'personalized',
  TRENDING = 'trending',
  TOP_RATED = 'top_rated',
  RECENTLY_VIEWED = 'recently_viewed',
  PRICE_DROP = 'price_drop',
  SEASONAL = 'seasonal',
  FEATURED = 'featured'
}

/**
 * Entity for storing product recommendations
 */
@ObjectType()
@Entity('product_recommendations')
export class ProductRecommendation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index()
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  sessionId: string;

  @Field(() => String)
  @Column()
  @Index()
  productId: string;

  @Field(() => RecommendationType)
  @Column({
    type: 'enum',
    enum: RecommendationType,
    default: RecommendationType.SIMILAR_PRODUCTS
  })
  recommendationType: RecommendationType;

  @Field(() => String)
  @Column()
  algorithmId: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  score: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  position: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  impressions: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  clicks: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  conversions: number;

  @Field(() => Float, { defaultValue: 0 })
  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Field(() => Float, { defaultValue: 0 })
  @Column({ type: 'float', default: 0 })
  clickThroughRate: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
