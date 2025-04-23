import { ObjectType, Field, ID, Int } from '@nestjs/graphql'; // Removed unused Float import
import { ProductResultType } from './search-response.type';

@ObjectType()
export class DiscoverySectionMetadata {
  @Field(() => Int)
  personalizedCount: number;

  @Field(() => Int)
  trendingCount: number;

  @Field(() => Int)
  newArrivalsCount: number;

  @Field(() => Int)
  emergingBrandsCount: number;

  @Field(() => Int)
  sponsoredCount: number;
}

@ObjectType()
export class DiscoverySection {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  type: string;

  @Field(() => [ProductResultType])
  items: ProductResultType[];
}

@ObjectType()
export class DiscoveryHomepageResponse {
  @Field(() => [DiscoverySection])
  sections: DiscoverySection[];

  @Field(() => DiscoverySectionMetadata)
  metadata: DiscoverySectionMetadata;

  @Field(() => Boolean, { defaultValue: false })
  highlightsEnabled: boolean;
}
