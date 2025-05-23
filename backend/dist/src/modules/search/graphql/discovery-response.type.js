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
exports.DiscoveryHomepageResponse = exports.DiscoverySection = exports.DiscoverySectionMetadata = void 0;
const graphql_1 = require("@nestjs/graphql");
const search_response_type_1 = require("./search-response.type");
let DiscoverySectionMetadata = class DiscoverySectionMetadata {
};
exports.DiscoverySectionMetadata = DiscoverySectionMetadata;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DiscoverySectionMetadata.prototype, "personalizedCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DiscoverySectionMetadata.prototype, "trendingCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DiscoverySectionMetadata.prototype, "newArrivalsCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DiscoverySectionMetadata.prototype, "emergingBrandsCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DiscoverySectionMetadata.prototype, "sponsoredCount", void 0);
exports.DiscoverySectionMetadata = DiscoverySectionMetadata = __decorate([
    (0, graphql_1.ObjectType)()
], DiscoverySectionMetadata);
let DiscoverySection = class DiscoverySection {
};
exports.DiscoverySection = DiscoverySection;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DiscoverySection.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DiscoverySection.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DiscoverySection.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DiscoverySection.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => [search_response_type_1.ProductResultType]),
    __metadata("design:type", Array)
], DiscoverySection.prototype, "items", void 0);
exports.DiscoverySection = DiscoverySection = __decorate([
    (0, graphql_1.ObjectType)()
], DiscoverySection);
let DiscoveryHomepageResponse = class DiscoveryHomepageResponse {
};
exports.DiscoveryHomepageResponse = DiscoveryHomepageResponse;
__decorate([
    (0, graphql_1.Field)(() => [DiscoverySection]),
    __metadata("design:type", Array)
], DiscoveryHomepageResponse.prototype, "sections", void 0);
__decorate([
    (0, graphql_1.Field)(() => DiscoverySectionMetadata),
    __metadata("design:type", DiscoverySectionMetadata)
], DiscoveryHomepageResponse.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], DiscoveryHomepageResponse.prototype, "highlightsEnabled", void 0);
exports.DiscoveryHomepageResponse = DiscoveryHomepageResponse = __decorate([
    (0, graphql_1.ObjectType)()
], DiscoveryHomepageResponse);
//# sourceMappingURL=discovery-response.type.js.map