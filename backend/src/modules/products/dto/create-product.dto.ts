import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  Min,
  IsUUID,
} from 'class-validator';
import { Field, InputType, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateProductDto {
  @Field()
  @ApiProperty({ example: 'Handcrafted Ceramic Mug', description: 'Product title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Field()
  @ApiProperty({
    example: 'A beautiful handcrafted ceramic mug...',
    description: 'Product description',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Field(() => Float)
  @ApiProperty({ example: 29.99, description: 'Product price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ example: 39.99, required: false, description: 'Original price for comparison' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  compareAtPrice?: number;

  @Field(() => [String])
  @ApiProperty({ example: ['https://example.com/image1.jpg'], description: 'Product images' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'At least one image is required' })
  images: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false, description: 'Product thumbnail' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Field(() => [String])
  @ApiProperty({ example: ['Home', 'Kitchenware'], description: 'Product categories' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'At least one category is required' })
  categories: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ example: ['ceramic', 'handmade'], required: false, description: 'Product tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Field()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Merchant ID' })
  @IsUUID()
  @IsNotEmpty({ message: 'Merchant ID is required' })
  merchantId: string;

  @Field()
  @ApiProperty({ example: 'Terra & Clay', description: 'Brand name' })
  @IsString()
  @IsNotEmpty({ message: 'Brand name is required' })
  brandName: string;

  @Field({ defaultValue: true })
  @ApiProperty({ example: true, default: true, description: 'Product active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ defaultValue: true })
  @ApiProperty({ example: true, default: true, description: 'Product stock status' })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ example: 100, required: false, description: 'Product quantity' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @Field(() => [String], { nullable: true })
  @ApiProperty({
    example: ['sustainable', 'handmade'],
    required: false,
    description: 'Product values',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @Field()
  @ApiProperty({ example: 'PROD123', description: 'External product ID' })
  @IsString()
  @IsNotEmpty({ message: 'External ID is required' })
  externalId: string;

  @Field()
  @ApiProperty({ example: 'shopify', description: 'External source (e.g., shopify, woocommerce)' })
  @IsString()
  @IsNotEmpty({ message: 'External source is required' })
  externalSource: string;
}
