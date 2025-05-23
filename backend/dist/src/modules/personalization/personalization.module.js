"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const personalization_service_1 = require("./services/personalization.service");
const user_preferences_service_1 = require("./services/user-preferences.service");
const user_behavior_service_1 = require("./services/user-behavior.service");
const session_service_1 = require("./services/session.service");
const anonymous_user_service_1 = require("./services/anonymous-user.service");
const anonymous_user_analytics_service_1 = require("./services/anonymous-user-analytics.service");
const user_preference_profile_service_1 = require("./services/user-preference-profile.service");
const user_segmentation_service_1 = require("./services/user-segmentation.service");
const personalization_metrics_service_1 = require("./services/personalization-metrics.service");
const ab_testing_service_1 = require("./services/ab-testing.service");
const personalization_controller_1 = require("./personalization.controller");
const session_controller_1 = require("./controllers/session.controller");
const anonymous_user_controller_1 = require("./controllers/anonymous-user.controller");
const user_preference_profile_controller_1 = require("./controllers/user-preference-profile.controller");
const personalization_resolver_1 = require("./personalization.resolver");
const user_preference_profile_resolver_1 = require("./resolvers/user-preference-profile.resolver");
const anonymous_user_analytics_resolver_1 = require("./resolvers/anonymous-user-analytics.resolver");
const user_segmentation_resolver_1 = require("./resolvers/user-segmentation.resolver");
const personalization_metrics_resolver_1 = require("./resolvers/personalization-metrics.resolver");
const ab_testing_resolver_1 = require("./resolvers/ab-testing.resolver");
const user_preferences_entity_1 = require("./entities/user-preferences.entity");
const user_behavior_entity_1 = require("./entities/user-behavior.entity");
const session_entity_1 = require("./entities/session.entity");
const session_interaction_entity_1 = require("./entities/session-interaction.entity");
const user_preference_profile_entity_1 = require("./entities/user-preference-profile.entity");
let PersonalizationModule = class PersonalizationModule {
};
exports.PersonalizationModule = PersonalizationModule;
exports.PersonalizationModule = PersonalizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_preferences_entity_1.UserPreferences,
                user_behavior_entity_1.UserBehavior,
                session_entity_1.SessionEntity,
                session_interaction_entity_1.SessionInteractionEntity,
                user_preference_profile_entity_1.UserPreferenceProfile,
            ]),
        ],
        controllers: [
            personalization_controller_1.PersonalizationController,
            session_controller_1.SessionController,
            user_preference_profile_controller_1.UserPreferenceProfileController,
            anonymous_user_controller_1.AnonymousUserController,
        ],
        providers: [
            personalization_service_1.PersonalizationService,
            user_preferences_service_1.UserPreferencesService,
            user_behavior_service_1.UserBehaviorService,
            session_service_1.SessionService,
            anonymous_user_service_1.AnonymousUserService,
            anonymous_user_analytics_service_1.AnonymousUserAnalyticsService,
            user_preference_profile_service_1.UserPreferenceProfileService,
            user_segmentation_service_1.UserSegmentationService,
            personalization_metrics_service_1.PersonalizationMetricsService,
            ab_testing_service_1.ABTestingService,
            personalization_resolver_1.PersonalizationResolver,
            user_preference_profile_resolver_1.UserPreferenceProfileResolver,
            anonymous_user_analytics_resolver_1.AnonymousUserAnalyticsResolver,
            user_segmentation_resolver_1.UserSegmentationResolver,
            personalization_metrics_resolver_1.PersonalizationMetricsResolver,
            ab_testing_resolver_1.ABTestingResolver,
        ],
        exports: [
            personalization_service_1.PersonalizationService,
            user_preferences_service_1.UserPreferencesService,
            user_behavior_service_1.UserBehaviorService,
            session_service_1.SessionService,
            anonymous_user_service_1.AnonymousUserService,
            anonymous_user_analytics_service_1.AnonymousUserAnalyticsService,
            user_preference_profile_service_1.UserPreferenceProfileService,
        ],
    })
], PersonalizationModule);
//# sourceMappingURL=personalization.module.js.map