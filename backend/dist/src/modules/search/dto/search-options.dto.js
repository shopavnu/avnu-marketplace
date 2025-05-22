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
exports.SearchOptions = exports.SearchOptionsInput = exports.RangeFilterOption = exports.FilterOption = exports.SortOption = exports.SortOrder = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const search_entity_type_enum_1 = require("../enums/search-entity-type.enum");
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
(0, graphql_1.registerEnumType)(SortOrder, {
    name: 'SortOrder',
    description: 'Sort order direction',
});
let SortOption = class SortOption {
    constructor() {
        this.order = SortOrder.DESC;
    }
};
exports.SortOption = SortOption;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to sort by',
        example: 'createdAt',
    }),
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SortOption.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order (asc or desc)',
        enum: SortOrder,
        default: SortOrder.DESC,
    }),
    (0, graphql_1.Field)(() => SortOrder),
    (0, class_validator_1.IsEnum)(SortOrder),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SortOption.prototype, "order", void 0);
exports.SortOption = SortOption = __decorate([
    (0, graphql_1.InputType)('SortOptionInput')
], SortOption);
let FilterOption = class FilterOption {
    constructor() {
        this.exact = false;
    }
};
exports.FilterOption = FilterOption;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to filter by',
        example: 'category',
    }),
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterOption.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Value to filter by',
        example: 'clothing',
    }),
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FilterOption.prototype, "values", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether to use exact match (false for partial/fuzzy matching)',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], FilterOption.prototype, "exact", void 0);
exports.FilterOption = FilterOption = __decorate([
    (0, graphql_1.InputType)('FilterOptionInput')
], FilterOption);
let RangeFilterOption = class RangeFilterOption {
};
exports.RangeFilterOption = RangeFilterOption;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to filter by range',
        example: 'price',
    }),
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RangeFilterOption.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum value (inclusive)',
        example: 10,
        required: false,
    }),
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RangeFilterOption.prototype, "min", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum value (inclusive)',
        example: 100,
        required: false,
    }),
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RangeFilterOption.prototype, "max", void 0);
exports.RangeFilterOption = RangeFilterOption = __decorate([
    (0, graphql_1.InputType)('RangeFilterOptionInput')
], RangeFilterOption);
let SearchOptionsInput = class SearchOptionsInput {
    constructor() {
        this.entityType = search_entity_type_enum_1.SearchEntityType.PRODUCT;
        this.page = 1;
        this.limit = 20;
        this.personalized = true;
        this.enablePersonalization = false;
        this.personalizationStrength = 1.0;
        this.enableNlp = false;
        this.boostByValues = true;
        this.includeSponsoredContent = true;
        this.enableABTesting = false;
        this.enableAnalytics = false;
        this.enableHighlighting = false;
        this.highlightPreTag = '<em>';
        this.highlightPostTag = '</em>';
        this.highlightFragmentSize = 150;
    }
};
exports.SearchOptionsInput = SearchOptionsInput;
exports.SearchOptions = SearchOptionsInput;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search query',
        required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entity type to search',
        enum: search_entity_type_enum_1.SearchEntityType,
        default: search_entity_type_enum_1.SearchEntityType.PRODUCT,
    }),
    (0, graphql_1.Field)(() => search_entity_type_enum_1.SearchEntityType, {
        nullable: true,
        defaultValue: search_entity_type_enum_1.SearchEntityType.PRODUCT,
        description: 'Specifies the primary entity type for the search',
    }),
    (0, class_validator_1.IsEnum)(search_entity_type_enum_1.SearchEntityType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number (0-indexed)',
        minimum: 1,
        default: 1,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchOptionsInput.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 20,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchOptionsInput.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort options',
        type: [SortOption],
        required: false,
    }),
    (0, graphql_1.Field)(() => [SortOption], { nullable: true }),
    (0, class_transformer_1.Type)(() => SortOption),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchOptionsInput.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter options',
        type: [FilterOption],
        required: false,
    }),
    (0, graphql_1.Field)(() => [FilterOption], { nullable: true }),
    (0, class_transformer_1.Type)(() => FilterOption),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchOptionsInput.prototype, "filters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Range filter options',
        type: [RangeFilterOption],
        required: false,
    }),
    (0, graphql_1.Field)(() => [RangeFilterOption], { nullable: true }),
    (0, class_transformer_1.Type)(() => RangeFilterOption),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchOptionsInput.prototype, "rangeFilters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Include personalized results',
        default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "personalized", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable personalization based on user preferences',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "enablePersonalization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Personalization strength (0.0 to 2.0)',
        default: 1.0,
        minimum: 0.0,
        maximum: 2.0,
    }),
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchOptionsInput.prototype, "personalizationStrength", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable natural language processing for the query',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "enableNlp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'NLP data for the query (entities, intent, etc.)',
        required: false,
    }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SearchOptionsInput.prototype, "nlpData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Boost results matching user values',
        default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "boostByValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Include sponsored content',
        default: true,
    }),
    (0, graphql_1.Field)({ defaultValue: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "includeSponsoredContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Experiment ID for A/B testing',
        required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "experimentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable A/B testing for search relevance',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "enableABTesting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable analytics tracking',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "enableAnalytics", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client ID for analytics tracking',
        required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Metadata for internal use',
        required: false,
    }),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SearchOptionsInput.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable highlighting in search results',
        default: false,
    }),
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SearchOptionsInput.prototype, "enableHighlighting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fields to highlight',
        type: [String],
        example: ['title', 'description'],
        required: false,
    }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchOptionsInput.prototype, "highlightFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pre-tag for highlighting',
        example: '<em>',
        default: '<em>',
        required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "highlightPreTag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Post-tag for highlighting',
        example: '</em>',
        default: '</em>',
        required: false,
    }),
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchOptionsInput.prototype, "highlightPostTag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of characters to include in highlighted snippets',
        example: 150,
        default: 150,
        required: false,
    }),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchOptionsInput.prototype, "highlightFragmentSize", void 0);
exports.SearchOptions = exports.SearchOptionsInput = SearchOptionsInput = __decorate([
    (0, graphql_1.InputType)('SearchOptionsInput')
], SearchOptionsInput);
//# sourceMappingURL=search-options.dto.js.map