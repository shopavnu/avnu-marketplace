import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsNumber, IsEnum, IsDate } from 'class-validator';
import { CampaignType, TargetAudience } from '../entities/merchant-ad-campaign.entity';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class UpdateAdCampaignInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CampaignType, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @Field(() => TargetAudience, { nullable: true })
  @IsOptional()
  @IsEnum(TargetAudience)
  targetAudience?: TargetAudience;

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

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
