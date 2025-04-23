import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Enum for user shopping frequency
 */
export enum ShoppingFrequency {
  RARELY = 'rarely',
  OCCASIONALLY = 'occasionally',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

/**
 * Enum for user price sensitivity
 */
export enum PriceSensitivity {
  BUDGET = 'budget',
  VALUE = 'value',
  BALANCED = 'balanced',
  PREMIUM = 'premium',
  LUXURY = 'luxury',
}

/**
 * DTO for submitting initial user preference survey
 */
@InputType()
export class UserPreferencesSurveyInput {
  @ApiProperty({
    description: 'Preferred product categories',
    example: ['electronics', 'home', 'fashion'],
  })
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  preferredCategories: string[];

  @ApiProperty({
    description: 'Preferred brands',
    example: ['Apple', 'Samsung', 'Nike'],
  })
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  preferredBrands: string[];

  @ApiProperty({
    description: 'Minimum price range preference',
    example: 50,
  })
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  priceRangeMin: number;

  @ApiProperty({
    description: 'Maximum price range preference',
    example: 1000,
  })
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  priceRangeMax: number;

  @ApiProperty({
    description: 'Shopping frequency',
    enum: ShoppingFrequency,
    example: ShoppingFrequency.MONTHLY,
  })
  @Field(() => String)
  @IsEnum(ShoppingFrequency)
  shoppingFrequency: ShoppingFrequency;

  @ApiProperty({
    description: 'Price sensitivity',
    enum: PriceSensitivity,
    example: PriceSensitivity.BALANCED,
  })
  @Field(() => String)
  @IsEnum(PriceSensitivity)
  priceSensitivity: PriceSensitivity;

  @ApiProperty({
    description: 'Preferred product attributes/features',
    example: ['eco-friendly', 'high-quality', 'durable'],
  })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredAttributes?: string[];

  @ApiProperty({
    description: 'Importance of reviews (1-10)',
    example: 8,
  })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  reviewImportance?: number;

  @ApiProperty({
    description: 'Additional user preferences as key-value pairs',
    example: { colorPreference: 'blue', sizePreference: 'medium' },
  })
  @Field(() => String, { nullable: true })
  @IsOptional()
  additionalPreferences?: Record<string, any>;
}
