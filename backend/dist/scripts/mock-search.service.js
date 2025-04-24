"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSearchService = void 0;
const common_1 = require("@nestjs/common");
let MockSearchService = MockSearchService_1 = class MockSearchService {
    constructor() {
        this.logger = new common_1.Logger(MockSearchService_1.name);
    }
    async searchProducts(query, paginationDto, filters) {
        this.logger.log(`Mock search for: ${query}`);
        if (filters) {
            this.logger.log(`With filters: ${JSON.stringify(filters)}`);
        }
        return {
            items: [],
            total: 0,
        };
    }
    async getProductSuggestions(partialQuery, limit = 5) {
        this.logger.log(`Mock suggestions for: ${partialQuery}`);
        return [
            `${partialQuery} suggestion 1`,
            `${partialQuery} suggestion 2`,
            `${partialQuery} suggestion 3`,
        ];
    }
};
exports.MockSearchService = MockSearchService;
exports.MockSearchService = MockSearchService = MockSearchService_1 = __decorate([
    (0, common_1.Injectable)()
], MockSearchService);
//# sourceMappingURL=mock-search.service.js.map