"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentResult = exports.ResultType = void 0;
var typeorm_1 = require("typeorm");
var graphql_1 = require("@nestjs/graphql");
var experiment_variant_entity_1 = require("./experiment-variant.entity");
var ResultType;
(function (ResultType) {
    ResultType["IMPRESSION"] = "impression";
    ResultType["CLICK"] = "click";
    ResultType["CONVERSION"] = "conversion";
    ResultType["REVENUE"] = "revenue";
    ResultType["ENGAGEMENT"] = "engagement";
    ResultType["CUSTOM"] = "custom";
})(ResultType || (exports.ResultType = ResultType = {}));
var ExperimentResult = function () {
    var _classDecorators = [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('experiment_results')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _variantId_decorators;
    var _variantId_initializers = [];
    var _variantId_extraInitializers = [];
    var _variant_decorators;
    var _variant_initializers = [];
    var _variant_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _sessionId_decorators;
    var _sessionId_initializers = [];
    var _sessionId_extraInitializers = [];
    var _resultType_decorators;
    var _resultType_initializers = [];
    var _resultType_extraInitializers = [];
    var _value_decorators;
    var _value_initializers = [];
    var _value_extraInitializers = [];
    var _context_decorators;
    var _context_initializers = [];
    var _context_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var _timestamp_decorators;
    var _timestamp_initializers = [];
    var _timestamp_extraInitializers = [];
    var ExperimentResult = _classThis = /** @class */ (function () {
        function ExperimentResult_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.variantId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _variantId_initializers, void 0));
            this.variant = (__runInitializers(this, _variantId_extraInitializers), __runInitializers(this, _variant_initializers, void 0));
            this.userId = (__runInitializers(this, _variant_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.sessionId = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _sessionId_initializers, void 0));
            this.resultType = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _resultType_initializers, void 0));
            this.value = (__runInitializers(this, _resultType_extraInitializers), __runInitializers(this, _value_initializers, void 0));
            this.context = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _context_initializers, void 0));
            this.metadata = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            this.timestamp = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _timestamp_initializers, void 0));
            __runInitializers(this, _timestamp_extraInitializers);
        }
        return ExperimentResult_1;
    }());
    __setFunctionName(_classThis, "ExperimentResult");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, graphql_1.Field)(function () { return graphql_1.ID; }), (0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _variantId_decorators = [(0, graphql_1.Field)(function () { return String; }), (0, typeorm_1.Column)()];
        _variant_decorators = [(0, typeorm_1.ManyToOne)(function () { return experiment_variant_entity_1.ExperimentVariant; }, function (variant) { return variant.results; }), (0, typeorm_1.JoinColumn)({ name: 'variantId' })];
        _userId_decorators = [(0, graphql_1.Field)(function () { return String; }, { nullable: true }), (0, typeorm_1.Column)({ nullable: true })];
        _sessionId_decorators = [(0, graphql_1.Field)(function () { return String; }, { nullable: true }), (0, typeorm_1.Column)({ nullable: true })];
        _resultType_decorators = [(0, graphql_1.Field)(function () { return String; }), (0, typeorm_1.Column)({
                type: 'enum',
                enum: ResultType,
            })];
        _value_decorators = [(0, graphql_1.Field)(function () { return graphql_1.Float; }, { nullable: true }), (0, typeorm_1.Column)({ type: 'float', nullable: true })];
        _context_decorators = [(0, graphql_1.Field)(function () { return String; }, { nullable: true }), (0, typeorm_1.Column)({ nullable: true })];
        _metadata_decorators = [(0, graphql_1.Field)(function () { return String; }, { nullable: true }), (0, typeorm_1.Column)({ type: 'json', nullable: true })];
        _timestamp_decorators = [(0, graphql_1.Field)(function () { return graphql_1.GraphQLISODateTime; }), (0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _variantId_decorators, { kind: "field", name: "variantId", static: false, private: false, access: { has: function (obj) { return "variantId" in obj; }, get: function (obj) { return obj.variantId; }, set: function (obj, value) { obj.variantId = value; } }, metadata: _metadata }, _variantId_initializers, _variantId_extraInitializers);
        __esDecorate(null, null, _variant_decorators, { kind: "field", name: "variant", static: false, private: false, access: { has: function (obj) { return "variant" in obj; }, get: function (obj) { return obj.variant; }, set: function (obj, value) { obj.variant = value; } }, metadata: _metadata }, _variant_initializers, _variant_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: function (obj) { return "sessionId" in obj; }, get: function (obj) { return obj.sessionId; }, set: function (obj, value) { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
        __esDecorate(null, null, _resultType_decorators, { kind: "field", name: "resultType", static: false, private: false, access: { has: function (obj) { return "resultType" in obj; }, get: function (obj) { return obj.resultType; }, set: function (obj, value) { obj.resultType = value; } }, metadata: _metadata }, _resultType_initializers, _resultType_extraInitializers);
        __esDecorate(null, null, _value_decorators, { kind: "field", name: "value", static: false, private: false, access: { has: function (obj) { return "value" in obj; }, get: function (obj) { return obj.value; }, set: function (obj, value) { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
        __esDecorate(null, null, _context_decorators, { kind: "field", name: "context", static: false, private: false, access: { has: function (obj) { return "context" in obj; }, get: function (obj) { return obj.context; }, set: function (obj, value) { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: function (obj) { return "timestamp" in obj; }, get: function (obj) { return obj.timestamp; }, set: function (obj, value) { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExperimentResult = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExperimentResult = _classThis;
}();
exports.ExperimentResult = ExperimentResult;
