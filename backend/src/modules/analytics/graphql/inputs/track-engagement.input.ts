import { InputType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { EngagementType } from '../../entities/user-engagement.entity';

// Register the enum with GraphQL
registerEnumType(EngagementType, {
  name: 'EngagementType',
  description: 'The type of user engagement being tracked',
});

@InputType()
export class TrackEngagementInput {
  @Field(() => ID, { nullable: true }) // ID is usually not provided on input
  id?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  sessionId?: string;

  @Field(() => EngagementType)
  engagementType: EngagementType;

  @Field(() => String, { nullable: true })
  entityId?: string;

  @Field(() => String, { nullable: true })
  entityType?: string;

  @Field(() => String, { nullable: true })
  pagePath?: string;

  @Field(() => String, { nullable: true })
  referrer?: string;

  @Field(() => Int, { nullable: true })
  durationSeconds?: number;

  @Field(() => String, { nullable: true }) // Assuming metadata is JSON stringified for input
  metadata?: string;

  @Field(() => String, { nullable: true })
  deviceType?: string;

  @Field(() => String, { nullable: true })
  platform?: string;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  // Exclude timestamp as it's auto-generated
  // @Field(() => Date, { nullable: true })
  // timestamp?: Date;
}
