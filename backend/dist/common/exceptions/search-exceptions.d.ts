import { HttpException, HttpStatus } from '@nestjs/common';
export declare class SearchException extends HttpException {
  constructor(message: string, status: HttpStatus);
}
export declare class InvalidSearchQueryException extends SearchException {
  constructor(message?: string);
}
export declare class InvalidSearchParametersException extends SearchException {
  constructor(message?: string);
}
export declare class ElasticsearchException extends SearchException {
  private readonly originalError?;
  constructor(message?: string, originalError?: any);
  getOriginalError(): any;
}
export declare class SearchCacheException extends SearchException {
  constructor(message?: string);
}
export declare class NlpProcessingException extends SearchException {
  constructor(message?: string);
}
export declare class ExperimentConfigurationException extends SearchException {
  constructor(message?: string);
}
export declare class SearchMonitoringException extends SearchException {
  constructor(message?: string);
}
