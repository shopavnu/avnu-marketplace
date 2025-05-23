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
var AbTestingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbTestingService = void 0;
const common_1 = require("@nestjs/common");
const experiment_service_1 = require("./experiment.service");
const experiment_assignment_service_1 = require("./experiment-assignment.service");
const experiment_analysis_service_1 = require("./experiment-analysis.service");
const experiment_entity_1 = require("../entities/experiment.entity");
let AbTestingService = AbTestingService_1 = class AbTestingService {
    constructor(experimentService, assignmentService, analysisService) {
        this.experimentService = experimentService;
        this.assignmentService = assignmentService;
        this.analysisService = analysisService;
        this.logger = new common_1.Logger(AbTestingService_1.name);
    }
    async createExperiment(createExperimentDto) {
        return this.experimentService.create(createExperimentDto);
    }
    async getAllExperiments(status) {
        return this.experimentService.findAll(status);
    }
    async getExperimentById(id) {
        return this.experimentService.findOne(id);
    }
    async updateExperiment(id, updateExperimentDto) {
        return this.experimentService.update(id, updateExperimentDto);
    }
    async deleteExperiment(id) {
        return this.experimentService.remove(id);
    }
    async startExperiment(id) {
        return this.experimentService.startExperiment(id);
    }
    async pauseExperiment(id) {
        return this.experimentService.pauseExperiment(id);
    }
    async completeExperiment(id) {
        return this.experimentService.completeExperiment(id);
    }
    async archiveExperiment(id) {
        return this.experimentService.archiveExperiment(id);
    }
    async declareWinner(experimentId, variantId) {
        return this.experimentService.declareWinner(experimentId, variantId);
    }
    async getExperimentResults(id) {
        return this.experimentService.getExperimentResults(id);
    }
    async getVariantConfiguration(experimentType, userId, sessionId) {
        return this.assignmentService.getVariantConfiguration(experimentType, userId, sessionId);
    }
    async trackImpression(assignmentId) {
        return this.assignmentService.trackImpression(assignmentId);
    }
    async trackInteraction(assignmentId, context, metadata) {
        return this.assignmentService.trackInteraction(assignmentId, context, metadata);
    }
    async trackConversion(assignmentId, value, context, metadata) {
        return this.assignmentService.trackConversion(assignmentId, value, context, metadata);
    }
    async trackCustomEvent(assignmentId, eventType, value, context, metadata) {
        return this.assignmentService.trackCustomEvent(assignmentId, eventType, value, context, metadata);
    }
    async calculateStatisticalSignificance(experimentId) {
        return this.analysisService.calculateStatisticalSignificance(experimentId);
    }
    async estimateTimeToCompletion(experimentId, dailyTraffic) {
        return this.analysisService.estimateTimeToCompletion(experimentId, dailyTraffic);
    }
    async getMetricsOverTime(experimentId, interval = 'day') {
        return this.analysisService.getMetricsOverTime(experimentId, interval);
    }
    calculateRequiredSampleSize(baselineConversionRate, minimumDetectableEffect, significanceLevel = 0.05, power = 0.8) {
        return this.analysisService.calculateRequiredSampleSize(baselineConversionRate, minimumDetectableEffect, significanceLevel, power);
    }
    async getSearchExperiments(userId, sessionId) {
        return this.assignmentService.getVariantConfiguration(experiment_entity_1.ExperimentType.SEARCH_ALGORITHM, userId, sessionId);
    }
    async getPersonalizationExperiments(userId, sessionId) {
        return this.assignmentService.getVariantConfiguration(experiment_entity_1.ExperimentType.PERSONALIZATION, userId, sessionId);
    }
    async getRecommendationExperiments(userId, sessionId) {
        return this.assignmentService.getVariantConfiguration(experiment_entity_1.ExperimentType.RECOMMENDATION, userId, sessionId);
    }
    async getUiExperiments(userId, sessionId) {
        return this.assignmentService.getVariantConfiguration(experiment_entity_1.ExperimentType.UI_COMPONENT, userId, sessionId);
    }
    async getUserAssignments(userId, sessionId) {
        return this.assignmentService.getUserAssignments(userId, sessionId);
    }
};
exports.AbTestingService = AbTestingService;
exports.AbTestingService = AbTestingService = AbTestingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [experiment_service_1.ExperimentService,
        experiment_assignment_service_1.ExperimentAssignmentService,
        experiment_analysis_service_1.ExperimentAnalysisService])
], AbTestingService);
//# sourceMappingURL=ab-testing.service.js.map