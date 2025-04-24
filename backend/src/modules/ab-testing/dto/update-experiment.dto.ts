import { PartialType } from '@nestjs/graphql';
import { CreateExperimentDto } from './create-experiment.dto';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateExperimentDto extends PartialType(CreateExperimentDto) {
  // All fields are inherited from CreateExperimentDto and made optional by PartialType
}
