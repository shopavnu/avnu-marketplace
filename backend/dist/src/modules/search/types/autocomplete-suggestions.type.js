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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteSuggestionsType = exports.SuggestionType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let SuggestionType = class SuggestionType {
};
exports.SuggestionType = SuggestionType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SuggestionType.prototype, "text", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SuggestionType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SuggestionType.prototype, "prefix", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SuggestionType.prototype, "highlighted", void 0);
exports.SuggestionType = SuggestionType = __decorate([
    (0, graphql_1.ObjectType)()
], SuggestionType);
let AutocompleteSuggestionsType = class AutocompleteSuggestionsType {
};
exports.AutocompleteSuggestionsType = AutocompleteSuggestionsType;
__decorate([
    (0, graphql_1.Field)(() => [SuggestionType]),
    __metadata("design:type", Array)
], AutocompleteSuggestionsType.prototype, "suggestions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AutocompleteSuggestionsType.prototype, "metadata", void 0);
exports.AutocompleteSuggestionsType = AutocompleteSuggestionsType = __decorate([
    (0, graphql_1.ObjectType)()
], AutocompleteSuggestionsType);
//# sourceMappingURL=autocomplete-suggestions.type.js.map