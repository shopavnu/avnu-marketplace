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
exports.UserExperimentAssignment = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
let UserExperimentAssignment = class UserExperimentAssignment {
};
exports.UserExperimentAssignment = UserExperimentAssignment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "experimentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserExperimentAssignment.prototype, "hasImpression", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserExperimentAssignment.prototype, "hasInteraction", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserExperimentAssignment.prototype, "hasConversion", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", String)
], UserExperimentAssignment.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserExperimentAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserExperimentAssignment.prototype, "updatedAt", void 0);
exports.UserExperimentAssignment = UserExperimentAssignment = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('user_experiment_assignments'),
    (0, typeorm_1.Index)(['userId', 'experimentId'], { unique: true }),
    (0, typeorm_1.Index)(['sessionId', 'experimentId'], { unique: true })
], UserExperimentAssignment);
//# sourceMappingURL=user-experiment-assignment.entity.js.map