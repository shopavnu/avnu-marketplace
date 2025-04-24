import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('user_preferences')
export class UserPreferences {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  favoriteCategories: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  favoriteValues: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  favoriteBrands: string[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  priceSensitivity: 'low' | 'medium' | 'high';

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  preferSustainable: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  preferEthical: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  preferLocalBrands: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  preferredSizes: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  preferredColors: string[];

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  preferredMaterials: string[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
