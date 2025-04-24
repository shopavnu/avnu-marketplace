import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsDate, Min, Max } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { ExperimentStatus, ExperimentType } from '../entities/experiment.entity';
import { CreateExperimentVariantDto } from './create-experiment-variant.dto';
import { Type } from 'class-transformer';

@InputType()
export class CreateExperimentDto {
  @ApiProperty({ description: 'Name of the experiment' })
  @Field(() => String)
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the experiment', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Status of the experiment',
    enum: ExperimentStatus,
    default: ExperimentStatus.DRAFT,
  })
  @Field(() => String)
  @IsEnum(ExperimentStatus)
  @IsOptional()
  status?: ExperimentStatus = ExperimentStatus.DRAFT;

  @ApiProperty({
    description: 'Type of the experiment',
    enum: ExperimentType,
    required: true,
  })
  @Field(() => String)
  @IsEnum(ExperimentType)
  type: ExperimentType;

  @ApiProperty({ description: 'Target audience for the experiment', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiProperty({
    description: 'Percentage of audience to include in the experiment (0-100)',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  audiencePercentage?: number;

  @ApiProperty({ description: 'Start date of the experiment', required: false })
  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: 'End date of the experiment', required: false })
  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Hypothesis for the experiment', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  hypothesis?: string;

  @ApiProperty({ description: 'Primary metric to measure experiment success', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  primaryMetric?: string;

  @ApiProperty({
    description: 'Secondary metrics to measure experiment success',
    required: false,
    type: [String],
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secondaryMetrics?: string[];

  @ApiProperty({ description: 'Segmentation criteria in JSON format', required: false })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  segmentation?: string;

  @ApiProperty({ description: 'Variants for the experiment', type: [CreateExperimentVariantDto] })
  @Field(() => [CreateExperimentVariantDto])
  @IsArray()
  @Type(() => CreateExperimentVariantDto)
  variants: CreateExperimentVariantDto[];
}
