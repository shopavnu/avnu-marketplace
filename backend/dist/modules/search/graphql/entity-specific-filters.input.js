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
exports.EnhancedSearchInput = exports.EntityBoostingInput = exports.EntitySortOptionInput = exports.BrandFilterInput = exports.MerchantFilterInput = exports.ProductFilterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const search_options_dto_1 = require("../dto/search-options.dto");
let ProductFilterInput = class ProductFilterInput {
};
exports.ProductFilterInput = ProductFilterInput;
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "values", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "brandIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "merchantIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ProductFilterInput.prototype, "minPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ProductFilterInput.prototype, "maxPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ProductFilterInput.prototype, "minRating", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ProductFilterInput.prototype, "inStock", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ProductFilterInput.prototype, "onSale", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "colors", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "sizes", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ProductFilterInput.prototype, "materials", void 0);
exports.ProductFilterInput = ProductFilterInput = __decorate([
    (0, graphql_1.InputType)()
], ProductFilterInput);
let MerchantFilterInput = class MerchantFilterInput {
};
exports.MerchantFilterInput = MerchantFilterInput;
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MerchantFilterInput.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MerchantFilterInput.prototype, "values", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MerchantFilterInput.prototype, "locations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MerchantFilterInput.prototype, "minRating", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], MerchantFilterInput.prototype, "verifiedOnly", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], MerchantFilterInput.prototype, "activeOnly", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MerchantFilterInput.prototype, "minProductCount", void 0);
exports.MerchantFilterInput = MerchantFilterInput = __decorate([
    (0, graphql_1.InputType)()
], MerchantFilterInput);
let BrandFilterInput = class BrandFilterInput {
};
exports.BrandFilterInput = BrandFilterInput;
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], BrandFilterInput.prototype, "categories", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], BrandFilterInput.prototype, "values", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], BrandFilterInput.prototype, "locations", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], BrandFilterInput.prototype, "verifiedOnly", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], BrandFilterInput.prototype, "activeOnly", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BrandFilterInput.prototype, "minFoundedYear", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BrandFilterInput.prototype, "maxFoundedYear", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BrandFilterInput.prototype, "minProductCount", void 0);
exports.BrandFilterInput = BrandFilterInput = __decorate([
    (0, graphql_1.InputType)()
], BrandFilterInput);
let EntitySortOptionInput = class EntitySortOptionInput {
    constructor() {
        this.order = search_options_dto_1.SortOrder.DESC;
    }
};
exports.EntitySortOptionInput = EntitySortOptionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EntitySortOptionInput.prototype, "field", void 0);
__decorate([
    (0, graphql_1.Field)(() => search_options_dto_1.SortOrder, { defaultValue: search_options_dto_1.SortOrder.DESC }),
    __metadata("design:type", String)
], EntitySortOptionInput.prototype, "order", void 0);
exports.EntitySortOptionInput = EntitySortOptionInput = __decorate([
    (0, graphql_1.InputType)()
], EntitySortOptionInput);
let EntityBoostingInput = class EntityBoostingInput {
    constructor() {
        this.productBoost = 1.0;
        this.merchantBoost = 1.0;
        this.brandBoost = 1.0;
    }
};
exports.EntityBoostingInput = EntityBoostingInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    __metadata("design:type", Number)
], EntityBoostingInput.prototype, "productBoost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    __metadata("design:type", Number)
], EntityBoostingInput.prototype, "merchantBoost", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 1.0 }),
    __metadata("design:type", Number)
], EntityBoostingInput.prototype, "brandBoost", void 0);
exports.EntityBoostingInput = EntityBoostingInput = __decorate([
    (0, graphql_1.InputType)()
], EntityBoostingInput);
let EnhancedSearchInput = class EnhancedSearchInput {
    constructor() {
        this.page = 0;
        this.limit = 20;
        this.enableNlp = false;
        this.personalized = true;
        this.boostByValues = false;
        this.includeSponsoredContent = true;
        this.enableHighlighting = false;
        this.highlightPreTag = '<em>';
        this.highlightPostTag = '</em>';
        this.highlightFragmentSize = 150;
    }
};
exports.EnhancedSearchInput = EnhancedSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EnhancedSearchInput.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], EnhancedSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    __metadata("design:type", Number)
], EnhancedSearchInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], EnhancedSearchInput.prototype, "enableNlp", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], EnhancedSearchInput.prototype, "personalized", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProductFilterInput, { nullable: true }),
    __metadata("design:type", ProductFilterInput)
], EnhancedSearchInput.prototype, "productFilters", void 0);
__decorate([
    (0, graphql_1.Field)(() => MerchantFilterInput, { nullable: true }),
    __metadata("design:type", MerchantFilterInput)
], EnhancedSearchInput.prototype, "merchantFilters", void 0);
__decorate([
    (0, graphql_1.Field)(() => BrandFilterInput, { nullable: true }),
    __metadata("design:type", BrandFilterInput)
], EnhancedSearchInput.prototype, "brandFilters", void 0);
__decorate([
    (0, graphql_1.Field)(() => EntityBoostingInput, { nullable: true }),
    __metadata("design:type", EntityBoostingInput)
], EnhancedSearchInput.prototype, "entityBoosting", void 0);
__decorate([
    (0, graphql_1.Field)(() => [EntitySortOptionInput], { nullable: true }),
    __metadata("design:type", Array)
], EnhancedSearchInput.prototype, "sortOptions", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], EnhancedSearchInput.prototype, "boostByValues", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], EnhancedSearchInput.prototype, "includeSponsoredContent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EnhancedSearchInput.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false, nullable: true }),
    __metadata("design:type", Boolean)
], EnhancedSearchInput.prototype, "enableHighlighting", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EnhancedSearchInput.prototype, "highlightFields", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: '<em>' }),
    __metadata("design:type", String)
], EnhancedSearchInput.prototype, "highlightPreTag", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: '</em>' }),
    __metadata("design:type", String)
], EnhancedSearchInput.prototype, "highlightPostTag", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 150 }),
    __metadata("design:type", Number)
], EnhancedSearchInput.prototype, "highlightFragmentSize", void 0);
exports.EnhancedSearchInput = EnhancedSearchInput = __decorate([
    (0, graphql_1.InputType)()
], EnhancedSearchInput);
//# sourceMappingURL=entity-specific-filters.input.js.map