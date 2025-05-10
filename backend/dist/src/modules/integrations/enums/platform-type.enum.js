"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformType = void 0;
const graphql_1 = require("@nestjs/graphql");
var PlatformType;
(function (PlatformType) {
    PlatformType["SHOPIFY"] = "shopify";
    PlatformType["MAGENTO"] = "magento";
    PlatformType["BIGCOMMERCE"] = "bigcommerce";
    PlatformType["PRESTASHOP"] = "prestashop";
    PlatformType["CUSTOM"] = "custom";
    PlatformType["MANUAL"] = "manual";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
(0, graphql_1.registerEnumType)(PlatformType, {
    name: 'PlatformType',
    description: 'External platform types that can be integrated with Avnu Marketplace',
});
//# sourceMappingURL=platform-type.enum.js.map