import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for all search-related exceptions
 */
export class SearchException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(
      {
        status,
        error: 'Search Error',
        message,
      },
      status,
    );
  }
}

/**
 * Thrown when a search query is invalid
 */
export class InvalidSearchQueryException extends SearchException {
  constructor(message: string = 'Invalid search query') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Thrown when search parameters are invalid
 */
export class InvalidSearchParametersException extends SearchException {
  constructor(message: string = 'Invalid search parameters') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Thrown when Elasticsearch encounters an error
 */
export class ElasticsearchException extends SearchException {
  constructor(
    message: string = 'Elasticsearch error occurred',
    private readonly originalError?: any,
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  getOriginalError() {
    return this.originalError;
  }
}

/**
 * Thrown when search cache operations fail
 */
export class SearchCacheException extends SearchException {
  constructor(message: string = 'Search cache error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Thrown when NLP processing fails
 */
export class NlpProcessingException extends SearchException {
  constructor(message: string = 'NLP processing error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Thrown when experiment configuration is invalid
 */
export class ExperimentConfigurationException extends SearchException {
  constructor(message: string = 'Invalid experiment configuration') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Thrown when search monitoring encounters an error
 */
export class SearchMonitoringException extends SearchException {
  constructor(message: string = 'Search monitoring error occurred') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
