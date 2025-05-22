'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchEntityType = void 0;
var graphql_1 = require('@nestjs/graphql');
/**
 * Enum representing the different entity types that can be searched
 */
var SearchEntityType;
(function (SearchEntityType) {
  SearchEntityType['PRODUCT'] = 'product';
  SearchEntityType['MERCHANT'] = 'merchant';
  SearchEntityType['BRAND'] = 'brand';
  SearchEntityType['ALL'] = 'all';
})(SearchEntityType || (exports.SearchEntityType = SearchEntityType = {}));
// Register the enum with GraphQL
(0, graphql_1.registerEnumType)(SearchEntityType, {
  name: 'SearchEntityType',
  description: 'The types of entities that can be searched',
});
