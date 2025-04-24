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
exports.UserPreferenceService = exports.UserInteractionType = void 0;
var common_1 = require("@nestjs/common");
/**
 * User interaction event types for preference learning
 */
var UserInteractionType;
(function (UserInteractionType) {
    UserInteractionType["SEARCH"] = "search";
    UserInteractionType["VIEW_PRODUCT"] = "view_product";
    UserInteractionType["ADD_TO_CART"] = "add_to_cart";
    UserInteractionType["PURCHASE"] = "purchase";
    UserInteractionType["FILTER_APPLY"] = "filter_apply";
    UserInteractionType["SORT_APPLY"] = "sort_apply";
    UserInteractionType["CLICK_CATEGORY"] = "click_category";
    UserInteractionType["CLICK_BRAND"] = "click_brand";
})(UserInteractionType || (exports.UserInteractionType = UserInteractionType = {}));
/**
 * Service for managing and applying user preferences in search
 */
var UserPreferenceService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserPreferenceService = _classThis = /** @class */ (function () {
        function UserPreferenceService_1(configService, elasticsearchService) {
            this.configService = configService;
            this.elasticsearchService = elasticsearchService;
            this.logger = new common_1.Logger(UserPreferenceService.name);
            this.preferencesCache = new Map();
            this.preferencesIndex = this.configService.get('ELASTICSEARCH_USER_PREFERENCES_INDEX', 'user_preferences');
            this.interactionsIndex = this.configService.get('ELASTICSEARCH_USER_INTERACTIONS_INDEX', 'user_interactions');
            this.cacheTimeMs = this.configService.get('USER_PREFERENCES_CACHE_TIME_MS', 30 * 60 * 1000); // 30 minutes
            this.initializeIndices();
        }
        /**
         * Initialize Elasticsearch indices for user preferences and interactions
         */
        UserPreferenceService_1.prototype.initializeIndices = function () {
            return __awaiter(this, void 0, void 0, function () {
                var preferencesExists, interactionsExists, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 7, , 8]);
                            return [4 /*yield*/, this.indexExists(this.preferencesIndex)];
                        case 1:
                            preferencesExists = _a.sent();
                            if (!!preferencesExists) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.createPreferencesIndex()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.indexExists(this.interactionsIndex)];
                        case 4:
                            interactionsExists = _a.sent();
                            if (!!interactionsExists) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.createInteractionsIndex()];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            this.logger.log('User preference indices initialized');
                            return [3 /*break*/, 8];
                        case 7:
                            error_1 = _a.sent();
                            this.logger.error("Failed to initialize user preference indices: ".concat(error_1.message));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Check if an index exists in Elasticsearch
         */
        UserPreferenceService_1.prototype.indexExists = function (indexName) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.indices.exists({
                                    index: indexName
                                })];
                        case 1:
                            response = _a.sent();
                            // Handle both Elasticsearch 7.x and 8.x response formats
                            if (typeof response === 'boolean') {
                                return [2 /*return*/, response];
                            }
                            // Using any type to safely access statusCode
                            return [2 /*return*/, (response === null || response === void 0 ? void 0 : response.statusCode) === 200];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error("Error checking if index ".concat(indexName, " exists: ").concat(error_2.message));
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Create the preferences index with appropriate mappings
         */
        UserPreferenceService_1.prototype.createPreferencesIndex = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.indices.create({
                                    index: this.preferencesIndex,
                                    body: {
                                        mappings: {
                                            properties: {
                                                userId: { type: 'keyword' },
                                                categories: { type: 'object' },
                                                brands: { type: 'object' },
                                                priceRanges: {
                                                    type: 'nested',
                                                    properties: {
                                                        min: { type: 'float' },
                                                        max: { type: 'float' },
                                                        weight: { type: 'float' }
                                                    }
                                                },
                                                values: { type: 'object' },
                                                recentSearches: {
                                                    type: 'nested',
                                                    properties: {
                                                        term: { type: 'text' },
                                                        timestamp: { type: 'long' }
                                                    }
                                                },
                                                recentlyViewedProducts: {
                                                    type: 'nested',
                                                    properties: {
                                                        productId: { type: 'keyword' },
                                                        timestamp: { type: 'long' }
                                                    }
                                                },
                                                purchaseHistory: {
                                                    type: 'nested',
                                                    properties: {
                                                        productId: { type: 'keyword' },
                                                        timestamp: { type: 'long' }
                                                    }
                                                },
                                                lastUpdated: { type: 'long' }
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            _a.sent();
                            this.logger.log("Created preferences index: ".concat(this.preferencesIndex));
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error("Failed to create preferences index: ".concat(error_3.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Create the interactions index with appropriate mappings
         */
        UserPreferenceService_1.prototype.createInteractionsIndex = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.indices.create({
                                    index: this.interactionsIndex,
                                    body: {
                                        mappings: {
                                            properties: {
                                                userId: { type: 'keyword' },
                                                type: { type: 'keyword' },
                                                timestamp: { type: 'long' },
                                                data: { type: 'object' }
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            _a.sent();
                            this.logger.log("Created interactions index: ".concat(this.interactionsIndex));
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error("Failed to create interactions index: ".concat(error_4.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get user preferences for a specific user
         * @param userId The user ID
         * @returns The user preferences or null if not found
         */
        UserPreferenceService_1.prototype.getUserPreferences = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var cachedPreferences, now, response, hits, anyResponse, preferences, defaultPreferences, error_5;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cachedPreferences = this.preferencesCache.get(userId);
                            now = Date.now();
                            if (cachedPreferences && (now - cachedPreferences.lastUpdated) < this.cacheTimeMs) {
                                return [2 /*return*/, cachedPreferences];
                            }
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, this.elasticsearchService.search({
                                    index: this.preferencesIndex,
                                    body: {
                                        query: {
                                            term: {
                                                userId: userId
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            response = _c.sent();
                            hits = void 0;
                            if ('hits' in response) {
                                hits = response.hits;
                            }
                            else {
                                anyResponse = response;
                                hits = (_a = anyResponse.body) === null || _a === void 0 ? void 0 : _a.hits;
                            }
                            if (((_b = hits === null || hits === void 0 ? void 0 : hits.hits) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                                preferences = hits.hits[0]._source;
                                this.preferencesCache.set(userId, preferences);
                                return [2 /*return*/, preferences];
                            }
                            defaultPreferences = this.createDefaultPreferences(userId);
                            return [4 /*yield*/, this.saveUserPreferences(defaultPreferences)];
                        case 3:
                            _c.sent();
                            this.preferencesCache.set(userId, defaultPreferences);
                            return [2 /*return*/, defaultPreferences];
                        case 4:
                            error_5 = _c.sent();
                            this.logger.error("Failed to get user preferences for ".concat(userId, ": ").concat(error_5.message));
                            return [2 /*return*/, null];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Create default preferences for a new user
         */
        UserPreferenceService_1.prototype.createDefaultPreferences = function (userId) {
            return {
                userId: userId,
                categories: {},
                brands: {},
                priceRanges: [],
                values: {},
                recentSearches: [],
                recentlyViewedProducts: [],
                purchaseHistory: [],
                lastUpdated: Date.now()
            };
        };
        /**
         * Save user preferences to Elasticsearch
         */
        UserPreferenceService_1.prototype.saveUserPreferences = function (preferences) {
            return __awaiter(this, void 0, void 0, function () {
                var exists, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            // Update lastUpdated timestamp
                            preferences.lastUpdated = Date.now();
                            return [4 /*yield*/, this.userPreferencesExist(preferences.userId)];
                        case 1:
                            exists = _a.sent();
                            if (!exists) return [3 /*break*/, 3];
                            // Update existing document
                            return [4 /*yield*/, this.elasticsearchService.update({
                                    index: this.preferencesIndex,
                                    id: preferences.userId,
                                    body: {
                                        doc: preferences
                                    }
                                })];
                        case 2:
                            // Update existing document
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: 
                        // Create new document
                        return [4 /*yield*/, this.elasticsearchService.index({
                                index: this.preferencesIndex,
                                id: preferences.userId,
                                body: preferences
                            })];
                        case 4:
                            // Create new document
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            // Update cache
                            this.preferencesCache.set(preferences.userId, preferences);
                            return [2 /*return*/, true];
                        case 6:
                            error_6 = _a.sent();
                            this.logger.error("Failed to save user preferences for ".concat(preferences.userId, ": ").concat(error_6.message));
                            return [2 /*return*/, false];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Check if user preferences exist in Elasticsearch
         */
        UserPreferenceService_1.prototype.userPreferencesExist = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.elasticsearchService.exists({
                                    index: this.preferencesIndex,
                                    id: userId
                                })];
                        case 1:
                            response = _a.sent();
                            // Handle both Elasticsearch 7.x and 8.x response formats
                            if (typeof response === 'boolean') {
                                return [2 /*return*/, response];
                            }
                            // Using any type to safely access statusCode
                            return [2 /*return*/, (response === null || response === void 0 ? void 0 : response.statusCode) === 200];
                        case 2:
                            error_7 = _a.sent();
                            this.logger.error("Error checking if user preferences exist for ".concat(userId, ": ").concat(error_7.message));
                            return [2 /*return*/, false];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Record a user interaction and update preferences
         */
        UserPreferenceService_1.prototype.recordInteraction = function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            // Save interaction to Elasticsearch
                            return [4 /*yield*/, this.elasticsearchService.index({
                                    index: this.interactionsIndex,
                                    body: interaction
                                })];
                        case 1:
                            // Save interaction to Elasticsearch
                            _a.sent();
                            // Update user preferences based on interaction
                            return [4 /*yield*/, this.updatePreferencesFromInteraction(interaction)];
                        case 2:
                            // Update user preferences based on interaction
                            _a.sent();
                            return [2 /*return*/, true];
                        case 3:
                            error_8 = _a.sent();
                            this.logger.error("Failed to record user interaction: ".concat(error_8.message));
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update user preferences based on an interaction
         */
        UserPreferenceService_1.prototype.updatePreferencesFromInteraction = function (interaction) {
            return __awaiter(this, void 0, void 0, function () {
                var preferences, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.getUserPreferences(interaction.userId)];
                        case 1:
                            preferences = _a.sent();
                            if (!preferences)
                                return [2 /*return*/];
                            switch (interaction.type) {
                                case UserInteractionType.SEARCH:
                                    this.updateFromSearch(preferences, interaction.data);
                                    break;
                                case UserInteractionType.VIEW_PRODUCT:
                                    this.updateFromProductView(preferences, interaction.data);
                                    break;
                                case UserInteractionType.ADD_TO_CART:
                                case UserInteractionType.PURCHASE:
                                    this.updateFromPurchaseActivity(preferences, interaction.data, interaction.type);
                                    break;
                                case UserInteractionType.FILTER_APPLY:
                                    this.updateFromFilterApply(preferences, interaction.data);
                                    break;
                                case UserInteractionType.CLICK_CATEGORY:
                                case UserInteractionType.CLICK_BRAND:
                                    this.updateFromCategoryOrBrandClick(preferences, interaction.data, interaction.type);
                                    break;
                            }
                            // Save updated preferences
                            return [4 /*yield*/, this.saveUserPreferences(preferences)];
                        case 2:
                            // Save updated preferences
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_9 = _a.sent();
                            this.logger.error("Failed to update preferences from interaction: ".concat(error_9.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update preferences from search interaction
         */
        UserPreferenceService_1.prototype.updateFromSearch = function (preferences, data) {
            if (!data.searchTerm)
                return;
            // Add to recent searches
            var newSearch = {
                term: data.searchTerm,
                timestamp: Date.now()
            };
            preferences.recentSearches.unshift(newSearch);
            // Keep only the 10 most recent searches
            if (preferences.recentSearches.length > 10) {
                preferences.recentSearches = preferences.recentSearches.slice(0, 10);
            }
            // Update category weights if search was category-specific
            if (data.category) {
                var category = data.category.toLowerCase();
                preferences.categories[category] = (preferences.categories[category] || 0) + 0.2;
            }
            // Update brand weights if search was brand-specific
            if (data.brand) {
                var brand = data.brand.toLowerCase();
                preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.2;
            }
            // Update value weights if search was value-specific
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach(function (value) {
                    var valueLower = value.toLowerCase();
                    preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.2;
                });
            }
        };
        /**
         * Update preferences from product view interaction
         */
        UserPreferenceService_1.prototype.updateFromProductView = function (preferences, data) {
            if (!data.productId)
                return;
            // Add to recently viewed products
            var newView = {
                productId: data.productId,
                timestamp: Date.now()
            };
            // Check if product was already viewed recently
            var existingIndex = preferences.recentlyViewedProducts.findIndex(function (item) { return item.productId === data.productId; });
            if (existingIndex >= 0) {
                // Remove existing entry
                preferences.recentlyViewedProducts.splice(existingIndex, 1);
            }
            // Add to the beginning of the array
            preferences.recentlyViewedProducts.unshift(newView);
            // Keep only the 20 most recently viewed products
            if (preferences.recentlyViewedProducts.length > 20) {
                preferences.recentlyViewedProducts = preferences.recentlyViewedProducts.slice(0, 20);
            }
            // Update category weights
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(function (category) {
                    var categoryLower = category.toLowerCase();
                    preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.1;
                });
            }
            // Update brand weight
            if (data.brand) {
                var brand = data.brand.toLowerCase();
                preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.1;
            }
            // Update value weights
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach(function (value) {
                    var valueLower = value.toLowerCase();
                    preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.1;
                });
            }
            // Update price range preferences
            if (data.price && typeof data.price === 'number') {
                this.updatePriceRangePreference(preferences, data.price, 0.1);
            }
        };
        /**
         * Update preferences from purchase activity (add to cart or purchase)
         */
        UserPreferenceService_1.prototype.updateFromPurchaseActivity = function (preferences, data, type) {
            if (!data.productId)
                return;
            // Higher weight for actual purchase vs. add to cart
            var weightMultiplier = type === UserInteractionType.PURCHASE ? 0.5 : 0.2;
            // Add to purchase history if it's a purchase
            if (type === UserInteractionType.PURCHASE) {
                var newPurchase = {
                    productId: data.productId,
                    timestamp: Date.now()
                };
                preferences.purchaseHistory.unshift(newPurchase);
                // Keep only the 50 most recent purchases
                if (preferences.purchaseHistory.length > 50) {
                    preferences.purchaseHistory = preferences.purchaseHistory.slice(0, 50);
                }
            }
            // Update category weights
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(function (category) {
                    var categoryLower = category.toLowerCase();
                    preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + weightMultiplier;
                });
            }
            // Update brand weight
            if (data.brand) {
                var brand = data.brand.toLowerCase();
                preferences.brands[brand] = (preferences.brands[brand] || 0) + weightMultiplier;
            }
            // Update value weights
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach(function (value) {
                    var valueLower = value.toLowerCase();
                    preferences.values[valueLower] = (preferences.values[valueLower] || 0) + weightMultiplier;
                });
            }
            // Update price range preferences
            if (data.price && typeof data.price === 'number') {
                this.updatePriceRangePreference(preferences, data.price, weightMultiplier);
            }
        };
        /**
         * Update preferences from filter application
         */
        UserPreferenceService_1.prototype.updateFromFilterApply = function (preferences, data) {
            // Update category preferences
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(function (category) {
                    var categoryLower = category.toLowerCase();
                    preferences.categories[categoryLower] = (preferences.categories[categoryLower] || 0) + 0.15;
                });
            }
            // Update brand preferences
            if (data.brands && Array.isArray(data.brands)) {
                data.brands.forEach(function (brand) {
                    var brandLower = brand.toLowerCase();
                    preferences.brands[brandLower] = (preferences.brands[brandLower] || 0) + 0.15;
                });
            }
            // Update value preferences
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach(function (value) {
                    var valueLower = value.toLowerCase();
                    preferences.values[valueLower] = (preferences.values[valueLower] || 0) + 0.15;
                });
            }
            // Update price range preferences
            if (data.priceMin !== undefined && data.priceMax !== undefined) {
                var existingRangeIndex = preferences.priceRanges.findIndex(function (range) { return range.min === data.priceMin && range.max === data.priceMax; });
                if (existingRangeIndex >= 0) {
                    // Update existing range weight
                    preferences.priceRanges[existingRangeIndex].weight += 0.15;
                }
                else {
                    // Add new price range
                    preferences.priceRanges.push({
                        min: data.priceMin,
                        max: data.priceMax,
                        weight: 0.15
                    });
                    // Sort by weight descending
                    preferences.priceRanges.sort(function (a, b) { return b.weight - a.weight; });
                    // Keep only top 5 price ranges
                    if (preferences.priceRanges.length > 5) {
                        preferences.priceRanges = preferences.priceRanges.slice(0, 5);
                    }
                }
            }
        };
        /**
         * Update preferences from category or brand click
         */
        UserPreferenceService_1.prototype.updateFromCategoryOrBrandClick = function (preferences, data, type) {
            if (type === UserInteractionType.CLICK_CATEGORY && data.category) {
                var category = data.category.toLowerCase();
                preferences.categories[category] = (preferences.categories[category] || 0) + 0.25;
            }
            else if (type === UserInteractionType.CLICK_BRAND && data.brand) {
                var brand = data.brand.toLowerCase();
                preferences.brands[brand] = (preferences.brands[brand] || 0) + 0.25;
            }
        };
        /**
         * Update price range preference
         */
        UserPreferenceService_1.prototype.updatePriceRangePreference = function (preferences, price, weight) {
            // Define standard price ranges
            var standardRanges = [
                { min: 0, max: 25 },
                { min: 25, max: 50 },
                { min: 50, max: 100 },
                { min: 100, max: 200 },
                { min: 200, max: 500 },
                { min: 500, max: Number.MAX_SAFE_INTEGER }
            ];
            var _loop_1 = function (range) {
                if (price >= range.min && price < range.max) {
                    var existingRangeIndex = preferences.priceRanges.findIndex(function (r) { return r.min === range.min && r.max === range.max; });
                    if (existingRangeIndex >= 0) {
                        // Update existing range weight
                        preferences.priceRanges[existingRangeIndex].weight += weight;
                    }
                    else {
                        // Add new price range
                        preferences.priceRanges.push({
                            min: range.min,
                            max: range.max,
                            weight: weight
                        });
                    }
                    // Sort by weight descending
                    preferences.priceRanges.sort(function (a, b) { return b.weight - a.weight; });
                    // Keep only top 5 price ranges
                    if (preferences.priceRanges.length > 5) {
                        preferences.priceRanges = preferences.priceRanges.slice(0, 5);
                    }
                    return "break";
                }
            };
            // Find which standard range this price falls into
            for (var _i = 0, standardRanges_1 = standardRanges; _i < standardRanges_1.length; _i++) {
                var range = standardRanges_1[_i];
                var state_1 = _loop_1(range);
                if (state_1 === "break")
                    break;
            }
        };
        /**
         * Apply user preferences to a search query
         */
        UserPreferenceService_1.prototype.applyPreferencesToQuery = function (query, preferences, preferenceWeight) {
            if (preferenceWeight === void 0) { preferenceWeight = 1.0; }
            // Create a deep copy of the query to avoid modifying the original
            var enhancedQuery = JSON.parse(JSON.stringify(query));
            // Ensure we have a function_score query
            if (!enhancedQuery.query.function_score) {
                enhancedQuery.query = {
                    function_score: {
                        query: enhancedQuery.query,
                        functions: [],
                        score_mode: 'sum',
                        boost_mode: 'multiply'
                    }
                };
            }
            var functions = enhancedQuery.query.function_score.functions;
            // Apply category preferences
            var topCategories = this.getTopItems(preferences.categories, 5);
            for (var _i = 0, topCategories_1 = topCategories; _i < topCategories_1.length; _i++) {
                var _a = topCategories_1[_i], category = _a[0], weight = _a[1];
                functions.push({
                    filter: {
                        match: {
                            'categories': category
                        }
                    },
                    weight: weight * preferenceWeight
                });
            }
            // Apply brand preferences
            var topBrands = this.getTopItems(preferences.brands, 5);
            for (var _b = 0, topBrands_1 = topBrands; _b < topBrands_1.length; _b++) {
                var _c = topBrands_1[_b], brand = _c[0], weight = _c[1];
                functions.push({
                    filter: {
                        match: {
                            'brand': brand
                        }
                    },
                    weight: weight * preferenceWeight
                });
            }
            // Apply value preferences
            var topValues = this.getTopItems(preferences.values, 5);
            for (var _d = 0, topValues_1 = topValues; _d < topValues_1.length; _d++) {
                var _e = topValues_1[_d], value = _e[0], weight = _e[1];
                functions.push({
                    filter: {
                        match: {
                            'values': value
                        }
                    },
                    weight: weight * preferenceWeight
                });
            }
            // Apply price range preferences
            for (var _f = 0, _g = preferences.priceRanges.slice(0, 3); _f < _g.length; _f++) {
                var range = _g[_f];
                functions.push({
                    filter: {
                        range: {
                            'price': {
                                gte: range.min,
                                lte: range.max
                            }
                        }
                    },
                    weight: range.weight * preferenceWeight
                });
            }
            // Boost recently viewed products
            if (preferences.recentlyViewedProducts.length > 0) {
                var recentProductIds = preferences.recentlyViewedProducts
                    .slice(0, 10)
                    .map(function (item) { return item.productId; });
                functions.push({
                    filter: {
                        terms: {
                            '_id': recentProductIds
                        }
                    },
                    weight: 1.0 * preferenceWeight
                });
            }
            return enhancedQuery;
        };
        /**
         * Get top items from a weighted map
         */
        UserPreferenceService_1.prototype.getTopItems = function (items, limit) {
            return Object.entries(items)
                .sort(function (a, b) { return b[1] - a[1]; })
                .slice(0, limit);
        };
        /**
         * Clear user preferences cache
         */
        UserPreferenceService_1.prototype.clearCache = function () {
            this.preferencesCache.clear();
            this.logger.log('User preferences cache cleared');
        };
        return UserPreferenceService_1;
    }());
    __setFunctionName(_classThis, "UserPreferenceService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserPreferenceService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserPreferenceService = _classThis;
}();
exports.UserPreferenceService = UserPreferenceService;
