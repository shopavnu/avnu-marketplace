import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Merchant } from './merchant.entity';

@ObjectType()
@Entity('merchant_brands')
export class MerchantBrand {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  merchantId: string;

  @Field(() => Merchant)
  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  colorPalette: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  primaryColor: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  secondaryColor: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  accentColor: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  brandStory: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  foundedYear: number;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  socialMediaLinks: string[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: true })
  isActive: boolean;
}
