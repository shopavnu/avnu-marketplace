import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

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

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  quantity?: number;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  values?: string[];

  @Field()
  @Column()
  externalId: string;

  @Field()
  @Column()
  externalSource: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

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
