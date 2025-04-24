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
exports.AlertEntity = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const alert_enum_1 = require("../enums/alert.enum");
const alert_metric_entity_1 = require("./alert-metric.entity");
const user_segment_entity_1 = require("../../users/entities/user-segment.entity");
let AlertEntity = class AlertEntity {
};
exports.AlertEntity = AlertEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AlertEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], AlertEntity.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AlertEntity.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: alert_enum_1.AlertType,
        default: alert_enum_1.AlertType.PERSONALIZATION_DROP,
    }),
    __metadata("design:type", String)
], AlertEntity.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: alert_enum_1.AlertSeverity,
        default: alert_enum_1.AlertSeverity.MEDIUM,
    }),
    __metadata("design:type", String)
], AlertEntity.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: alert_enum_1.AlertStatus,
        default: alert_enum_1.AlertStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], AlertEntity.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [alert_metric_entity_1.AlertMetricEntity], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => alert_metric_entity_1.AlertMetricEntity, metric => metric.alert, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], AlertEntity.prototype, "metrics", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_segment_entity_1.UserSegmentEntity], { nullable: true }),
    (0, typeorm_1.ManyToMany)(() => user_segment_entity_1.UserSegmentEntity),
    (0, typeorm_1.JoinTable)({
        name: 'alert_affected_segments',
        joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'segment_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], AlertEntity.prototype, "affectedSegments", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AlertEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AlertEntity.prototype, "updatedAt", void 0);
exports.AlertEntity = AlertEntity = __decorate([
    (0, graphql_1.ObjectType)('Alert'),
    (0, typeorm_1.Entity)('alerts')
], AlertEntity);
//# sourceMappingURL=alert.entity.js.map