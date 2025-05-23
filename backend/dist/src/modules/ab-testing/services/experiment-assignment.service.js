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
var ExperimentAssignmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const experiment_entity_1 = require("../entities/experiment.entity");
const experiment_variant_entity_1 = require("../entities/experiment-variant.entity");
const experiment_result_entity_1 = require("../entities/experiment-result.entity");
const user_experiment_assignment_entity_1 = require("../entities/user-experiment-assignment.entity");
let ExperimentAssignmentService = ExperimentAssignmentService_1 = class ExperimentAssignmentService {
    constructor(experimentRepository, variantRepository, resultRepository, assignmentRepository) {
        this.experimentRepository = experimentRepository;
        this.variantRepository = variantRepository;
        this.resultRepository = resultRepository;
        this.assignmentRepository = assignmentRepository;
        this.logger = new common_1.Logger(ExperimentAssignmentService_1.name);
    }
    async getOrCreateAssignment(experimentId, userId, sessionId) {
        try {
            if (!userId && !sessionId) {
                throw new Error('Either userId or sessionId must be provided');
            }
            const experiment = await this.experimentRepository.findOne({
                where: { id: experimentId },
                relations: ['variants'],
            });
            if (!experiment) {
                throw new common_1.NotFoundException(`Experiment with ID ${experimentId} not found`);
            }
            if (experiment.status !== experiment_entity_1.ExperimentStatus.RUNNING) {
                throw new Error(`Experiment is not running (status: ${experiment.status})`);
            }
            let assignment = null;
            if (userId) {
                assignment = await this.assignmentRepository.findOne({
                    where: {
                        experimentId,
                        userId,
                    },
                });
            }
            else if (sessionId) {
                assignment = await this.assignmentRepository.findOne({
                    where: {
                        experimentId,
                        sessionId,
                    },
                });
            }
            if (assignment) {
                return assignment;
            }
            if (experiment.audiencePercentage !== null && experiment.audiencePercentage !== undefined) {
                const randomValue = Math.random() * 100;
                if (randomValue > experiment.audiencePercentage) {
                    const controlVariant = experiment.variants.find(v => v.isControl);
                    if (!controlVariant) {
                        throw new Error('No control variant found for experiment');
                    }
                    assignment = this.assignmentRepository.create({
                        experimentId,
                        userId,
                        sessionId,
                        variantId: controlVariant.id,
                    });
                    return this.assignmentRepository.save(assignment);
                }
            }
            const variants = experiment.variants;
            const randomIndex = Math.floor(Math.random() * variants.length);
            const selectedVariant = variants[randomIndex];
            assignment = this.assignmentRepository.create({
                experimentId,
                userId,
                sessionId,
                variantId: selectedVariant.id,
            });
            return this.assignmentRepository.save(assignment);
        }
        catch (error) {
            this.logger.error(`Failed to get or create assignment: ${error.message}`);
            throw error;
        }
    }
    async getActiveExperiments(experimentType) {
        try {
            const isValidType = Object.values(experiment_entity_1.ExperimentType).includes(experimentType);
            if (!isValidType) {
                this.logger.warn(`Invalid experiment type provided: ${experimentType}`);
                return [];
            }
            const typeEnum = experimentType;
            return this.experimentRepository.find({
                where: {
                    status: experiment_entity_1.ExperimentStatus.RUNNING,
                    type: typeEnum,
                },
                relations: ['variants'],
            });
        }
        catch (error) {
            this.logger.error(`Failed to get active experiments: ${error.message}`);
            throw error;
        }
    }
    async getVariantConfiguration(experimentType, userId, sessionId) {
        try {
            if (!userId && !sessionId) {
                throw new Error('Either userId or sessionId must be provided');
            }
            const activeExperiments = await this.getActiveExperiments(experimentType);
            if (activeExperiments.length === 0) {
                return null;
            }
            const assignments = await Promise.all(activeExperiments.map(async (experiment) => {
                const assignment = await this.getOrCreateAssignment(experiment.id, userId, sessionId);
                const variant = experiment.variants.find(v => v.id === assignment.variantId);
                if (!variant) {
                    throw new Error(`Variant with ID ${assignment.variantId} not found`);
                }
                await this.trackImpression(assignment.id);
                return {
                    experimentId: experiment.id,
                    experimentName: experiment.name,
                    experimentType: experiment.type,
                    variantId: variant.id,
                    variantName: variant.name,
                    isControl: variant.isControl,
                    configuration: variant.configuration ? JSON.parse(variant.configuration) : {},
                    assignmentId: assignment.id,
                };
            }));
            return assignments.reduce((result, assignment) => {
                result[assignment.experimentId] = {
                    variantId: assignment.variantId,
                    configuration: assignment.configuration,
                    assignmentId: assignment.assignmentId,
                };
                return result;
            }, {});
        }
        catch (error) {
            this.logger.error(`Failed to get variant configuration: ${error.message}`);
            return null;
        }
    }
    async trackImpression(assignmentId) {
        try {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
            }
            if (!assignment.hasImpression) {
                assignment.hasImpression = true;
                await this.assignmentRepository.save(assignment);
            }
            const result = this.resultRepository.create({
                variantId: assignment.variantId,
                userId: assignment.userId,
                sessionId: assignment.sessionId,
                resultType: experiment_result_entity_1.ResultType.IMPRESSION,
            });
            await this.resultRepository.save(result);
        }
        catch (error) {
            this.logger.error(`Failed to track impression: ${error.message}`);
        }
    }
    async trackInteraction(assignmentId, context, metadata) {
        try {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
            }
            if (!assignment.hasInteraction) {
                assignment.hasInteraction = true;
                await this.assignmentRepository.save(assignment);
            }
            const result = this.resultRepository.create({
                variantId: assignment.variantId,
                userId: assignment.userId,
                sessionId: assignment.sessionId,
                resultType: experiment_result_entity_1.ResultType.CLICK,
                context,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            });
            await this.resultRepository.save(result);
        }
        catch (error) {
            this.logger.error(`Failed to track interaction: ${error.message}`);
        }
    }
    async trackConversion(assignmentId, value, context, metadata) {
        try {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
            }
            if (!assignment.hasConversion) {
                assignment.hasConversion = true;
                await this.assignmentRepository.save(assignment);
            }
            const conversionResult = this.resultRepository.create({
                variantId: assignment.variantId,
                userId: assignment.userId,
                sessionId: assignment.sessionId,
                resultType: experiment_result_entity_1.ResultType.CONVERSION,
                context,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            });
            await this.resultRepository.save(conversionResult);
            if (value !== undefined && value !== null) {
                const revenueResult = this.resultRepository.create({
                    variantId: assignment.variantId,
                    userId: assignment.userId,
                    sessionId: assignment.sessionId,
                    resultType: experiment_result_entity_1.ResultType.REVENUE,
                    value,
                    context,
                    metadata: metadata ? JSON.stringify(metadata) : undefined,
                });
                await this.resultRepository.save(revenueResult);
            }
        }
        catch (error) {
            this.logger.error(`Failed to track conversion: ${error.message}`);
        }
    }
    async trackCustomEvent(assignmentId, eventType, value, context, metadata) {
        try {
            const assignment = await this.assignmentRepository.findOne({
                where: { id: assignmentId },
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Assignment with ID ${assignmentId} not found`);
            }
            const result = this.resultRepository.create({
                variantId: assignment.variantId,
                userId: assignment.userId,
                sessionId: assignment.sessionId,
                resultType: experiment_result_entity_1.ResultType.CUSTOM,
                value,
                context: eventType,
                metadata: metadata
                    ? JSON.stringify({
                        ...metadata,
                        eventType,
                        customContext: context,
                    })
                    : JSON.stringify({ eventType, customContext: context }),
            });
            await this.resultRepository.save(result);
        }
        catch (error) {
            this.logger.error(`Failed to track custom event: ${error.message}`);
        }
    }
    async getUserAssignments(userId, sessionId) {
        try {
            if (!userId && !sessionId) {
                throw new Error('Either userId or sessionId must be provided');
            }
            const query = {};
            if (userId) {
                query.userId = userId;
            }
            else if (sessionId) {
                query.sessionId = sessionId;
            }
            return this.assignmentRepository.find({
                where: query,
                relations: ['experiment', 'variant'],
            });
        }
        catch (error) {
            this.logger.error(`Failed to get user assignments: ${error.message}`);
            throw error;
        }
    }
};
exports.ExperimentAssignmentService = ExperimentAssignmentService;
exports.ExperimentAssignmentService = ExperimentAssignmentService = ExperimentAssignmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(experiment_entity_1.Experiment)),
    __param(1, (0, typeorm_1.InjectRepository)(experiment_variant_entity_1.ExperimentVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(experiment_result_entity_1.ExperimentResult)),
    __param(3, (0, typeorm_1.InjectRepository)(user_experiment_assignment_entity_1.UserExperimentAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExperimentAssignmentService);
//# sourceMappingURL=experiment-assignment.service.js.map