import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('focus_states')
export class FocusState {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  userId: string;

  @Field()
  @Column()
  @Index()
  sessionId: string;

  @Field()
  @Column()
  route: string;

  @Field()
  @Column()
  sectionId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  elementId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  elementSelector?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  context?: string;

  @Field()
  @Column({ type: 'timestamp' })
  @Index()
  lastActive: Date;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => CreateDateColumn)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => UpdateDateColumn)
  @UpdateDateColumn()
  updatedAt: Date;
}
