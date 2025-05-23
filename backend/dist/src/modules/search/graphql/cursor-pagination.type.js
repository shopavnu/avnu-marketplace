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
exports.CursorPaginationInput = exports.CursorPaginationType = void 0;
const graphql_1 = require("@nestjs/graphql");
let CursorPaginationType = class CursorPaginationType {
};
exports.CursorPaginationType = CursorPaginationType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CursorPaginationType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CursorPaginationType.prototype, "nextCursor", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CursorPaginationType.prototype, "hasMore", void 0);
exports.CursorPaginationType = CursorPaginationType = __decorate([
    (0, graphql_1.ObjectType)()
], CursorPaginationType);
let CursorPaginationInput = class CursorPaginationInput {
    constructor() {
        this.limit = 20;
    }
};
exports.CursorPaginationInput = CursorPaginationInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CursorPaginationInput.prototype, "cursor", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    __metadata("design:type", Number)
], CursorPaginationInput.prototype, "limit", void 0);
exports.CursorPaginationInput = CursorPaginationInput = __decorate([
    (0, graphql_1.InputType)()
], CursorPaginationInput);
//# sourceMappingURL=cursor-pagination.type.js.map