import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class VariantAssignmentType {
  @Field()
  variantId: string;

  @Field(() => GraphQLJSON)
  configuration: any;

  @Field()
  assignmentId: string;
}

@ObjectType()
export class VariantConfigurationType {
  @Field(() => GraphQLJSON)
  experiments: Record<string, VariantAssignmentType>;
}
