import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class VariantResultType {
  @Field()
  variantId: string;

  @Field()
  variantName: string;

  @Field({ nullable: true })
  isControl?: boolean;

  @Field(() => Int)
  impressions: number;

  @Field(() => Int)
  clicks: number;

  @Field(() => Int)
  conversions: number;

  @Field(() => Float)
  clickThroughRate: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  averageRevenue: number;

  @Field({ nullable: true })
  isWinner?: boolean;

  @Field(() => Float, { nullable: true })
  improvementRate?: number;
}

@ObjectType()
export class ExperimentResultsType {
  @Field()
  experimentId: string;

  @Field()
  experimentName: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [VariantResultType])
  variants: VariantResultType[];
}
