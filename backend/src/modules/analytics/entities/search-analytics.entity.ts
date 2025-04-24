import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
@Entity('search_analytics')
export class SearchAnalytics {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  @Index()
  query: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sessionId: string;

  @Field(() => Int)
  @Column({ default: 0 })
  resultCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  clickCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  conversionCount: number;

  @Field(() => Boolean)
  @Column({ default: false })
  hasFilters: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  filters: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  categoryContext: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deviceType: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  platform: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isNlpEnhanced: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isPersonalized: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  highlightsEnabled: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  referrer: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  experimentId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  filterCount: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userAgent: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
