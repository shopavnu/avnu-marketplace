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
exports.Experiment = exports.ExperimentType = exports.ExperimentStatus = void 0;
var typeorm_1 = require('typeorm');
var graphql_1 = require('@nestjs/graphql');
var experiment_variant_entity_1 = require('./experiment-variant.entity');
var ExperimentStatus;
(function (ExperimentStatus) {
  ExperimentStatus['DRAFT'] = 'draft';
  ExperimentStatus['RUNNING'] = 'running';
  ExperimentStatus['PAUSED'] = 'paused';
  ExperimentStatus['COMPLETED'] = 'completed';
  ExperimentStatus['ARCHIVED'] = 'archived';
})(ExperimentStatus || (exports.ExperimentStatus = ExperimentStatus = {}));
var ExperimentType;
(function (ExperimentType) {
  ExperimentType['SEARCH_ALGORITHM'] = 'search_algorithm';
  ExperimentType['UI_COMPONENT'] = 'ui_component';
  ExperimentType['PERSONALIZATION'] = 'personalization';
  ExperimentType['RECOMMENDATION'] = 'recommendation';
  ExperimentType['PRICING'] = 'pricing';
  ExperimentType['CONTENT'] = 'content';
  ExperimentType['FEATURE_FLAG'] = 'feature_flag';
})(ExperimentType || (exports.ExperimentType = ExperimentType = {}));
var Experiment = (function () {
  var _classDecorators = [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('experiments')];
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
  var _status_decorators;
  var _status_initializers = [];
  var _status_extraInitializers = [];
  var _type_decorators;
  var _type_initializers = [];
  var _type_extraInitializers = [];
  var _targetAudience_decorators;
  var _targetAudience_initializers = [];
  var _targetAudience_extraInitializers = [];
  var _audiencePercentage_decorators;
  var _audiencePercentage_initializers = [];
  var _audiencePercentage_extraInitializers = [];
  var _startDate_decorators;
  var _startDate_initializers = [];
  var _startDate_extraInitializers = [];
  var _endDate_decorators;
  var _endDate_initializers = [];
  var _endDate_extraInitializers = [];
  var _hypothesis_decorators;
  var _hypothesis_initializers = [];
  var _hypothesis_extraInitializers = [];
  var _primaryMetric_decorators;
  var _primaryMetric_initializers = [];
  var _primaryMetric_extraInitializers = [];
  var _secondaryMetrics_decorators;
  var _secondaryMetrics_initializers = [];
  var _secondaryMetrics_extraInitializers = [];
  var _hasWinner_decorators;
  var _hasWinner_initializers = [];
  var _hasWinner_extraInitializers = [];
  var _winningVariantId_decorators;
  var _winningVariantId_initializers = [];
  var _winningVariantId_extraInitializers = [];
  var _segmentation_decorators;
  var _segmentation_initializers = [];
  var _segmentation_extraInitializers = [];
  var _variants_decorators;
  var _variants_initializers = [];
  var _variants_extraInitializers = [];
  var _createdAt_decorators;
  var _createdAt_initializers = [];
  var _createdAt_extraInitializers = [];
  var _updatedAt_decorators;
  var _updatedAt_initializers = [];
  var _updatedAt_extraInitializers = [];
  var Experiment = (_classThis = /** @class */ (function () {
    function Experiment_1() {
      this.id = __runInitializers(this, _id_initializers, void 0);
      this.name =
        (__runInitializers(this, _id_extraInitializers),
        __runInitializers(this, _name_initializers, void 0));
      this.description =
        (__runInitializers(this, _name_extraInitializers),
        __runInitializers(this, _description_initializers, void 0));
      this.status =
        (__runInitializers(this, _description_extraInitializers),
        __runInitializers(this, _status_initializers, void 0));
      this.type =
        (__runInitializers(this, _status_extraInitializers),
        __runInitializers(this, _type_initializers, void 0));
      this.targetAudience =
        (__runInitializers(this, _type_extraInitializers),
        __runInitializers(this, _targetAudience_initializers, void 0));
      this.audiencePercentage =
        (__runInitializers(this, _targetAudience_extraInitializers),
        __runInitializers(this, _audiencePercentage_initializers, void 0));
      this.startDate =
        (__runInitializers(this, _audiencePercentage_extraInitializers),
        __runInitializers(this, _startDate_initializers, void 0));
      this.endDate =
        (__runInitializers(this, _startDate_extraInitializers),
        __runInitializers(this, _endDate_initializers, void 0));
      this.hypothesis =
        (__runInitializers(this, _endDate_extraInitializers),
        __runInitializers(this, _hypothesis_initializers, void 0));
      this.primaryMetric =
        (__runInitializers(this, _hypothesis_extraInitializers),
        __runInitializers(this, _primaryMetric_initializers, void 0));
      this.secondaryMetrics =
        (__runInitializers(this, _primaryMetric_extraInitializers),
        __runInitializers(this, _secondaryMetrics_initializers, void 0));
      this.hasWinner =
        (__runInitializers(this, _secondaryMetrics_extraInitializers),
        __runInitializers(this, _hasWinner_initializers, void 0));
      this.winningVariantId =
        (__runInitializers(this, _hasWinner_extraInitializers),
        __runInitializers(this, _winningVariantId_initializers, void 0));
      this.segmentation =
        (__runInitializers(this, _winningVariantId_extraInitializers),
        __runInitializers(this, _segmentation_initializers, void 0));
      this.variants =
        (__runInitializers(this, _segmentation_extraInitializers),
        __runInitializers(this, _variants_initializers, void 0));
      this.createdAt =
        (__runInitializers(this, _variants_extraInitializers),
        __runInitializers(this, _createdAt_initializers, void 0));
      this.updatedAt =
        (__runInitializers(this, _createdAt_extraInitializers),
        __runInitializers(this, _updatedAt_initializers, void 0));
      __runInitializers(this, _updatedAt_extraInitializers);
    }
    return Experiment_1;
  })());
  __setFunctionName(_classThis, 'Experiment');
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
    _status_decorators = [
      (0, graphql_1.Field)(function () {
        return ExperimentStatus;
      }),
      (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExperimentStatus,
        default: ExperimentStatus.DRAFT,
      }),
    ];
    _type_decorators = [
      (0, graphql_1.Field)(function () {
        return String;
      }),
      (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExperimentType,
      }),
    ];
    _targetAudience_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _audiencePercentage_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.Int;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _startDate_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.GraphQLISODateTime;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _endDate_decorators = [
      (0, graphql_1.Field)(
        function () {
          return graphql_1.GraphQLISODateTime;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _hypothesis_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _primaryMetric_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _secondaryMetrics_decorators = [
      (0, graphql_1.Field)(
        function () {
          return [String];
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)('simple-array', { nullable: true }),
    ];
    _hasWinner_decorators = [
      (0, graphql_1.Field)(function () {
        return Boolean;
      }),
      (0, typeorm_1.Column)({ default: false }),
    ];
    _winningVariantId_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ nullable: true }),
    ];
    _segmentation_decorators = [
      (0, graphql_1.Field)(
        function () {
          return String;
        },
        { nullable: true },
      ),
      (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    ];
    _variants_decorators = [
      (0, graphql_1.Field)(
        function () {
          return [experiment_variant_entity_1.ExperimentVariant];
        },
        { nullable: true },
      ),
      (0, typeorm_1.OneToMany)(
        function () {
          return experiment_variant_entity_1.ExperimentVariant;
        },
        function (variant) {
          return variant.experiment;
        },
        {
          cascade: true,
          eager: true,
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
      _status_decorators,
      {
        kind: 'field',
        name: 'status',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'status' in obj;
          },
          get: function (obj) {
            return obj.status;
          },
          set: function (obj, value) {
            obj.status = value;
          },
        },
        metadata: _metadata,
      },
      _status_initializers,
      _status_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _type_decorators,
      {
        kind: 'field',
        name: 'type',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'type' in obj;
          },
          get: function (obj) {
            return obj.type;
          },
          set: function (obj, value) {
            obj.type = value;
          },
        },
        metadata: _metadata,
      },
      _type_initializers,
      _type_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _targetAudience_decorators,
      {
        kind: 'field',
        name: 'targetAudience',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'targetAudience' in obj;
          },
          get: function (obj) {
            return obj.targetAudience;
          },
          set: function (obj, value) {
            obj.targetAudience = value;
          },
        },
        metadata: _metadata,
      },
      _targetAudience_initializers,
      _targetAudience_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _audiencePercentage_decorators,
      {
        kind: 'field',
        name: 'audiencePercentage',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'audiencePercentage' in obj;
          },
          get: function (obj) {
            return obj.audiencePercentage;
          },
          set: function (obj, value) {
            obj.audiencePercentage = value;
          },
        },
        metadata: _metadata,
      },
      _audiencePercentage_initializers,
      _audiencePercentage_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _startDate_decorators,
      {
        kind: 'field',
        name: 'startDate',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'startDate' in obj;
          },
          get: function (obj) {
            return obj.startDate;
          },
          set: function (obj, value) {
            obj.startDate = value;
          },
        },
        metadata: _metadata,
      },
      _startDate_initializers,
      _startDate_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _endDate_decorators,
      {
        kind: 'field',
        name: 'endDate',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'endDate' in obj;
          },
          get: function (obj) {
            return obj.endDate;
          },
          set: function (obj, value) {
            obj.endDate = value;
          },
        },
        metadata: _metadata,
      },
      _endDate_initializers,
      _endDate_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _hypothesis_decorators,
      {
        kind: 'field',
        name: 'hypothesis',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'hypothesis' in obj;
          },
          get: function (obj) {
            return obj.hypothesis;
          },
          set: function (obj, value) {
            obj.hypothesis = value;
          },
        },
        metadata: _metadata,
      },
      _hypothesis_initializers,
      _hypothesis_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _primaryMetric_decorators,
      {
        kind: 'field',
        name: 'primaryMetric',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'primaryMetric' in obj;
          },
          get: function (obj) {
            return obj.primaryMetric;
          },
          set: function (obj, value) {
            obj.primaryMetric = value;
          },
        },
        metadata: _metadata,
      },
      _primaryMetric_initializers,
      _primaryMetric_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _secondaryMetrics_decorators,
      {
        kind: 'field',
        name: 'secondaryMetrics',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'secondaryMetrics' in obj;
          },
          get: function (obj) {
            return obj.secondaryMetrics;
          },
          set: function (obj, value) {
            obj.secondaryMetrics = value;
          },
        },
        metadata: _metadata,
      },
      _secondaryMetrics_initializers,
      _secondaryMetrics_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _hasWinner_decorators,
      {
        kind: 'field',
        name: 'hasWinner',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'hasWinner' in obj;
          },
          get: function (obj) {
            return obj.hasWinner;
          },
          set: function (obj, value) {
            obj.hasWinner = value;
          },
        },
        metadata: _metadata,
      },
      _hasWinner_initializers,
      _hasWinner_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _winningVariantId_decorators,
      {
        kind: 'field',
        name: 'winningVariantId',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'winningVariantId' in obj;
          },
          get: function (obj) {
            return obj.winningVariantId;
          },
          set: function (obj, value) {
            obj.winningVariantId = value;
          },
        },
        metadata: _metadata,
      },
      _winningVariantId_initializers,
      _winningVariantId_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _segmentation_decorators,
      {
        kind: 'field',
        name: 'segmentation',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'segmentation' in obj;
          },
          get: function (obj) {
            return obj.segmentation;
          },
          set: function (obj, value) {
            obj.segmentation = value;
          },
        },
        metadata: _metadata,
      },
      _segmentation_initializers,
      _segmentation_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _variants_decorators,
      {
        kind: 'field',
        name: 'variants',
        static: false,
        private: false,
        access: {
          has: function (obj) {
            return 'variants' in obj;
          },
          get: function (obj) {
            return obj.variants;
          },
          set: function (obj, value) {
            obj.variants = value;
          },
        },
        metadata: _metadata,
      },
      _variants_initializers,
      _variants_extraInitializers,
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
    Experiment = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (Experiment = _classThis);
})();
exports.Experiment = Experiment;
