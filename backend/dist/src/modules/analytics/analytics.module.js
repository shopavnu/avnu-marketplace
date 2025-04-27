"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const analytics_service_1 = require("./services/analytics.service");
const search_analytics_service_1 = require("./services/search-analytics.service");
const user_engagement_service_1 = require("./services/user-engagement.service");
const business_metrics_service_1 = require("./services/business-metrics.service");
const google_analytics_service_1 = require("./services/google-analytics.service");
const session_analytics_service_1 = require("./services/session-analytics.service");
const analytics_dashboard_service_1 = require("./services/analytics-dashboard.service");
const analytics_controller_1 = require("./analytics.controller");
const analytics_resolver_1 = require("./analytics.resolver");
const analytics_dashboard_resolver_1 = require("./resolvers/analytics-dashboard.resolver");
const search_analytics_entity_1 = require("./entities/search-analytics.entity");
const user_engagement_entity_1 = require("./entities/user-engagement.entity");
const business_metrics_entity_1 = require("./entities/business-metrics.entity");
const session_entity_1 = require("../personalization/entities/session.entity");
const session_interaction_entity_1 = require("../personalization/entities/session-interaction.entity");
const search_module_1 = require("../search/search.module");
const analytics_scheduler_1 = require("./analytics.scheduler");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                search_analytics_entity_1.SearchAnalytics,
                session_entity_1.SessionEntity,
                session_interaction_entity_1.SessionInteractionEntity,
                user_engagement_entity_1.UserEngagement,
                business_metrics_entity_1.BusinessMetrics,
            ]),
            (0, common_1.forwardRef)(() => search_module_1.SearchModule),
            schedule_1.ScheduleModule.forRoot(),
            elasticsearch_1.ElasticsearchModule.register({
                node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
                auth: {
                    username: process.env.ELASTICSEARCH_USERNAME || '',
                    password: process.env.ELASTICSEARCH_PASSWORD || '',
                },
                tls: {
                    rejectUnauthorized: false,
                },
            }),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [
            analytics_service_1.AnalyticsService,
            search_analytics_service_1.SearchAnalyticsService,
            session_analytics_service_1.SessionAnalyticsService,
            analytics_dashboard_service_1.AnalyticsDashboardService,
            user_engagement_service_1.UserEngagementService,
            business_metrics_service_1.BusinessMetricsService,
            google_analytics_service_1.GoogleAnalyticsService,
            analytics_resolver_1.AnalyticsResolver,
            analytics_dashboard_resolver_1.AnalyticsDashboardResolver,
            analytics_scheduler_1.AnalyticsScheduler,
        ],
        exports: [
            analytics_service_1.AnalyticsService,
            search_analytics_service_1.SearchAnalyticsService,
            session_analytics_service_1.SessionAnalyticsService,
            analytics_dashboard_service_1.AnalyticsDashboardService,
            user_engagement_service_1.UserEngagementService,
            business_metrics_service_1.BusinessMetricsService,
            google_analytics_service_1.GoogleAnalyticsService,
        ],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map