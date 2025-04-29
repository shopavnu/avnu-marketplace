import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class AnonymousUserOverviewDto {
  @Field(() => Int)
  totalAnonymousUsers: number;

  @Field(() => Int)
  activeAnonymousUsers: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  avgSessionDuration: number;

  @Field(() => Float)
  returningUserRate: number;
}

@ObjectType()
export class InteractionTypeMetricsDto {
  @Field()
  type: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class CategoryPreferenceDto {
  @Field()
  categoryId: string;

  @Field()
  categoryName: string;

  @Field(() => Float)
  weight: number;

  @Field(() => Int)
  interactionCount: number;
}

@ObjectType()
export class BrandPreferenceDto {
  @Field()
  brandId: string;

  @Field()
  brandName: string;

  @Field(() => Float)
  weight: number;

  @Field(() => Int)
  interactionCount: number;
}

@ObjectType()
export class SearchTermDto {
  @Field()
  query: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  conversionRate: number;
}

@ObjectType()
export class TimeframeMetricsDto {
  @Field()
  date: string;

  @Field(() => Int)
  anonymousUsers: number;

  @Field(() => Int)
  newUsers: number;

  @Field(() => Int)
  returningUsers: number;

  @Field(() => Float)
  avgSessionDuration: number;
}

@ObjectType()
export class AnonymousUserMetricsDto {
  @Field(() => AnonymousUserOverviewDto)
  overview: AnonymousUserOverviewDto;

  @Field(() => [InteractionTypeMetricsDto])
  interactionsByType: InteractionTypeMetricsDto[];

  @Field(() => [CategoryPreferenceDto])
  topCategoryPreferences: CategoryPreferenceDto[];

  @Field(() => [BrandPreferenceDto])
  topBrandPreferences: BrandPreferenceDto[];

  @Field(() => [SearchTermDto])
  topSearchTerms: SearchTermDto[];

  @Field(() => [TimeframeMetricsDto])
  byTimeframe: TimeframeMetricsDto[];
}
