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
exports.CursorSearchResponseType = exports.CursorSearchResultUnion = void 0;
const graphql_1 = require("@nestjs/graphql");
const search_response_type_1 = require("./search-response.type");
const cursor_pagination_type_1 = require("./cursor-pagination.type");
exports.CursorSearchResultUnion = (0, graphql_1.createUnionType)({
    name: 'CursorSearchResult',
    types: () => [search_response_type_1.ProductResultType, search_response_type_1.MerchantResultType, search_response_type_1.BrandResultType],
    resolveType(value) {
        if (value.title) {
            return search_response_type_1.ProductResultType;
        }
        if (value.foundedYear) {
            return search_response_type_1.BrandResultType;
        }
        return search_response_type_1.MerchantResultType;
    },
});
let CursorSearchResponseType = class CursorSearchResponseType {
    constructor() {
        this.highlightsEnabled = false;
    }
};
exports.CursorSearchResponseType = CursorSearchResponseType;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CursorSearchResponseType.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(() => cursor_pagination_type_1.CursorPaginationType),
    __metadata("design:type", cursor_pagination_type_1.CursorPaginationType)
], CursorSearchResponseType.prototype, "pagination", void 0);
__decorate([
    (0, graphql_1.Field)(() => [exports.CursorSearchResultUnion]),
    __metadata("design:type", Array)
], CursorSearchResponseType.prototype, "results", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], CursorSearchResponseType.prototype, "highlightsEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => [search_response_type_1.FacetType], { nullable: true }),
    __metadata("design:type", Array)
], CursorSearchResponseType.prototype, "facets", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CursorSearchResponseType.prototype, "isPersonalized", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CursorSearchResponseType.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CursorSearchResponseType.prototype, "appliedFilters", void 0);
exports.CursorSearchResponseType = CursorSearchResponseType = __decorate([
    (0, graphql_1.ObjectType)()
], CursorSearchResponseType);
//# sourceMappingURL=cursor-search-response.type.js.map