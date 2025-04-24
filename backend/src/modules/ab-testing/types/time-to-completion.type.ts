import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TimeToCompletionType {
  @Field()
  experimentId: string;

  @Field()
  experimentName: string;

  @Field(() => Int)
  currentTotalImpressions: number;

  @Field(() => Int)
  requiredSampleSizePerVariant: number;

  @Field(() => Int)
  totalRequiredSampleSize: number;

  @Field(() => Int)
  remainingImpressions: number;

  @Field(() => Int)
  daysRemaining: number;

  @Field()
  estimatedCompletionDate: Date;
}
