import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { ExperimentVariant } from './experiment-variant.entity';

export enum ResultType {
  IMPRESSION = 'impression',
  CLICK = 'click',
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
  CUSTOM = 'custom',
}

@ObjectType()
@Entity('experiment_results')
export class ExperimentResult {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  variantId: string;

  @ManyToOne(() => ExperimentVariant, variant => variant.results)
  @JoinColumn({ name: 'variantId' })
  variant: ExperimentVariant;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sessionId: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ResultType,
  })
  resultType: ResultType;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  value: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  context: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  timestamp: Date;
}
