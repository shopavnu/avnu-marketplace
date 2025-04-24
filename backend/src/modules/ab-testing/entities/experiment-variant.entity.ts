import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Field, ID, ObjectType, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { Experiment } from './experiment.entity';
import { ExperimentResult } from './experiment-result.entity';

@ObjectType()
@Entity('experiment_variants')
export class ExperimentVariant {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isControl: boolean;

  @Field(() => String)
  @Column()
  experimentId: string;

  @ManyToOne(() => Experiment, experiment => experiment.variants)
  @JoinColumn({ name: 'experimentId' })
  experiment: Experiment;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  configuration: string;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  impressions: number;

  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  conversions: number;

  @Field(() => Float, { defaultValue: 0 })
  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  improvementRate: number;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isWinner: boolean;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  confidenceLevel: number;

  @Field(() => [ExperimentResult], { nullable: true })
  @OneToMany(() => ExperimentResult, result => result.variant, {
    cascade: true,
  })
  results: ExperimentResult[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;
}
