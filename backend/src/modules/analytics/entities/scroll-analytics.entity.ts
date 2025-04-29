import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, Float, GraphQLISODateTime } from '@nestjs/graphql';

export enum ScrollDirection {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

@ObjectType()
@Entity('scroll_analytics')
export class ScrollAnalytics {
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

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ScrollDirection,
    default: ScrollDirection.VERTICAL,
  })
  direction: ScrollDirection;

  @Field(() => Int)
  @Column()
  maxScrollDepth: number;

  @Field(() => Int)
  @Column()
  pageHeight: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  maxScrollPercentage: number;

  @Field(() => Int)
  @Column()
  scrollCount: number;

  @Field(() => Int)
  @Column()
  dwellTimeSeconds: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  scrollDepthTimestamps: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  platform: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  viewportDimensions: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
