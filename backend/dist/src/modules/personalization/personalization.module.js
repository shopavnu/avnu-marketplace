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
const personalization_controller_1 = require("./personalization.controller");
const session_controller_1 = require("./controllers/session.controller");
const personalization_resolver_1 = require("./personalization.resolver");
const user_preferences_entity_1 = require("./entities/user-preferences.entity");
const user_behavior_entity_1 = require("./entities/user-behavior.entity");
const session_entity_1 = require("./entities/session.entity");
const session_interaction_entity_1 = require("./entities/session-interaction.entity");
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
            ]),
        ],
        controllers: [personalization_controller_1.PersonalizationController, session_controller_1.SessionController],
        providers: [
            personalization_service_1.PersonalizationService,
            user_preferences_service_1.UserPreferencesService,
            user_behavior_service_1.UserBehaviorService,
            session_service_1.SessionService,
            personalization_resolver_1.PersonalizationResolver,
        ],
        exports: [personalization_service_1.PersonalizationService, user_preferences_service_1.UserPreferencesService, user_behavior_service_1.UserBehaviorService, session_service_1.SessionService],
    })
], PersonalizationModule);
//# sourceMappingURL=personalization.module.js.map