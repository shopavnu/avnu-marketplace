import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateUserDto } from './create-user.dto';

@InputType()
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Field({ nullable: true })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  interests?: string[];

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isMerchant?: boolean;
}
