import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StructuredDataDto {
  @Field()
  type: string;

  @Field()
  context: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => [String], { nullable: true })
  imageAlts?: string[];
}

@ObjectType()
export class AccessibilityMetadataDto {
  @Field({ nullable: true })
  altText?: string;

  @Field({ nullable: true })
  ariaLabel?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field(() => StructuredDataDto, { nullable: true })
  structuredData?: StructuredDataDto;
}

@ObjectType()
export class ProductAccessibilityDto {
  @Field()
  productId: string;

  @Field(() => AccessibilityMetadataDto)
  accessibilityMetadata: AccessibilityMetadataDto;

  @Field(() => [ImageAltTextDto], { nullable: true })
  imageAltTexts?: ImageAltTextDto[];
}

@ObjectType()
export class ImageAltTextDto {
  @Field()
  imageUrl: string;

  @Field()
  altText: string;
}

@ObjectType()
export class AriaAttributesDto {
  @Field()
  productId: string;

  @Field(() => [AriaAttributeDto])
  attributes: AriaAttributeDto[];
}

@ObjectType()
export class AriaAttributeDto {
  @Field()
  name: string;

  @Field()
  value: string;
}
