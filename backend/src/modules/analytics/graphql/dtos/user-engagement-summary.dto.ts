import { ObjectType, Field /* Int */ } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json'; // Need to install graphql-type-json
import { EngagementTypeCount } from './engagement-type-count.dto';
import { ProductInteractionCount } from './product-interaction-count.dto';

@ObjectType()
export class UserEngagementSummaryDto {
  @Field(_type => [EngagementTypeCount], { nullable: true })
  userEngagementByType?: EngagementTypeCount[];

  @Field(() => [ProductInteractionCount], { nullable: true })
  topViewedProducts?: ProductInteractionCount[];

  @Field(() => [ProductInteractionCount], { nullable: true })
  topFavoritedProducts?: ProductInteractionCount[];

  // Using JSONObject for potentially complex/variable funnel and retention data
  @Field(() => GraphQLJSONObject, { nullable: true })
  userEngagementFunnel?: any;

  @Field(() => GraphQLJSONObject, { nullable: true })
  userRetentionMetrics?: any;
}
