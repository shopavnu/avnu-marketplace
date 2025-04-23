import { ApiProperty } from '@nestjs/swagger';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * DTO for highlighted field in search results
 */
@ObjectType('HighlightField')
export class HighlightField {
  @ApiProperty({
    description: 'The field name that was highlighted',
    example: 'title',
  })
  @Field()
  field: string;

  @ApiProperty({
    description: 'The highlighted snippets with HTML markup',
    example: ['Sustainable <em>clothing</em> for everyday wear'],
  })
  @Field(() => [String])
  snippets: string[];
}

/**
 * DTO for all highlights in a search result
 */
@ObjectType('HighlightResult')
export class HighlightResult {
  @ApiProperty({
    description: 'Collection of highlighted fields',
    type: [HighlightField],
  })
  @Field(() => [HighlightField])
  fields: HighlightField[];

  @ApiProperty({
    description: 'The matched query terms',
    example: ['clothing', 'sustainable'],
  })
  @Field(() => [String], { nullable: true })
  matchedTerms?: string[];
}
