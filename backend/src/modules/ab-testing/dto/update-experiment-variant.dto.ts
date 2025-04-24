import { PartialType } from '@nestjs/swagger';
import { CreateExperimentVariantDto } from './create-experiment-variant.dto';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateExperimentVariantDto extends PartialType(CreateExperimentVariantDto) {
  // All fields are inherited from CreateExperimentVariantDto and made optional by PartialType
}
