import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('user_experiment_assignments')
@Index(['userId', 'experimentId'], { unique: true })
@Index(['sessionId', 'experimentId'], { unique: true })
export class UserExperimentAssignment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  sessionId: string;

  @Field(() => String)
  @Column()
  @Index()
  experimentId: string;

  @Field(() => String)
  @Column()
  @Index()
  variantId: string;

  @Field(() => Boolean)
  @Column({ default: false })
  hasImpression: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  hasInteraction: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  hasConversion: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
