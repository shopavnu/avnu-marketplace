import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Field, ID, ObjectType, Float, GraphQLISODateTime } from '@nestjs/graphql';

/**
 * Similarity types between products
 */
export enum SimilarityType {
  ATTRIBUTE_BASED = 'attribute_based',
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  HYBRID = 'hybrid',
  PURCHASE_BASED = 'purchase_based',
  VIEW_BASED = 'view_based',
  CATEGORY_BASED = 'category_based',
  PRICE_BASED = 'price_based',
  BRAND_BASED = 'brand_based',
  EMBEDDING_BASED = 'embedding_based',
}

/**
 * Entity for storing product similarity relationships
 */
@ObjectType()
@Entity('product_similarities')
@Unique(['sourceProductId', 'targetProductId', 'similarityType'])
@Index(['sourceProductId', 'similarityType', 'score'])
export class ProductSimilarity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index()
  sourceProductId: string;

  @Field(() => String)
  @Column()
  @Index()
  targetProductId: string;

  @Field(() => SimilarityType)
  @Column({
    type: 'enum',
    enum: SimilarityType,
    default: SimilarityType.ATTRIBUTE_BASED,
  })
  similarityType: SimilarityType;

  @Field(() => Float)
  @Column({ type: 'float' })
  score: number;

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
