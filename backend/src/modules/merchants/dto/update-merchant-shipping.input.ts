import { InputType, Field, Float } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsNumber, IsArray, IsString } from 'class-validator';

@InputType()
export class UpdateMerchantShippingInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  offersFreeShipping?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  freeShippingThreshold?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  standardShippingRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  expeditedShippingRate?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shippingCountries?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedRegions?: string[];
}
