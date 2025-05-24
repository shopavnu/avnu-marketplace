import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class SocialLinks {
  @Field({ nullable: true })
  instagram?: string;

  @Field({ nullable: true })
  twitter?: string;

  @Field({ nullable: true })
  facebook?: string;
}

@ObjectType()
export class Brand {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  @Field(() => SocialLinks, { nullable: true })
  socialLinks?: SocialLinks;

  @Field({ nullable: true })
  supportedCausesInfo?: string;

  @Field(() => Int, { nullable: true })
  foundedYear?: number;

  @Field({ nullable: true })
  location?: string;

  @Field(() => [String], { nullable: true })
  values?: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Object], { nullable: true })
  products?: any[];
}
