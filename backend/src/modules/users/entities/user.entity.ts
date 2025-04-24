import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, ID, ObjectType, registerEnumType, GraphQLISODateTime } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { UserSegmentEntity } from './user-segment.entity';

// Define the UserRole enum
export enum UserRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

// Register the enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Defines the roles a user can have',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Exclude()
  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profileImage?: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  interests: string[];

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isMerchant: boolean;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => UserSegmentEntity, { nullable: true })
  @ManyToOne(() => UserSegmentEntity, segment => segment.users, { nullable: true })
  @JoinColumn({ name: 'segment_id' })
  segment: UserSegmentEntity;

  // Virtual field for full name
  @Field()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
