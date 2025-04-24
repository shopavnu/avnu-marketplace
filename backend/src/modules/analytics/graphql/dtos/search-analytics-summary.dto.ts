import { ObjectType, Field, Float /* Int */ } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json'; // Need to install graphql-type-json
import { QueryCountDto } from './query-count.dto'; // Import the new DTO

@ObjectType()
export class SearchAnalyticsSummaryDto {
  @Field(() => [QueryCountDto], { nullable: true })
  topSearchQueries?: QueryCountDto[];

  @Field(() => [QueryCountDto], { nullable: true })
  zeroResultQueries?: QueryCountDto[];

  @Field(() => Float, { nullable: true })
  searchConversionRate?: number;

  @Field(() => Float, { nullable: true })
  searchClickThroughRate?: number;

  // Using JSONObject for complex nested comparison data
  @Field(() => GraphQLJSONObject, { nullable: true })
  nlpVsRegularSearchAnalytics?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  searchPerformance?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  personalizedVsRegularSearchAnalytics?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  searchTrends?: any;
}
