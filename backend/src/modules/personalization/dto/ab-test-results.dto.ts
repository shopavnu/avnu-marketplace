import { Field, ObjectType, Float, Int as _Int } from '@nestjs/graphql';

@ObjectType()
export class ABTestVariantDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  trafficPercentage: number;

  @Field(() => Boolean)
  isControl: boolean;
}

@ObjectType()
export class ABTestVariantMetricDto {
  @Field()
  id: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  improvement: number;
}

@ObjectType()
export class ABTestMetricDto {
  @Field()
  name: string;

  @Field(() => Float)
  control: number;

  @Field(() => [ABTestVariantMetricDto])
  variants: ABTestVariantMetricDto[];
}

@ObjectType()
export class ABTestResultDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  status: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field(() => [ABTestVariantDto])
  variants: ABTestVariantDto[];

  @Field(() => [ABTestMetricDto])
  metrics: ABTestMetricDto[];

  @Field({ nullable: true })
  winner?: string;

  @Field(() => Float, { nullable: true })
  confidenceLevel?: number;
}
