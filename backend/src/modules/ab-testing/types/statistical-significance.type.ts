import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class VariantSignificanceType {
  @Field()
  variantId: string;

  @Field()
  variantName: string;

  @Field({ nullable: true })
  isControl?: boolean;

  @Field(() => Int)
  impressions: number;

  @Field(() => Int)
  conversions: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  improvement: number;

  @Field(() => Float)
  zScore: number;

  @Field(() => Float)
  pValue: number;

  @Field(() => Float)
  confidenceLevel: number;

  @Field()
  significant: boolean;

  @Field({ nullable: true })
  isWinner?: boolean;
}

@ObjectType()
export class StatisticalSignificanceType {
  @Field()
  experimentId: string;

  @Field()
  experimentName: string;

  @Field(() => [VariantSignificanceType])
  results: VariantSignificanceType[];
}
