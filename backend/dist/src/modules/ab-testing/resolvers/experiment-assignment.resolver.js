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
exports.ExperimentAssignmentResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const ab_testing_service_1 = require("../services/ab-testing.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_experiment_assignment_entity_1 = require("../entities/user-experiment-assignment.entity");
const variant_configuration_type_1 = require("../types/variant-configuration.type");
const experiment_entity_1 = require("../entities/experiment.entity");
let ExperimentAssignmentResolver = class ExperimentAssignmentResolver {
    constructor(abTestingService) {
        this.abTestingService = abTestingService;
    }
    async getSearchExperiments(context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getSearchExperiments(userId, sessionId);
    }
    async getPersonalizationExperiments(context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getPersonalizationExperiments(userId, sessionId);
    }
    async getRecommendationExperiments(context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getRecommendationExperiments(userId, sessionId);
    }
    async getUiExperiments(context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getUiExperiments(userId, sessionId);
    }
    async getExperimentVariants(experimentType, context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getVariantConfiguration(experimentType, userId, sessionId);
    }
    async trackImpression(assignmentId) {
        await this.abTestingService.trackImpression(assignmentId);
        return true;
    }
    async trackInteraction(assignmentId, context, metadata) {
        await this.abTestingService.trackInteraction(assignmentId, context, metadata ? JSON.parse(metadata) : undefined);
        return true;
    }
    async trackConversion(assignmentId, value, context, metadata) {
        await this.abTestingService.trackConversion(assignmentId, value, context, metadata ? JSON.parse(metadata) : undefined);
        return true;
    }
    async trackCustomEvent(assignmentId, eventType, value, context, metadata) {
        await this.abTestingService.trackCustomEvent(assignmentId, eventType, value, context, metadata ? JSON.parse(metadata) : undefined);
        return true;
    }
    async getUserAssignments(context) {
        const userId = null;
        const sessionId = context.req?.headers['x-session-id'] || null;
        return this.abTestingService.getUserAssignments(userId, sessionId);
    }
};
exports.ExperimentAssignmentResolver = ExperimentAssignmentResolver;
__decorate([
    (0, graphql_1.Query)(() => variant_configuration_type_1.VariantConfigurationType, { name: 'searchExperiments', nullable: true }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getSearchExperiments", null);
__decorate([
    (0, graphql_1.Query)(() => variant_configuration_type_1.VariantConfigurationType, { name: 'personalizationExperiments', nullable: true }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getPersonalizationExperiments", null);
__decorate([
    (0, graphql_1.Query)(() => variant_configuration_type_1.VariantConfigurationType, { name: 'recommendationExperiments', nullable: true }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getRecommendationExperiments", null);
__decorate([
    (0, graphql_1.Query)(() => variant_configuration_type_1.VariantConfigurationType, { name: 'uiExperiments', nullable: true }),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getUiExperiments", null);
__decorate([
    (0, graphql_1.Query)(() => variant_configuration_type_1.VariantConfigurationType, { name: 'experimentVariants', nullable: true }),
    __param(0, (0, graphql_1.Args)('experimentType')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getExperimentVariants", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "trackImpression", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('assignmentId')),
    __param(1, (0, graphql_1.Args)('context', { nullable: true })),
    __param(2, (0, graphql_1.Args)('metadata', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "trackInteraction", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('assignmentId')),
    __param(1, (0, graphql_1.Args)('value', { nullable: true })),
    __param(2, (0, graphql_1.Args)('context', { nullable: true })),
    __param(3, (0, graphql_1.Args)('metadata', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "trackConversion", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('assignmentId')),
    __param(1, (0, graphql_1.Args)('eventType')),
    __param(2, (0, graphql_1.Args)('value', { nullable: true })),
    __param(3, (0, graphql_1.Args)('context', { nullable: true })),
    __param(4, (0, graphql_1.Args)('metadata', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "trackCustomEvent", null);
__decorate([
    (0, graphql_1.Query)(() => [user_experiment_assignment_entity_1.UserExperimentAssignment], { name: 'userAssignments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExperimentAssignmentResolver.prototype, "getUserAssignments", null);
exports.ExperimentAssignmentResolver = ExperimentAssignmentResolver = __decorate([
    (0, graphql_1.Resolver)(() => user_experiment_assignment_entity_1.UserExperimentAssignment),
    __metadata("design:paramtypes", [ab_testing_service_1.AbTestingService])
], ExperimentAssignmentResolver);
//# sourceMappingURL=experiment-assignment.resolver.js.map