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
exports.NavigationSection = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
let NavigationSection = class NavigationSection {
};
exports.NavigationSection = NavigationSection;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NavigationSection.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], NavigationSection.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], NavigationSection.prototype, "route", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NavigationSection.prototype, "selector", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], NavigationSection.prototype, "childSelectors", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], NavigationSection.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NavigationSection.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NavigationSection.prototype, "ariaLabel", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NavigationSection.prototype, "parentSectionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NavigationSection.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => typeorm_1.CreateDateColumn),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NavigationSection.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => typeorm_1.UpdateDateColumn),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NavigationSection.prototype, "updatedAt", void 0);
exports.NavigationSection = NavigationSection = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('navigation_sections')
], NavigationSection);
//# sourceMappingURL=navigation-section.entity.js.map