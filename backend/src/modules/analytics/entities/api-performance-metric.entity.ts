import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('api_performance_metrics')
export class ApiPerformanceMetric {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index()
  endpoint: string;

  @Field(() => String)
  @Column()
  method: string;

  @Field(() => Int)
  @Column()
  responseTime: number;

  @Field(() => Int)
  @Column()
  statusCode: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sessionId: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
