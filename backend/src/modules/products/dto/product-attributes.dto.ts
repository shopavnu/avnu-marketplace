import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class ProductAttributesDto {
  @Field({ nullable: true })
  @ApiProperty({ required: false, example: 'Medium', description: 'Product size' })
  @IsString()
  @IsOptional()
  size?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, example: 'Blue', description: 'Product color' })
  @IsString()
  @IsOptional()
  color?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, example: 'Ceramic', description: 'Product material' })
  @IsString()
  @IsOptional()
  material?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, example: '250g', description: 'Product weight' })
  @IsString()
  @IsOptional()
  weight?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false, example: '10cm x 5cm x 5cm', description: 'Product dimensions' })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({
    required: false,
    example: ['finish:glossy', 'dishwasher_safe:yes'],
    description: 'Custom product attributes as key:value pairs',
  })
  @IsArray()
  @IsOptional()
  customAttributes?: string[];
}
