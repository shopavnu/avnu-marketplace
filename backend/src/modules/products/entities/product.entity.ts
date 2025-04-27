import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
class ImageMetadata {
  @Field(() => Int)
  width: number;

  @Field(() => Int)
  height: number;

  @Field()
  format: string;

  @Field(() => Float, { nullable: true })
  aspectRatio?: number;

  @Field(() => Int, { nullable: true })
  size?: number;
}

@ObjectType()
class ProductAttributes {
  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  material?: string;

  @Field({ nullable: true })
  weight?: string;

  @Field({ nullable: true })
  dimensions?: string;

  @Field(() => [String], { nullable: true })
  customAttributes?: string[];
}

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Field(() => [String])
  @Column('simple-array')
  images: string[];

  @Field(() => [ImageMetadata], { nullable: true })
  @Column('json', { nullable: true })
  imageMetadata?: ImageMetadata[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  mobileImages?: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  tabletImages?: string[];

  @Field(() => String, { nullable: true })
  @Column('json', { nullable: true })
  responsiveImageData?: Record<
    string,
    {
      desktop: string;
      tablet?: string;
      mobile?: string;
    }
  >;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  thumbnail?: string;

  @Field(() => [String])
  @Column('simple-array')
  categories: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Field()
  @Column()
  merchantId: string;

  @Field()
  @Column()
  brandName: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: true })
  inStock: boolean;

  @Field()
  @Column({ default: false })
  featured: boolean;

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  quantity?: number;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  values?: string[];

  @Field(() => ProductAttributes, { nullable: true })
  @Column('json', { nullable: true })
  attributes?: ProductAttributes;

  @Field()
  @Column()
  externalId: string;

  @Field()
  @Column()
  @Index()
  externalSource: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  slug?: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isSuppressed: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  suppressedFrom?: string[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  lastValidationDate?: Date;

  // Virtual fields
  @Field(() => Boolean)
  get isOnSale(): boolean {
    return this.compareAtPrice !== null && this.price < this.compareAtPrice;
  }

  @Field(() => Float, { nullable: true })
  get discountPercentage(): number | null {
    if (!this.isOnSale || !this.compareAtPrice) return null;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
}
