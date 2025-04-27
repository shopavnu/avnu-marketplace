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
exports.SessionInteractionEntity = void 0;
const typeorm_1 = require("typeorm");
const session_entity_1 = require("./session.entity");
const session_service_1 = require("../services/session.service");
let SessionInteractionEntity = class SessionInteractionEntity {
};
exports.SessionInteractionEntity = SessionInteractionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SessionInteractionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => session_entity_1.SessionEntity, session => session.interactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'session_id' }),
    __metadata("design:type", session_entity_1.SessionEntity)
], SessionInteractionEntity.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
    }),
    __metadata("design:type", String)
], SessionInteractionEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SessionInteractionEntity.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SessionInteractionEntity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], SessionInteractionEntity.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SessionInteractionEntity.prototype, "createdAt", void 0);
exports.SessionInteractionEntity = SessionInteractionEntity = __decorate([
    (0, typeorm_1.Entity)('session_interactions')
], SessionInteractionEntity);
//# sourceMappingURL=session-interaction.entity.js.map