import { AutocompleteService } from '../services/autocomplete.service';
import { User } from '../../users/entities/user.entity';
import { AutocompleteOptionsInput } from '../dto/autocomplete-options.input';
export declare class AutocompleteResolver {
    private readonly autocompleteService;
    constructor(autocompleteService: AutocompleteService);
    getAutocompleteSuggestions(query: string, context: any, options?: AutocompleteOptionsInput, user?: User): Promise<any>;
    trackSuggestionSelection(query: string, selectedSuggestion: string, suggestionType: string, context: any, user?: User): Promise<boolean>;
}
