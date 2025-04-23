import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

export enum BehaviorType {
  VIEW = 'view',
  SEARCH = 'search',
  FAVORITE = 'favorite',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
}

@ObjectType()
@Entity('user_behaviors')
@Index(['userId', 'entityId', 'entityType', 'behaviorType'], { unique: true })
export class UserBehavior {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => String)
  @Column()
  @Index()
  entityId: string;

  @Field(() => String)
  @Column()
  @Index()
  entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search';

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: BehaviorType,
  })
  @Index()
  behaviorType: BehaviorType;

  @Field(() => Int)
  @Column({ default: 1 })
  count: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  metadata: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @Column()
  lastInteractionAt: Date;
}
