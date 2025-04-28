import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity('categories')
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  parentId?: string;

  @Column('text', { array: true, default: [] })
  @Field(() => [String], { defaultValue: [] })
  tags: string[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
