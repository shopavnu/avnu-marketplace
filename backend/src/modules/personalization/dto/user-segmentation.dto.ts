import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class UserSegmentDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;

  @Field()
  color: string;

  @Field(() => [String])
  characteristics: string[];

  @Field(() => [String])
  topCategories: string[];

  @Field(() => [String])
  topBrands: string[];

  @Field(() => Float)
  avgSessionDuration: number;

  @Field(() => Float)
  conversionRate: number;
}

@ObjectType()
export class PageHeatmapDataDto {
  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;

  @Field(() => Int)
  value: number;
}

@ObjectType()
export class FunnelStepDto {
  @Field()
  name: string;

  @Field(() => Int)
  value: number;

  @Field(() => Float, { nullable: true })
  percentage?: number;

  @Field(() => Float, { nullable: true })
  conversionRate?: number;
}

@ObjectType()
export class UserSegmentationDataDto {
  @Field(() => [UserSegmentDto])
  segments: UserSegmentDto[];

  @Field(() => [PageHeatmapDataDto])
  pageHeatmapData: PageHeatmapDataDto[];

  @Field(() => [FunnelStepDto])
  funnelData: FunnelStepDto[];
}
