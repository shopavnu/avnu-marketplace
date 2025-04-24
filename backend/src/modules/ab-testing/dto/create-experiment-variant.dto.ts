import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateExperimentVariantDto {
  @ApiProperty({ description: 'Name of the variant' })
  @Field(() => String)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the variant', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether this is the control variant', default: false })
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isControl?: boolean = false;

  @ApiProperty({ description: 'Configuration for the variant in JSON format', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  configuration?: string;
}
