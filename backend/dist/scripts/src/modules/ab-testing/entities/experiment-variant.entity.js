'use strict';
var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context,
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ExperimentVariant = void 0;
var typeorm_1 = require('typeorm');
var graphql_1 = require('@nestjs/graphql');
var experiment_entity_1 = require('./experiment.entity');
var experiment_result_entity_1 = require('./experiment-result.entity');
var ExperimentVariant = (function () {
  var _classDecorators = [
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('experiment_variants'),
  ];
  var _classDescriptor;
  var _classExtraInitializers = [];
  var _classThis;
  var _id_decorators;
  var _id_initializers = [];
  var _id_extraInitializers = [];
  var _name_decorators;
  var _name_initializers = [];
  var _name_extraInitializers = [];
  var _description_decorators;
  var _description_initializers = [];
  var _description_extraInitializers = [];
  var _isControl_decorators;
  var _isControl_initializers = [];
  var _isControl_extraInitializers = [];
  var _experimentId_decorators;
  var _experimentId_initializers = [];
  var _experimentId_extraInitializers = [];
  var _experiment_decorators;
  var _experiment_initializers = [];
  var _experiment_extraInitializers = [];
  var _configuration_decorators;
  var _configuration_initializers = [];
  var _configuration_extraInitializers = [];
  var _impressions_decorators;
  var _impressions_initializers = [];
  var _impressions_extraInitializers = [];
  var _conversions_decorators;
  var _conversions_initializers = [];
  var _conversions_extraInitializers = [];
  var _conversionRate_decorators;
  var _conversionRate_initializers = [];
  var _conversionRate_extraInitializers = [];
  var _improvementRate_decorators;
  var _improvementRate_initializers = [];
  var _improvementRate_extraInitializers = [];
  var _isWinner_decorators;
  var _isWinner_initializers = [];
  var _isWinner_extraInitializers = [];
  var _confidenceLevel_decorators;
  var _confidenceLevel_initializers = [];
  var _confidenceLevel_extraInitializers = [];
  var _results_decorators;
  var _results_initializers = [];
  var _results_extraInitializers = [];
  var _createdAt_decorators;
  var _createdAt_initializers = [];
  var _createdAt_extraInitializers = [];
  var _updatedAt_decorators;
  var _updatedAt_initializers = [];
  var _updatedAt_extraInitializers = [];
  var ExperimentVariant = (_classThis = /** @class */ (function () {
    function ExperimentVariant_1() {
      this.id = __runInitializers(this, _id_initializers, void 0);
      this.name =
        (__runInitializers(this, _id_extraInitializers),
        __runInitializers(this, _name_initializers, void 0));
      this.description =
        (__runInitializers(this, _name_extraInitializers),
        __runInitializers(this, _description_initializers, void 0));
      this.isControl =
        (__runInitializers(this, _description_extraInitializers),
        __runInitializers(this, _isControl_initializers, void 0));
      this.experimentId =
        (__runInitializers(this, _isControl_extraInitializers),
        __runInitializers(this, _experimentId_initializers, void 0));
      this.experiment =
        (__runInitializers(this, _experimentId_extraInitializers),
        __runInitializers(this, _experiment_initializers, void 0));
      this.configuration =
        (__runInitializers(this, _experiment_extraInitializers),
        __runInitializers(this, _configuration_initializers, void 0));
      this.impressions =
        (__runInitializers(this, _configuration_extraInitializers),
        __runInitializers(this, _impressions_initializers, void 0));
      this.conversions =
        (__runInitializers(this, _impressions_extraInitializers),
        __runInitializers(this, _conversions_initializers, void 0));
      this.conversionRate =
        (__runInitializers(this, _conversions_extraInitializers),
        __runInitializers(this, _conversionRate_initializers, void 0));
      this.improvementRate =
        (__runInitializers(this, _conversionRate_extraInitializers),
        __runInitializers(this, _improvementRate_initializers, void 0));
      this.isWinner =
        (__runInitializers(this, _improvementRate_extraInitializers),
        __runInitializers(this, _isWinner_initializers, void 0));
      this.confidenceLevel =
        (__runInitializers(this, _isWinner_extraInitializers),
        __runInitializers(this, _confidenceLevel_initializers, void 0));
      this.results =
        (__runInitializers(this, _confidenceLevel_extraInitializers),
        __runInitializers(this, _results_initializers, void 0));
      this.createdAt =
        (__runInitializers(this, _results_extraInitializers),
        __runInitializers(this, _createdAt_initializers, void 0));
      this.updatedAt =
        (__runInitializers(this, _createdAt_extraInitializers),
        __runInitializers(this, _updatedAt_initializers, void 0));
      __runInitializers(this, _updatedAt_extraInitializers);
    }
    return ExperimentVariant_1;
  })());
  __setFunctionName(_classThis, 'ExperimentVariant');
  (function () {
    var _metadata = typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
    _id_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.ID;
      }),
      (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    ];
    _name_decorators = [
      (0, graphql_1.Field)(function () {
        return String;
      }),
      (0, typeorm_1.Column)(),
    ];
    _description_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _isControl_decorators = [
      (0, graphql_1.Field)(function () {
        return Boolean;
      }),
      (0, typeorm_1.Column)({ default: false }),
    ];
    _experimentId_decorators = [
      (0, graphql_1.Field)(function () {
        return String;
      }),
      (0, typeorm_1.Column)(),
    ];
    _experiment_decorators = [
      (0, typeorm_1.ManyToOne)(
        function () {
          return experiment_entity_1.Experiment;
        },
        function (experiment) {
          return experiment.variants;
        },
      ),
      (0, typeorm_1.JoinColumn)({ name: 'experimentId' }),
    ];
    _configuration_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    ];
    _impressions_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Int;
        },
        { defaultValue: 0 },
      ),
      (0, typeorm_1.Column)({ default: 0 }),
    ];
    _conversions_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Int;
        },
        { defaultValue: 0 },
      ),
      (0, typeorm_1.Column)({ default: 0 }),
    ];
    _conversionRate_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Float;
        },
        { defaultValue: 0 },
      ),
      (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    ];
    _improvementRate_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Float;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    ];
    _isWinner_decorators = [
      (0, graphql_1.Field)(
        function () {
          return Boolean;
        },
        { defaultValue: false },
      ),
      (0, typeorm_1.Column)({ default: false }),
    ];
    _confidenceLevel_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Float;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    ];
    _results_decorators = [
      (0, graphql_1.Field)(
        function () {
          return [experiment_result_entity_1.ExperimentResult];
        },
        { nullable: true },
      ),
      (0, typeorm_1.OneToMany)(
        function () {
          return experiment_result_entity_1.ExperimentResult;
        },
        function (result) {
          return result.variant;
        },
        {
          cascade: true,
        },
      ),
    ];
    _createdAt_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.GraphQLISODateTime;
      }),
      (0, typeorm_1.CreateDateColumn)(),
    ];
    _updatedAt_decorators = [
      (0, graphql_1.Field)(function () {
        return graphql_1.GraphQLISODateTime;
      }),
      (0, typeorm_1.UpdateDateColumn)(),
    ];
    __esDecorate(
      null,
      null,
      _id_decorators,
      {
        kind: 'field',
        name: 'id',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'id' in obj;
          },
          get: function (obj) {
            return obj.id;
          },
          set: function (obj, value) {
            obj.id = value;
          },
        },
        metadata: _metadata,
      },
      _id_initializers,
      _id_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _name_decorators,
      {
        kind: 'field',
        name: 'name',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'name' in obj;
          },
          get: function (obj) {
            return obj.name;
          },
          set: function (obj, value) {
            obj.name = value;
          },
        },
        metadata: _metadata,
      },
      _name_initializers,
      _name_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _description_decorators,
      {
        kind: 'field',
        name: 'description',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'description' in obj;
          },
          get: function (obj) {
            return obj.description;
          },
          set: function (obj, value) {
            obj.description = value;
          },
        },
        metadata: _metadata,
      },
      _description_initializers,
      _description_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _isControl_decorators,
      {
        kind: 'field',
        name: 'isControl',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'isControl' in obj;
          },
          get: function (obj) {
            return obj.isControl;
          },
          set: function (obj, value) {
            obj.isControl = value;
          },
        },
        metadata: _metadata,
      },
      _isControl_initializers,
      _isControl_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _experimentId_decorators,
      {
        kind: 'field',
        name: 'experimentId',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'experimentId' in obj;
          },
          get: function (obj) {
            return obj.experimentId;
          },
          set: function (obj, value) {
            obj.experimentId = value;
          },
        },
        metadata: _metadata,
      },
      _experimentId_initializers,
      _experimentId_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _experiment_decorators,
      {
        kind: 'field',
        name: 'experiment',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'experiment' in obj;
          },
          get: function (obj) {
            return obj.experiment;
          },
          set: function (obj, value) {
            obj.experiment = value;
          },
        },
        metadata: _metadata,
      },
      _experiment_initializers,
      _experiment_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _configuration_decorators,
      {
        kind: 'field',
        name: 'configuration',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'configuration' in obj;
          },
          get: function (obj) {
            return obj.configuration;
          },
          set: function (obj, value) {
            obj.configuration = value;
          },
        },
        metadata: _metadata,
      },
      _configuration_initializers,
      _configuration_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _impressions_decorators,
      {
        kind: 'field',
        name: 'impressions',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'impressions' in obj;
          },
          get: function (obj) {
            return obj.impressions;
          },
          set: function (obj, value) {
            obj.impressions = value;
          },
        },
        metadata: _metadata,
      },
      _impressions_initializers,
      _impressions_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _conversions_decorators,
      {
        kind: 'field',
        name: 'conversions',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'conversions' in obj;
          },
          get: function (obj) {
            return obj.conversions;
          },
          set: function (obj, value) {
            obj.conversions = value;
          },
        },
        metadata: _metadata,
      },
      _conversions_initializers,
      _conversions_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _conversionRate_decorators,
      {
        kind: 'field',
        name: 'conversionRate',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'conversionRate' in obj;
          },
          get: function (obj) {
            return obj.conversionRate;
          },
          set: function (obj, value) {
            obj.conversionRate = value;
          },
        },
        metadata: _metadata,
      },
      _conversionRate_initializers,
      _conversionRate_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _improvementRate_decorators,
      {
        kind: 'field',
        name: 'improvementRate',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'improvementRate' in obj;
          },
          get: function (obj) {
            return obj.improvementRate;
          },
          set: function (obj, value) {
            obj.improvementRate = value;
          },
        },
        metadata: _metadata,
      },
      _improvementRate_initializers,
      _improvementRate_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _isWinner_decorators,
      {
        kind: 'field',
        name: 'isWinner',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'isWinner' in obj;
          },
          get: function (obj) {
            return obj.isWinner;
          },
          set: function (obj, value) {
            obj.isWinner = value;
          },
        },
        metadata: _metadata,
      },
      _isWinner_initializers,
      _isWinner_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _confidenceLevel_decorators,
      {
        kind: 'field',
        name: 'confidenceLevel',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'confidenceLevel' in obj;
          },
          get: function (obj) {
            return obj.confidenceLevel;
          },
          set: function (obj, value) {
            obj.confidenceLevel = value;
          },
        },
        metadata: _metadata,
      },
      _confidenceLevel_initializers,
      _confidenceLevel_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _results_decorators,
      {
        kind: 'field',
        name: 'results',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'results' in obj;
          },
          get: function (obj) {
            return obj.results;
          },
          set: function (obj, value) {
            obj.results = value;
          },
        },
        metadata: _metadata,
      },
      _results_initializers,
      _results_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _createdAt_decorators,
      {
        kind: 'field',
        name: 'createdAt',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'createdAt' in obj;
          },
          get: function (obj) {
            return obj.createdAt;
          },
          set: function (obj, value) {
            obj.createdAt = value;
          },
        },
        metadata: _metadata,
      },
      _createdAt_initializers,
      _createdAt_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _updatedAt_decorators,
      {
        kind: 'field',
        name: 'updatedAt',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'updatedAt' in obj;
          },
          get: function (obj) {
            return obj.updatedAt;
          },
          set: function (obj, value) {
            obj.updatedAt = value;
          },
        },
        metadata: _metadata,
      },
      _updatedAt_initializers,
      _updatedAt_extraInitializers,
    );
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers,
    );
    ExperimentVariant = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (ExperimentVariant = _classThis);
})();
exports.ExperimentVariant = ExperimentVariant;
