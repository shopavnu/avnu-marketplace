"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEntityType = void 0;
const graphql_1 = require("@nestjs/graphql");
var SearchEntityType;
(function (SearchEntityType) {
    SearchEntityType["PRODUCT"] = "product";
    SearchEntityType["MERCHANT"] = "merchant";
    SearchEntityType["BRAND"] = "brand";
    SearchEntityType["ALL"] = "all";
})(SearchEntityType || (exports.SearchEntityType = SearchEntityType = {}));
(0, graphql_1.registerEnumType)(SearchEntityType, {
    name: 'SearchEntityType',
    description: 'The types of entities that can be searched',
});
//# sourceMappingURL=search-entity-type.enum.js.map