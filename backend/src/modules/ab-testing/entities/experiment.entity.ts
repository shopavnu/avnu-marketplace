import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { ExperimentVariant } from './experiment-variant.entity';

export enum ExperimentStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum ExperimentType {
  SEARCH_ALGORITHM = 'search_algorithm',
  UI_COMPONENT = 'ui_component',
  PERSONALIZATION = 'personalization',
  RECOMMENDATION = 'recommendation',
  PRICING = 'pricing',
  CONTENT = 'content',
  FEATURE_FLAG = 'feature_flag',
}

@ObjectType()
@Entity('experiments')
export class Experiment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => ExperimentStatus)
  @Column({
    type: 'enum',
    enum: ExperimentStatus,
    default: ExperimentStatus.DRAFT,
  })
  status: ExperimentStatus;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ExperimentType,
  })
  type: ExperimentType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  targetAudience: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  audiencePercentage: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  hypothesis: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  primaryMetric: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  secondaryMetrics: string[];

  @Field(() => Boolean)
  @Column({ default: false })
  hasWinner: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  winningVariantId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  segmentation: string;

  @Field(() => [ExperimentVariant], { nullable: true })
  @OneToMany(() => ExperimentVariant, variant => variant.experiment, {
    cascade: true,
    eager: true,
  })
  variants: ExperimentVariant[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
