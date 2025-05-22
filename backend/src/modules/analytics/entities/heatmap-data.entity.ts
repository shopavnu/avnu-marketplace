import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Field, ID, ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';

export enum InteractionType {
  CLICK = 'click',
  HOVER = 'hover',
  SCROLL_PAUSE = 'scroll_pause',
  FORM_INTERACTION = 'form_interaction',
  SELECTION = 'selection',
}

@ObjectType()
@Entity('heatmap_data')
export class HeatmapData {
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
    enum: InteractionType,
  })
  @Index()
  interactionType: InteractionType;

  @Field(() => Int)
  @Column()
  xPosition: number;

  @Field(() => Int)
  @Column()
  yPosition: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  elementSelector: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  elementId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  elementText: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  dwellTimeMs: number;

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
