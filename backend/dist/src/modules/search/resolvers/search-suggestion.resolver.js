"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SearchSuggestionResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSuggestionResolver = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const search_suggestion_service_1 = require("../services/search-suggestion.service");
const search_suggestion_input_1 = require("../graphql/search-suggestion.input");
const search_suggestion_type_1 = require("../graphql/search-suggestion.type");
let SearchSuggestionResolver = SearchSuggestionResolver_1 = class SearchSuggestionResolver {
    constructor(searchSuggestionService) {
        this.searchSuggestionService = searchSuggestionService;
        this.logger = new common_1.Logger(SearchSuggestionResolver_1.name);
    }
    async getSuggestions(input, user) {
        this.logger.log(`Received search suggestion request: ${JSON.stringify(input)}`, SearchSuggestionResolver_1.name);
        const startTime = Date.now();
        try {
            const result = await this.searchSuggestionService.getSuggestions(input, user);
            const duration = Date.now() - startTime;
            this.logger.log(`Completed search suggestion request for "${input.query}" in ${duration}ms`, SearchSuggestionResolver_1.name);
            return result;
        }
        catch (error) {
            this.logger.error(`Error processing search suggestion request: ${error.message}`, error.stack, SearchSuggestionResolver_1.name);
            return {
                suggestions: [],
                total: 0,
                isPersonalized: false,
                originalQuery: input.query,
            };
        }
    }
};
exports.SearchSuggestionResolver = SearchSuggestionResolver;
__decorate([
    (0, graphql_1.Query)(() => search_suggestion_type_1.SearchSuggestionsResponseType, { name: 'searchSuggestions' }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_suggestion_input_1.SearchSuggestionInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SearchSuggestionResolver.prototype, "getSuggestions", null);
exports.SearchSuggestionResolver = SearchSuggestionResolver = SearchSuggestionResolver_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, graphql_1.Resolver)(() => search_suggestion_type_1.SearchSuggestionsResponseType),
    __metadata("design:paramtypes", [search_suggestion_service_1.SearchSuggestionService])
], SearchSuggestionResolver);
//# sourceMappingURL=search-suggestion.resolver.js.map