import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
export class DiscoverySectionType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Product])
  items: Product[];

  @Field()
  type: string;
}

@ObjectType()
export class DiscoveryHomepageType {
  @Field(() => [DiscoverySectionType])
  sections: DiscoverySectionType[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
