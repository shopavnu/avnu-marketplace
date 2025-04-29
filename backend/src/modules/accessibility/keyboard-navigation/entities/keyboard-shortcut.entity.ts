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
class ShortcutKey {
  @Field()
  key: string;

  @Field({ nullable: true })
  altKey?: boolean;

  @Field({ nullable: true })
  ctrlKey?: boolean;

  @Field({ nullable: true })
  shiftKey?: boolean;

  @Field({ nullable: true })
  metaKey?: boolean;
}

@ObjectType()
@Entity('keyboard_shortcuts')
export class KeyboardShortcut {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => ShortcutKey)
  @Column('json')
  shortcutKey: ShortcutKey;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  userId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sectionId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  action?: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isGlobal: boolean;

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
