import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('query_performance_metrics')
export class QueryPerformanceMetric {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index()
  queryId: string;

  @Field(() => String)
  @Column()
  @Index()
  queryType: string;

  @Field(() => Int)
  @Column()
  executionTime: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  parameters: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  resultCount: number;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
