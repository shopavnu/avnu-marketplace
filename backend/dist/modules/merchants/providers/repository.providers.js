"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantRepositoryProviders = exports.merchantRepositoryFactories = void 0;
const merchant_analytics_entity_1 = require("../entities/merchant-analytics.entity");
const decorator_compatibility_1 = require("../../../utils/decorator-compatibility");
exports.merchantRepositoryFactories = [
    (0, decorator_compatibility_1.createRepositoryFactory)(merchant_analytics_entity_1.MerchantAnalytics),
];
exports.merchantRepositoryProviders = [
    (0, decorator_compatibility_1.createRepositoryProvider)(merchant_analytics_entity_1.MerchantAnalytics),
];
//# sourceMappingURL=repository.providers.js.map