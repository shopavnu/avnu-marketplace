'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AutocompleteResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const autocomplete_service_1 = require('../services/autocomplete.service');
const autocomplete_suggestions_type_1 = require('../types/autocomplete-suggestions.type');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
const autocomplete_options_input_1 = require('../dto/autocomplete-options.input');
let AutocompleteResolver = class AutocompleteResolver {
  constructor(autocompleteService) {
    this.autocompleteService = autocompleteService;
  }
  async getAutocompleteSuggestions(query, context, options, user) {
    const userId = user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;
    return this.autocompleteService.getAutocompleteSuggestions(query, userId, sessionId, options);
  }
  async trackSuggestionSelection(query, selectedSuggestion, suggestionType, context, user) {
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
};
exports.AutocompleteResolver = AutocompleteResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => autocomplete_suggestions_type_1.AutocompleteSuggestionsType, {
      name: 'autocompleteSuggestions',
    }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Context)()),
    __param(2, (0, graphql_1.Args)('options', { nullable: true })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      Object,
      autocomplete_options_input_1.AutocompleteOptionsInput,
      user_entity_1.User,
    ]),
    __metadata('design:returntype', Promise),
  ],
  AutocompleteResolver.prototype,
  'getAutocompleteSuggestions',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean, { name: 'trackSuggestionSelection' }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('selectedSuggestion')),
    __param(2, (0, graphql_1.Args)('suggestionType')),
    __param(3, (0, graphql_1.Context)()),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, Object, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  AutocompleteResolver.prototype,
  'trackSuggestionSelection',
  null,
);
exports.AutocompleteResolver = AutocompleteResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [autocomplete_service_1.AutocompleteService]),
  ],
  AutocompleteResolver,
);
//# sourceMappingURL=autocomplete.resolver.js.map
