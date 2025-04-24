import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('brands')
export class Brand {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  values: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  categories: string[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  foundedYear: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  origin: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Field(() => Int)
  @Column({ default: 0 })
  reviewCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  productCount: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  popularity: number;
}
