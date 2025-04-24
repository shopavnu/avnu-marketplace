"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
var typeorm_1 = require("typeorm");
var graphql_1 = require("@nestjs/graphql");
var Product = function () {
    var _classDecorators = [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _compareAtPrice_decorators;
    var _compareAtPrice_initializers = [];
    var _compareAtPrice_extraInitializers = [];
    var _images_decorators;
    var _images_initializers = [];
    var _images_extraInitializers = [];
    var _thumbnail_decorators;
    var _thumbnail_initializers = [];
    var _thumbnail_extraInitializers = [];
    var _categories_decorators;
    var _categories_initializers = [];
    var _categories_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _merchantId_decorators;
    var _merchantId_initializers = [];
    var _merchantId_extraInitializers = [];
    var _brandName_decorators;
    var _brandName_initializers = [];
    var _brandName_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _inStock_decorators;
    var _inStock_initializers = [];
    var _inStock_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _values_decorators;
    var _values_initializers = [];
    var _values_extraInitializers = [];
    var _externalId_decorators;
    var _externalId_initializers = [];
    var _externalId_extraInitializers = [];
    var _externalSource_decorators;
    var _externalSource_initializers = [];
    var _externalSource_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _get_isOnSale_decorators;
    var _get_discountPercentage_decorators;
    var Product = _classThis = /** @class */ (function () {
        function Product_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.title = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _title_initializers, void 0));
            this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.price = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _price_initializers, void 0));
            this.compareAtPrice = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _compareAtPrice_initializers, void 0));
            this.images = (__runInitializers(this, _compareAtPrice_extraInitializers), __runInitializers(this, _images_initializers, void 0));
            this.thumbnail = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _thumbnail_initializers, void 0));
            this.categories = (__runInitializers(this, _thumbnail_extraInitializers), __runInitializers(this, _categories_initializers, void 0));
            this.tags = (__runInitializers(this, _categories_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
            this.merchantId = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _merchantId_initializers, void 0));
            this.brandName = (__runInitializers(this, _merchantId_extraInitializers), __runInitializers(this, _brandName_initializers, void 0));
            this.isActive = (__runInitializers(this, _brandName_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.inStock = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _inStock_initializers, void 0));
            this.quantity = (__runInitializers(this, _inStock_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
            this.values = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _values_initializers, void 0));
            this.externalId = (__runInitializers(this, _values_extraInitializers), __runInitializers(this, _externalId_initializers, void 0));
            this.externalSource = (__runInitializers(this, _externalId_extraInitializers), __runInitializers(this, _externalSource_initializers, void 0));
            this.createdAt = (__runInitializers(this, _externalSource_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        Object.defineProperty(Product_1.prototype, "isOnSale", {
            // Virtual fields
            get: function () {
                return this.compareAtPrice !== null && this.price < this.compareAtPrice;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Product_1.prototype, "discountPercentage", {
            get: function () {
                if (!this.isOnSale || !this.compareAtPrice)
                    return null;
                return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
            },
            enumerable: false,
            configurable: true
        });
        return Product_1;
    }());
    __setFunctionName(_classThis, "Product");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, graphql_1.Field)(function () { return graphql_1.ID; }), (0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _title_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
        _description_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)('text')];
        _price_decorators = [(0, graphql_1.Field)(function () { return graphql_1.Float; }), (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _compareAtPrice_decorators = [(0, graphql_1.Field)(function () { return graphql_1.Float; }, { nullable: true }), (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true })];
        _images_decorators = [(0, graphql_1.Field)(function () { return [String]; }), (0, typeorm_1.Column)('simple-array')];
        _thumbnail_decorators = [(0, graphql_1.Field)(function () { return String; }, { nullable: true }), (0, typeorm_1.Column)({ nullable: true })];
        _categories_decorators = [(0, graphql_1.Field)(function () { return [String]; }), (0, typeorm_1.Column)('simple-array')];
        _tags_decorators = [(0, graphql_1.Field)(function () { return [String]; }, { nullable: true }), (0, typeorm_1.Column)('simple-array', { nullable: true })];
        _merchantId_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
        _brandName_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
        _isActive_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)({ default: true })];
        _inStock_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)({ default: true })];
        _quantity_decorators = [(0, graphql_1.Field)(function () { return graphql_1.Int; }, { nullable: true }), (0, typeorm_1.Column)('int', { nullable: true })];
        _values_decorators = [(0, graphql_1.Field)(function () { return [String]; }, { nullable: true }), (0, typeorm_1.Column)('simple-array', { nullable: true })];
        _externalId_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
        _externalSource_decorators = [(0, graphql_1.Field)(), (0, typeorm_1.Column)()];
        _createdAt_decorators = [(0, graphql_1.Field)(function () { return graphql_1.GraphQLISODateTime; }), (0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, graphql_1.Field)(function () { return graphql_1.GraphQLISODateTime; }), (0, typeorm_1.UpdateDateColumn)()];
        _get_isOnSale_decorators = [(0, graphql_1.Field)(function () { return Boolean; })];
        _get_discountPercentage_decorators = [(0, graphql_1.Field)(function () { return graphql_1.Float; }, { nullable: true })];
        __esDecorate(_classThis, null, _get_isOnSale_decorators, { kind: "getter", name: "isOnSale", static: false, private: false, access: { has: function (obj) { return "isOnSale" in obj; }, get: function (obj) { return obj.isOnSale; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _get_discountPercentage_decorators, { kind: "getter", name: "discountPercentage", static: false, private: false, access: { has: function (obj) { return "discountPercentage" in obj; }, get: function (obj) { return obj.discountPercentage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
        __esDecorate(null, null, _compareAtPrice_decorators, { kind: "field", name: "compareAtPrice", static: false, private: false, access: { has: function (obj) { return "compareAtPrice" in obj; }, get: function (obj) { return obj.compareAtPrice; }, set: function (obj, value) { obj.compareAtPrice = value; } }, metadata: _metadata }, _compareAtPrice_initializers, _compareAtPrice_extraInitializers);
        __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: function (obj) { return "images" in obj; }, get: function (obj) { return obj.images; }, set: function (obj, value) { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
        __esDecorate(null, null, _thumbnail_decorators, { kind: "field", name: "thumbnail", static: false, private: false, access: { has: function (obj) { return "thumbnail" in obj; }, get: function (obj) { return obj.thumbnail; }, set: function (obj, value) { obj.thumbnail = value; } }, metadata: _metadata }, _thumbnail_initializers, _thumbnail_extraInitializers);
        __esDecorate(null, null, _categories_decorators, { kind: "field", name: "categories", static: false, private: false, access: { has: function (obj) { return "categories" in obj; }, get: function (obj) { return obj.categories; }, set: function (obj, value) { obj.categories = value; } }, metadata: _metadata }, _categories_initializers, _categories_extraInitializers);
        __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
        __esDecorate(null, null, _merchantId_decorators, { kind: "field", name: "merchantId", static: false, private: false, access: { has: function (obj) { return "merchantId" in obj; }, get: function (obj) { return obj.merchantId; }, set: function (obj, value) { obj.merchantId = value; } }, metadata: _metadata }, _merchantId_initializers, _merchantId_extraInitializers);
        __esDecorate(null, null, _brandName_decorators, { kind: "field", name: "brandName", static: false, private: false, access: { has: function (obj) { return "brandName" in obj; }, get: function (obj) { return obj.brandName; }, set: function (obj, value) { obj.brandName = value; } }, metadata: _metadata }, _brandName_initializers, _brandName_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _inStock_decorators, { kind: "field", name: "inStock", static: false, private: false, access: { has: function (obj) { return "inStock" in obj; }, get: function (obj) { return obj.inStock; }, set: function (obj, value) { obj.inStock = value; } }, metadata: _metadata }, _inStock_initializers, _inStock_extraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
        __esDecorate(null, null, _values_decorators, { kind: "field", name: "values", static: false, private: false, access: { has: function (obj) { return "values" in obj; }, get: function (obj) { return obj.values; }, set: function (obj, value) { obj.values = value; } }, metadata: _metadata }, _values_initializers, _values_extraInitializers);
        __esDecorate(null, null, _externalId_decorators, { kind: "field", name: "externalId", static: false, private: false, access: { has: function (obj) { return "externalId" in obj; }, get: function (obj) { return obj.externalId; }, set: function (obj, value) { obj.externalId = value; } }, metadata: _metadata }, _externalId_initializers, _externalId_extraInitializers);
        __esDecorate(null, null, _externalSource_decorators, { kind: "field", name: "externalSource", static: false, private: false, access: { has: function (obj) { return "externalSource" in obj; }, get: function (obj) { return obj.externalSource; }, set: function (obj, value) { obj.externalSource = value; } }, metadata: _metadata }, _externalSource_initializers, _externalSource_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Product = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Product = _classThis;
}();
exports.Product = Product;
