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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AbTestingModule = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const experiment_entity_1 = require('./entities/experiment.entity');
const experiment_variant_entity_1 = require('./entities/experiment-variant.entity');
const experiment_result_entity_1 = require('./entities/experiment-result.entity');
const user_experiment_assignment_entity_1 = require('./entities/user-experiment-assignment.entity');
const experiment_service_1 = require('./services/experiment.service');
const experiment_assignment_service_1 = require('./services/experiment-assignment.service');
const experiment_analysis_service_1 = require('./services/experiment-analysis.service');
const ab_testing_service_1 = require('./services/ab-testing.service');
const experiment_resolver_1 = require('./resolvers/experiment.resolver');
const experiment_assignment_resolver_1 = require('./resolvers/experiment-assignment.resolver');
let AbTestingModule = class AbTestingModule {};
exports.AbTestingModule = AbTestingModule;
exports.AbTestingModule = AbTestingModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          experiment_entity_1.Experiment,
          experiment_variant_entity_1.ExperimentVariant,
          experiment_result_entity_1.ExperimentResult,
          user_experiment_assignment_entity_1.UserExperimentAssignment,
        ]),
      ],
      providers: [
        experiment_service_1.ExperimentService,
        experiment_assignment_service_1.ExperimentAssignmentService,
        experiment_analysis_service_1.ExperimentAnalysisService,
        ab_testing_service_1.AbTestingService,
        experiment_resolver_1.ExperimentResolver,
        experiment_assignment_resolver_1.ExperimentAssignmentResolver,
      ],
      exports: [
        ab_testing_service_1.AbTestingService,
        experiment_assignment_service_1.ExperimentAssignmentService,
      ],
    }),
  ],
  AbTestingModule,
);
//# sourceMappingURL=ab-testing.module.js.map
