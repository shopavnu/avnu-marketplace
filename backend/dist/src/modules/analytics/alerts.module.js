"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const alerts_service_1 = require("./services/alerts.service");
const alerts_resolver_1 = require("./resolvers/alerts.resolver");
const alert_entity_1 = require("./entities/alert.entity");
const alert_metric_entity_1 = require("./entities/alert-metric.entity");
const analytics_module_1 = require("./analytics.module");
const search_module_1 = require("../search/search.module");
const users_module_1 = require("../users/users.module");
let AlertsModule = class AlertsModule {
};
exports.AlertsModule = AlertsModule;
exports.AlertsModule = AlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([alert_entity_1.AlertEntity, alert_metric_entity_1.AlertMetricEntity]),
            (0, common_1.forwardRef)(() => analytics_module_1.AnalyticsModule),
            (0, common_1.forwardRef)(() => search_module_1.SearchModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        providers: [alerts_service_1.AlertsService, alerts_resolver_1.AlertsResolver],
        exports: [alerts_service_1.AlertsService],
    })
], AlertsModule);
//# sourceMappingURL=alerts.module.js.map