import { PartialType } from '@nestjs/graphql';
import { CreateUserPreferencesDto } from './create-user-preferences.dto';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserPreferencesDto extends PartialType(CreateUserPreferencesDto) {
  // All fields are inherited from CreateUserPreferencesDto and made optional by PartialType
}
