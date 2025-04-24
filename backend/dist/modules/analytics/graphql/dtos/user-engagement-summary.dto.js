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
exports.UserEngagementSummaryDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const engagement_type_count_dto_1 = require("./engagement-type-count.dto");
const product_interaction_count_dto_1 = require("./product-interaction-count.dto");
let UserEngagementSummaryDto = class UserEngagementSummaryDto {
};
exports.UserEngagementSummaryDto = UserEngagementSummaryDto;
__decorate([
    (0, graphql_1.Field)(_type => [engagement_type_count_dto_1.EngagementTypeCount], { nullable: true }),
    __metadata("design:type", Array)
], UserEngagementSummaryDto.prototype, "userEngagementByType", void 0);
__decorate([
    (0, graphql_1.Field)(() => [product_interaction_count_dto_1.ProductInteractionCount], { nullable: true }),
    __metadata("design:type", Array)
], UserEngagementSummaryDto.prototype, "topViewedProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [product_interaction_count_dto_1.ProductInteractionCount], { nullable: true }),
    __metadata("design:type", Array)
], UserEngagementSummaryDto.prototype, "topFavoritedProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UserEngagementSummaryDto.prototype, "userEngagementFunnel", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UserEngagementSummaryDto.prototype, "userRetentionMetrics", void 0);
exports.UserEngagementSummaryDto = UserEngagementSummaryDto = __decorate([
    (0, graphql_1.ObjectType)()
], UserEngagementSummaryDto);
//# sourceMappingURL=user-engagement-summary.dto.js.map