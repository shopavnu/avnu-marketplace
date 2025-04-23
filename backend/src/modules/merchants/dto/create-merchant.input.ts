import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

@InputType()
export class CreateMerchantInput {
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  values?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
