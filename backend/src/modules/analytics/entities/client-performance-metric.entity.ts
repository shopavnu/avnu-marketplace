import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Float, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('client_performance_metrics')
export class ClientPerformanceMetric {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @Index()
  userId: string;

  @Field(() => String)
  @Column()
  @Index()
  sessionId: string;

  @Field(() => String)
  @Column()
  @Index()
  pagePath: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  platform: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  browserName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  browserVersion: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  firstContentfulPaint: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  largestContentfulPaint: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  firstInputDelay: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  cumulativeLayoutShift: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  timeToInteractive: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  totalBlockingTime: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  domContentLoaded: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  windowLoad: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  resourceLoadTimes: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  networkInformation: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
