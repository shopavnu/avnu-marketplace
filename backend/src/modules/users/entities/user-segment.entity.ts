import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'; // Removed unused ManyToMany import
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType('UserSegment')
@Entity('user_segments')
export class UserSegmentEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  userCount: number;

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, user => user.segment)
  users: User[];

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
