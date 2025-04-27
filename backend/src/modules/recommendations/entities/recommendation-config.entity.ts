import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

/**
 * Algorithm types for product recommendations
 */
export enum RecommendationAlgorithmType {
  CONTENT_BASED = 'content_based',
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  HYBRID = 'hybrid',
  RULE_BASED = 'rule_based',
  POPULARITY_BASED = 'popularity_based',
  ATTRIBUTE_BASED = 'attribute_based',
  EMBEDDING_BASED = 'embedding_based',
  CUSTOM = 'custom',
}

/**
 * Entity for storing recommendation algorithm configurations
 */
@ObjectType()
@Entity('recommendation_configs')
export class RecommendationConfig {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index({ unique: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => RecommendationAlgorithmType)
  @Column({
    type: 'enum',
    enum: RecommendationAlgorithmType,
    default: RecommendationAlgorithmType.CONTENT_BASED,
  })
  algorithmType: RecommendationAlgorithmType;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @Column({ default: 1 })
  version: number;

  @Field(() => String)
  @Column({ type: 'jsonb', default: '{}' })
  parameters: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  supportedRecommendationTypes: string[];

  @Field(() => Int, { defaultValue: 10 })
  @Column({ default: 10 })
  defaultLimit: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  totalImpressions: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  totalClicks: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  totalConversions: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  experimentId: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
