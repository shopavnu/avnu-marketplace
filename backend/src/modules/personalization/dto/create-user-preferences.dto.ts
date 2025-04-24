import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Field, InputType, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateUserPreferencesDto {
  @ApiProperty({ description: 'User ID' })
  @Field(() => ID)
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Favorite categories', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  favoriteCategories?: string[];

  @ApiProperty({ description: 'Favorite values', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  favoriteValues?: string[];

  @ApiProperty({ description: 'Favorite brands', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  favoriteBrands?: string[];

  @ApiProperty({
    description: 'Price sensitivity',
    required: false,
    enum: ['low', 'medium', 'high'],
  })
  @Field(() => String, { nullable: true })
  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priceSensitivity?: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Prefer sustainable products', required: false, default: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  preferSustainable?: boolean;

  @ApiProperty({ description: 'Prefer ethical products', required: false, default: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  preferEthical?: boolean;

  @ApiProperty({ description: 'Prefer local brands', required: false, default: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  preferLocalBrands?: boolean;

  @ApiProperty({ description: 'Preferred sizes', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  preferredSizes?: string[];

  @ApiProperty({ description: 'Preferred colors', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  preferredColors?: string[];

  @ApiProperty({ description: 'Preferred materials', required: false })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  preferredMaterials?: string[];
}
