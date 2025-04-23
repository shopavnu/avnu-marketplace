import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

/**
 * Type for cursor-based pagination information
 */
@ObjectType()
export class CursorPaginationType {
  @Field(() => Int)
  total: number;

  @Field({ nullable: true })
  nextCursor: string | null;

  @Field(() => Boolean)
  hasMore: boolean;
}

/**
 * Input type for cursor-based pagination
 */
@InputType()
export class CursorPaginationInput {
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;
}
