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
exports.SafeInjectRepository = SafeInjectRepository;
exports.createRepositoryFactory = createRepositoryFactory;
exports.createRepositoryProvider = createRepositoryProvider;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
function SafeInjectRepository(entity) {
    return function (target, key, index) {
        return Reflect.metadata('design:type', typeorm_2.Repository)(target, key);
    };
}
function createRepositoryFactory(entity) {
    let RepositoryFactory = class RepositoryFactory {
        constructor(repository) {
            this.repository = repository;
        }
        getRepository() {
            return this.repository;
        }
    };
    RepositoryFactory = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(entity)),
        __metadata("design:paramtypes", [typeorm_2.Repository])
    ], RepositoryFactory);
    return RepositoryFactory;
}
function createRepositoryProvider(entity) {
    return {
        provide: `${entity.name}Repository`,
        useFactory: (factory) => factory.getRepository(),
        inject: [createRepositoryFactory(entity)]
    };
}
//# sourceMappingURL=decorator-compatibility.js.map