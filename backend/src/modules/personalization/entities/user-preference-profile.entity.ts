import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType, GraphQLISODateTime, Float, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

/**
 * Entity for storing detailed user preference profiles based on behavior analysis
 */
@ObjectType()
@Entity('user_preference_profiles')
export class UserPreferenceProfile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @Field(() => Int)
  @Column({ type: 'integer', default: 0 })
  totalPageViews: number;

  @Field(() => Int)
  @Column({ type: 'integer', default: 0 })
  totalProductViews: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  averageScrollDepth: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  averageProductViewTimeSeconds: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 0 })
  averageSessionDurationMinutes: number;

  @Field(() => Int)
  @Column({ type: 'integer', default: 0 })
  productEngagementCount: number;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  topViewedCategories: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  topViewedBrands: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  recentlyViewedProducts: string[];

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  categoryPreferences: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  brandPreferences: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  productPreferences: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  viewTimeByCategory: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  viewTimeByBrand: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  scrollDepthByPageType: Record<string, number>;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  priceRangePreferences: Record<string, number>;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  hasEnoughData: boolean;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
