import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AutocompleteService } from '../services/autocomplete.service';
import { AutocompleteSuggestionsType } from '../types/autocomplete-suggestions.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { AutocompleteOptionsInput } from '../dto/autocomplete-options.input';

@Resolver()
export class AutocompleteResolver {
  constructor(private readonly autocompleteService: AutocompleteService) {}

  @Query(() => AutocompleteSuggestionsType, { name: 'autocompleteSuggestions' })
  async getAutocompleteSuggestions(
    @Args('query') query: string,
    @Context() context,
    @Args('options', { nullable: true }) options?: AutocompleteOptionsInput,
    @CurrentUser() user?: User,
  ) {
    const userId = user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.autocompleteService.getAutocompleteSuggestions(query, userId, sessionId, options);
  }

  @Mutation(() => Boolean, { name: 'trackSuggestionSelection' })
  async trackSuggestionSelection(
    @Args('query') query: string,
    @Args('selectedSuggestion') selectedSuggestion: string,
    @Args('suggestionType') suggestionType: string,
    @Context() context,
    @CurrentUser() user?: User,
  ) {
    const userId = user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    await this.autocompleteService.trackSuggestionSelection(
      query,
      selectedSuggestion,
      suggestionType,
      userId,
      sessionId,
    );

    return true;
  }
}
