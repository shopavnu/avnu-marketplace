import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Type as ClassType } from '@nestjs/common/interfaces';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class PaginationDto {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @ApiProperty({ required: false, default: 1, description: 'Page number' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @ApiProperty({ required: false, default: 10, description: 'Number of items per page' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

/**
 * Represents pagination metadata.
 */
@ObjectType('PageInfo')
export class PageInfo {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemCount: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

/**
 * Generic function to create a Paginated response ObjectType for GraphQL.
 * @param classRef The class reference of the items in the paginated list.
 * @returns A Paginated ObjectType class.
 */
export function Paginated<T>(classRef: ClassType<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef], { nullable: true })
    items: T[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;
  }
  return PaginatedType;
}
