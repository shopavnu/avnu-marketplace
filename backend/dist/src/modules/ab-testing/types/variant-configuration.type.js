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
Object.defineProperty(exports, '__esModule', { value: true });
exports.VariantConfigurationType = exports.VariantAssignmentType = void 0;
const graphql_1 = require('@nestjs/graphql');
const graphql_type_json_1 = require('graphql-type-json');
let VariantAssignmentType = class VariantAssignmentType {};
exports.VariantAssignmentType = VariantAssignmentType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  VariantAssignmentType.prototype,
  'variantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON), __metadata('design:type', Object)],
  VariantAssignmentType.prototype,
  'configuration',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  VariantAssignmentType.prototype,
  'assignmentId',
  void 0,
);
exports.VariantAssignmentType = VariantAssignmentType = __decorate(
  [(0, graphql_1.ObjectType)()],
  VariantAssignmentType,
);
let VariantConfigurationType = class VariantConfigurationType {};
exports.VariantConfigurationType = VariantConfigurationType;
__decorate(
  [(0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON), __metadata('design:type', Object)],
  VariantConfigurationType.prototype,
  'experiments',
  void 0,
);
exports.VariantConfigurationType = VariantConfigurationType = __decorate(
  [(0, graphql_1.ObjectType)()],
  VariantConfigurationType,
);
//# sourceMappingURL=variant-configuration.type.js.map
