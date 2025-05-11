import { User } from '../../users/entities/user.entity';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { SearchSuggestionInput } from '../graphql/search-suggestion.input';
import { SearchSuggestionsResponseType } from '../graphql/search-suggestion.type';
export declare class SearchSuggestionResolver {
  private readonly searchSuggestionService;
  private readonly logger;
  constructor(searchSuggestionService: SearchSuggestionService);
  getSuggestions(input: SearchSuggestionInput, user?: User): Promise<SearchSuggestionsResponseType>;
}
