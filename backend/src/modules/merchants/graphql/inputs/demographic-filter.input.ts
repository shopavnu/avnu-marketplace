import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DemographicFilterInput {
  @Field()
  key: string;

  @Field(() => [String])
  values: string[];
}
