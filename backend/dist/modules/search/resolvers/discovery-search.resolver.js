'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DiscoverySearchResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const discovery_search_service_1 = require('../services/discovery-search.service');
const search_response_type_1 = require('../graphql/search-response.type');
const discovery_suggestions_type_1 = require('../types/discovery-suggestions.type');
const discovery_homepage_type_1 = require('../types/discovery-homepage.type');
const search_options_dto_1 = require('../dto/search-options.dto');
let DiscoverySearchResolver = class DiscoverySearchResolver {
  constructor(discoverySearchService) {
    this.discoverySearchService = discoverySearchService;
  }
  async discoverySearch(context, query = '', options) {
    const userId = undefined;
    const sessionId = context.req?.headers['x-session-id'] || null;
    return this.discoverySearchService.discoverySearch(query, userId, sessionId, options);
  }
  async discoverySuggestions(query, limit) {
    const userId = undefined;
    return this.discoverySearchService.getDiscoverySuggestions(query, userId, limit);
  }
  async discoveryHomepage(context, options) {
    const userId = undefined;
    const sessionId = context.req?.headers['x-session-id'] || null;
    return this.discoverySearchService.getDiscoveryHomepage(userId, sessionId, options);
  }
};
exports.DiscoverySearchResolver = DiscoverySearchResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => search_response_type_1.SearchResponseType, {
      name: 'discoverySearch',
    }),
    __param(0, (0, graphql_1.Context)()),
    __param(1, (0, graphql_1.Args)('query', { nullable: true })),
    __param(2, (0, graphql_1.Args)('options', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, String, search_options_dto_1.SearchOptionsInput]),
    __metadata('design:returntype', Promise),
  ],
  DiscoverySearchResolver.prototype,
  'discoverySearch',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => discovery_suggestions_type_1.DiscoverySuggestionsType, {
      name: 'discoverySuggestions',
    }),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number]),
    __metadata('design:returntype', Promise),
  ],
  DiscoverySearchResolver.prototype,
  'discoverySuggestions',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => discovery_homepage_type_1.DiscoveryHomepageType, {
      name: 'discoveryHomepage',
    }),
    __param(0, (0, graphql_1.Context)()),
    __param(
      1,
      (0, graphql_1.Args)('options', {
        type: () => search_options_dto_1.SearchOptionsInput,
        nullable: true,
      }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, search_options_dto_1.SearchOptionsInput]),
    __metadata('design:returntype', Promise),
  ],
  DiscoverySearchResolver.prototype,
  'discoveryHomepage',
  null,
);
exports.DiscoverySearchResolver = DiscoverySearchResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    __metadata('design:paramtypes', [discovery_search_service_1.DiscoverySearchService]),
  ],
  DiscoverySearchResolver,
);
//# sourceMappingURL=discovery-search.resolver.js.map
