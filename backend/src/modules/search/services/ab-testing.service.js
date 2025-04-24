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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ABTestingService = void 0;
var common_1 = require("@nestjs/common");
var search_relevance_service_1 = require("./search-relevance.service");
/**
 * Service for managing A/B testing of search relevance algorithms
 */
var ABTestingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ABTestingService = _classThis = /** @class */ (function () {
        function ABTestingService_1(configService, googleAnalyticsService) {
            this.configService = configService;
            this.googleAnalyticsService = googleAnalyticsService;
            this.logger = new common_1.Logger(ABTestingService.name);
            this.activeTests = new Map();
            this.userAssignments = new Map();
            this.initializeActiveTests();
        }
        /**
         * Initialize active tests from configuration
         */
        ABTestingService_1.prototype.initializeActiveTests = function () {
            // In a real implementation, these would be loaded from a database
            var currentDate = new Date();
            var basicVsIntent = {
                id: 'search-relevance-test-001',
                name: 'Basic vs. Intent-Based Relevance',
                description: 'Testing standard BM25 algorithm against intent-based boosting',
                variants: [
                    {
                        id: 'control',
                        algorithm: search_relevance_service_1.RelevanceAlgorithm.STANDARD,
                        weight: 50
                    },
                    {
                        id: 'intent-boosted',
                        algorithm: search_relevance_service_1.RelevanceAlgorithm.INTENT_BOOSTED,
                        weight: 50
                    }
                ],
                startDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                isActive: true,
                analyticsEventName: 'search_relevance_test_001'
            };
            var userPreferenceTest = {
                id: 'user-preference-test-001',
                name: 'User Preference Boosting',
                description: 'Testing effectiveness of user preference-based boosting',
                variants: [
                    {
                        id: 'control',
                        algorithm: search_relevance_service_1.RelevanceAlgorithm.STANDARD,
                        weight: 33
                    },
                    {
                        id: 'preference-light',
                        algorithm: search_relevance_service_1.RelevanceAlgorithm.USER_PREFERENCE,
                        weight: 33,
                        params: {
                            preferenceWeight: 0.5
                        }
                    },
                    {
                        id: 'preference-heavy',
                        algorithm: search_relevance_service_1.RelevanceAlgorithm.USER_PREFERENCE,
                        weight: 34,
                        params: {
                            preferenceWeight: 1.5
                        }
                    }
                ],
                startDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                endDate: new Date(currentDate.getTime() + 27 * 24 * 60 * 60 * 1000), // 27 days from now
                isActive: true,
                analyticsEventName: 'user_preference_test_001'
            };
            this.activeTests.set(basicVsIntent.id, basicVsIntent);
            this.activeTests.set(userPreferenceTest.id, userPreferenceTest);
            this.logger.log("Initialized ".concat(this.activeTests.size, " active A/B tests"));
        };
        /**
         * Get all active A/B tests
         */
        ABTestingService_1.prototype.getActiveTests = function () {
            return Array.from(this.activeTests.values())
                .filter(function (test) { return test.isActive &&
                test.startDate <= new Date() &&
                (!test.endDate || test.endDate >= new Date()); });
        };
        /**
         * Get a specific A/B test by ID
         */
        ABTestingService_1.prototype.getTestById = function (testId) {
            return this.activeTests.get(testId);
        };
        /**
         * Assign a user to a variant for a specific test
         * @param testId The test ID
         * @param userId The user ID
         * @param clientId The client ID for analytics
         * @returns The assigned variant or null if test not found
         */
        ABTestingService_1.prototype.assignUserToVariant = function (testId, userId, clientId) {
            var test = this.activeTests.get(testId);
            if (!test || !test.isActive) {
                return null;
            }
            // Check if user is already assigned to a variant
            if (!this.userAssignments.has(userId)) {
                this.userAssignments.set(userId, new Map());
            }
            var userTestAssignments = this.userAssignments.get(userId);
            if (userTestAssignments.has(testId)) {
                var variantId_1 = userTestAssignments.get(testId);
                var variant_1 = test.variants.find(function (v) { return v.id === variantId_1; });
                if (variant_1) {
                    return {
                        variantId: variant_1.id,
                        algorithm: variant_1.algorithm,
                        params: variant_1.params
                    };
                }
            }
            // Assign user to a variant based on weights
            var variant = this.selectVariantByWeight(test.variants);
            userTestAssignments.set(testId, variant.id);
            // Track the assignment in analytics
            this.trackVariantAssignment(clientId, test, variant.id, userId);
            return {
                variantId: variant.id,
                algorithm: variant.algorithm,
                params: variant.params
            };
        };
        /**
         * Select a variant based on the defined weights
         */
        ABTestingService_1.prototype.selectVariantByWeight = function (variants) {
            var totalWeight = variants.reduce(function (sum, variant) { return sum + variant.weight; }, 0);
            var randomValue = Math.random() * totalWeight;
            for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
                var variant = variants_1[_i];
                randomValue -= variant.weight;
                if (randomValue <= 0) {
                    return variant;
                }
            }
            // Fallback to first variant
            return variants[0];
        };
        /**
         * Track variant assignment in Google Analytics
         */
        ABTestingService_1.prototype.trackVariantAssignment = function (clientId, test, variantId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.googleAnalyticsService.trackABTestImpression(clientId, test.id, variantId, {
                                    test_name: test.name,
                                    test_type: 'search_relevance'
                                }, userId)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error("Failed to track variant assignment: ".concat(error_1.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Track search results for A/B testing
         */
        ABTestingService_1.prototype.trackSearchResults = function (clientId, testId, variantId, searchTerm, resultCount, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var test, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            test = this.activeTests.get(testId);
                            if (!test)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.googleAnalyticsService.trackSearch(clientId, searchTerm, resultCount, {
                                    testId: testId,
                                    variantId: variantId
                                }, userId)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            this.logger.error("Failed to track search results: ".concat(error_2.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Track search result click for A/B testing
         */
        ABTestingService_1.prototype.trackSearchClick = function (clientId, testId, variantId, searchTerm, productId, position, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var test, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            test = this.activeTests.get(testId);
                            if (!test)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.googleAnalyticsService.trackSearchClick(clientId, searchTerm, productId, position, {
                                    testId: testId,
                                    variantId: variantId
                                }, userId)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_3 = _a.sent();
                            this.logger.error("Failed to track search click: ".concat(error_3.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return ABTestingService_1;
    }());
    __setFunctionName(_classThis, "ABTestingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ABTestingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ABTestingService = _classThis;
}();
exports.ABTestingService = ABTestingService;
