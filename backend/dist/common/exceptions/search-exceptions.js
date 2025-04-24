"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMonitoringException = exports.ExperimentConfigurationException = exports.NlpProcessingException = exports.SearchCacheException = exports.ElasticsearchException = exports.InvalidSearchParametersException = exports.InvalidSearchQueryException = exports.SearchException = void 0;
const common_1 = require("@nestjs/common");
class SearchException extends common_1.HttpException {
    constructor(message, status) {
        super({
            status,
            error: 'Search Error',
            message,
        }, status);
    }
}
exports.SearchException = SearchException;
class InvalidSearchQueryException extends SearchException {
    constructor(message = 'Invalid search query') {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.InvalidSearchQueryException = InvalidSearchQueryException;
class InvalidSearchParametersException extends SearchException {
    constructor(message = 'Invalid search parameters') {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.InvalidSearchParametersException = InvalidSearchParametersException;
class ElasticsearchException extends SearchException {
    constructor(message = 'Elasticsearch error occurred', originalError) {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        this.originalError = originalError;
    }
    getOriginalError() {
        return this.originalError;
    }
}
exports.ElasticsearchException = ElasticsearchException;
class SearchCacheException extends SearchException {
    constructor(message = 'Search cache error occurred') {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.SearchCacheException = SearchCacheException;
class NlpProcessingException extends SearchException {
    constructor(message = 'NLP processing error occurred') {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.NlpProcessingException = NlpProcessingException;
class ExperimentConfigurationException extends SearchException {
    constructor(message = 'Invalid experiment configuration') {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.ExperimentConfigurationException = ExperimentConfigurationException;
class SearchMonitoringException extends SearchException {
    constructor(message = 'Search monitoring error occurred') {
        super(message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
exports.SearchMonitoringException = SearchMonitoringException;
//# sourceMappingURL=search-exceptions.js.map