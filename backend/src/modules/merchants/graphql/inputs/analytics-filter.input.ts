import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AnalyticsFilterInput {
  @Field({ nullable: true })
  timeFrame?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  productIds?: string[];

  @Field(() => [String], { nullable: true })
  categoryIds?: string[];

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true })
  sortOrder?: string;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}
