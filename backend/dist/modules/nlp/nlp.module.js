"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_module_1 = require("../search/elasticsearch/elasticsearch.module");
const search_module_1 = require("../search/search.module");
const nlp_service_1 = require("./services/nlp.service");
const enhanced_nlp_service_1 = require("./services/enhanced-nlp.service");
const query_expansion_service_1 = require("./services/query-expansion.service");
const entity_recognition_service_1 = require("./services/entity-recognition.service");
const intent_detection_service_1 = require("./services/intent-detection.service");
const natural_language_search_service_1 = require("./services/natural-language-search.service");
const nlp_controller_1 = require("./nlp.controller");
const nlp_resolver_1 = require("./nlp.resolver");
let NlpModule = class NlpModule {
};
exports.NlpModule = NlpModule;
exports.NlpModule = NlpModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, elasticsearch_module_1.ElasticsearchConfigModule, (0, common_1.forwardRef)(() => search_module_1.SearchModule)],
        controllers: [nlp_controller_1.NlpController],
        providers: [
            nlp_service_1.NlpService,
            enhanced_nlp_service_1.EnhancedNlpService,
            query_expansion_service_1.QueryExpansionService,
            entity_recognition_service_1.EntityRecognitionService,
            intent_detection_service_1.IntentDetectionService,
            natural_language_search_service_1.NaturalLanguageSearchService,
            nlp_resolver_1.NlpResolver,
        ],
        exports: [
            nlp_service_1.NlpService,
            enhanced_nlp_service_1.EnhancedNlpService,
            query_expansion_service_1.QueryExpansionService,
            entity_recognition_service_1.EntityRecognitionService,
            intent_detection_service_1.IntentDetectionService,
            natural_language_search_service_1.NaturalLanguageSearchService,
        ],
    })
], NlpModule);
//# sourceMappingURL=nlp.module.js.map