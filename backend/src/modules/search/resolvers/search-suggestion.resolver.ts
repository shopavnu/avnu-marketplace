import { Injectable, Logger } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { SearchSuggestionInput } from '../graphql/search-suggestion.input';
import { SearchSuggestionsResponseType } from '../graphql/search-suggestion.type';

@Injectable()
@Resolver(() => SearchSuggestionsResponseType)
export class SearchSuggestionResolver {
  private readonly logger = new Logger(SearchSuggestionResolver.name);

  constructor(private readonly searchSuggestionService: SearchSuggestionService) {}

  @Query(() => SearchSuggestionsResponseType, { name: 'searchSuggestions' })
  async getSuggestions(
    @Args('input') input: SearchSuggestionInput,
    @CurrentUser() user?: User,
  ): Promise<SearchSuggestionsResponseType> {
    this.logger.log(
      `Received search suggestion request: ${JSON.stringify(input)}`,
      SearchSuggestionResolver.name,
    );

    const startTime = Date.now();

    try {
      const result = await this.searchSuggestionService.getSuggestions(input, user);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Completed search suggestion request for "${input.query}" in ${duration}ms`,
        SearchSuggestionResolver.name,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing search suggestion request: ${error.message}`,
        error.stack,
        SearchSuggestionResolver.name,
      );

      // Return empty result on error
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: input.query,
      };
    }
  }
}
