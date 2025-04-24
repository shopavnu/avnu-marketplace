import { InputType, Field, Int, ID } from '@nestjs/graphql';
import {} from /* CreateDateColumn */ 'typeorm'; // Import CreateDateColumn if needed

@InputType()
export class TrackSearchInput {
  @Field(() => ID, { nullable: true }) // ID is usually not provided on input
  id?: string;

  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  sessionId?: string;

  @Field(() => Int, { nullable: true })
  resultCount?: number;

  @Field(() => Int, { nullable: true })
  clickCount?: number;

  @Field(() => Int, { nullable: true })
  conversionCount?: number;

  @Field(() => Boolean, { nullable: true })
  hasFilters?: boolean;

  @Field(() => String, { nullable: true }) // Assuming filters is JSON stringified
  filters?: string;

  @Field(() => String, { nullable: true })
  categoryContext?: string;

  @Field(() => String, { nullable: true })
  deviceType?: string;

  @Field(() => String, { nullable: true })
  platform?: string;

  @Field(() => Boolean, { nullable: true })
  isNlpEnhanced?: boolean;

  @Field(() => Boolean, { nullable: true })
  isPersonalized?: boolean;

  @Field(() => String, { nullable: true })
  referrer?: string;

  @Field(() => String, { nullable: true })
  experimentId?: string;

  @Field(() => String, { nullable: true }) // Using String for JSON input
  metadata?: string; // Or define a specific MetadataInputType if needed

  @Field(() => Int, { nullable: true })
  filterCount?: number;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => Date, { nullable: true }) // Exclude timestamp as it's auto-generated
  timestamp?: Date;
}
