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
@Entity('navigation_sections')
export class NavigationSection {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  name: string;

  @Field()
  @Column()
  @Index()
  route: string;

  @Field()
  @Column()
  selector: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  childSelectors?: string[];

  @Field()
  @Column()
  @Index()
  priority: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ariaLabel?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  parentSectionId?: string;

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
