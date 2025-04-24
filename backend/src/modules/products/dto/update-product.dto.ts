import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { Field, InputType, Float, Int, PartialType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product title' })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false, description: 'Product price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false, description: 'Original price for comparison' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  compareAtPrice?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ required: false, description: 'Product images' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product thumbnail' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ required: false, description: 'Product categories' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ required: false, description: 'Product tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Brand name' })
  @IsString()
  @IsOptional()
  brandName?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product stock status' })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false, description: 'Product quantity' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ required: false, description: 'Product values' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];
}
