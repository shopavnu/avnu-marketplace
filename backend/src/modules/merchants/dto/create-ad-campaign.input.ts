import { InputType, Field, Float, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { CampaignType, TargetAudience } from '../entities/merchant-ad-campaign.entity';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateAdCampaignInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CampaignType, { defaultValue: CampaignType.PRODUCT_PROMOTION })
  @IsEnum(CampaignType)
  type: CampaignType;

  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @Field(() => Float)
  @IsNumber()
  budget: number;

  @Field(() => TargetAudience, { defaultValue: TargetAudience.ALL })
  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetDemographics?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLocations?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetInterests?: string[];

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
