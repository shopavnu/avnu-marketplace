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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedSearchResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const personalized_search_service_1 = require("../services/personalized-search.service");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const search_response_type_1 = require("../graphql/search-response.type");
const search_options_dto_1 = require("../dto/search-options.dto");
let PersonalizedSearchResolver = class PersonalizedSearchResolver {
    constructor(personalizedSearchService) {
        this.personalizedSearchService = personalizedSearchService;
    }
    async personalizedSearch(context, query, options) {
        return this.personalizedSearchService.personalizedSearch(context.req.user.id, query, options || {});
    }
    async personalizedRecommendations(context, limit) {
        return this.personalizedSearchService.getPersonalizedRecommendations(context.req.user.id, limit || 10);
    }
    async discoveryFeed(context, limit) {
        return this.personalizedSearchService.getDiscoveryFeed(context.req.user.id, {
            limit: limit || 20,
        });
    }
    async personalizedSimilarProducts(context, productId, limit, _options) {
        return this.personalizedSearchService.getSimilarProducts(productId, context.req.user.id, limit || 10);
    }
};
exports.PersonalizedSearchResolver = PersonalizedSearchResolver;
__decorate([
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('query')),
    __param(2, (0, graphql_1.Args)('options', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, search_options_dto_1.SearchOptionsInput]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchResolver.prototype, "personalizedSearch", null);
__decorate([
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchResolver.prototype, "personalizedRecommendations", null);
__decorate([
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchResolver.prototype, "discoveryFeed", null);
__decorate([
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('productId')),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('options', { type: () => search_options_dto_1.SearchOptionsInput, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, search_options_dto_1.SearchOptionsInput]),
    __metadata("design:returntype", Promise)
], PersonalizedSearchResolver.prototype, "personalizedSimilarProducts", null);
exports.PersonalizedSearchResolver = PersonalizedSearchResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:paramtypes", [personalized_search_service_1.PersonalizedSearchService])
], PersonalizedSearchResolver);
//# sourceMappingURL=personalized-search.resolver.js.map