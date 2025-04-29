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
exports.KeyboardShortcut = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
let ShortcutKey = class ShortcutKey {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShortcutKey.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], ShortcutKey.prototype, "altKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], ShortcutKey.prototype, "ctrlKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], ShortcutKey.prototype, "shiftKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], ShortcutKey.prototype, "metaKey", void 0);
ShortcutKey = __decorate([
    (0, graphql_1.ObjectType)()
], ShortcutKey);
let KeyboardShortcut = class KeyboardShortcut {
};
exports.KeyboardShortcut = KeyboardShortcut;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShortcutKey),
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", ShortcutKey)
], KeyboardShortcut.prototype, "shortcutKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "sectionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "route", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KeyboardShortcut.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], KeyboardShortcut.prototype, "isGlobal", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], KeyboardShortcut.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => typeorm_1.CreateDateColumn),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KeyboardShortcut.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => typeorm_1.UpdateDateColumn),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KeyboardShortcut.prototype, "updatedAt", void 0);
exports.KeyboardShortcut = KeyboardShortcut = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('keyboard_shortcuts')
], KeyboardShortcut);
//# sourceMappingURL=keyboard-shortcut.entity.js.map