import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

@InputType()
export class CreateMerchantBrandInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logo?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  colorPalette?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandStory?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  foundedYear?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  socialMediaLinks?: string[];
}
