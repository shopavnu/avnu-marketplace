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
exports.Brand = exports.SocialLinks = void 0;
const graphql_1 = require("@nestjs/graphql");
let SocialLinks = class SocialLinks {
};
exports.SocialLinks = SocialLinks;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "instagram", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "twitter", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SocialLinks.prototype, "facebook", void 0);
exports.SocialLinks = SocialLinks = __decorate([
    (0, graphql_1.ObjectType)()
], SocialLinks);
let Brand = class Brand {
};
exports.Brand = Brand;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Brand.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Brand.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "logoUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "websiteUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => SocialLinks, { nullable: true }),
    __metadata("design:type", SocialLinks)
], Brand.prototype, "socialLinks", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "supportedCausesInfo", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "foundedYear", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Brand.prototype, "values", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Brand.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Brand.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Object], { nullable: true }),
    __metadata("design:type", Array)
], Brand.prototype, "products", void 0);
exports.Brand = Brand = __decorate([
    (0, graphql_1.ObjectType)()
], Brand);
//# sourceMappingURL=brand-prisma.entity.js.map