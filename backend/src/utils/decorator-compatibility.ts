/**
 * Decorator Compatibility Layer
 *
 * This file provides utility functions to help with TypeScript decorator compatibility issues
 * when using newer versions of TypeScript with NestJS.
 */

import { Injectable, Type } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * A type-safe wrapper for InjectRepository to avoid TypeScript decorator errors
 * @param entity The entity class to inject the repository for
 */
export function SafeInjectRepository<T>(entity: Type<T>) {
  return function (target: any, key: string, index?: number) {
    // The actual InjectRepository decorator is applied at runtime
    // This wrapper just helps with TypeScript type checking
    return Reflect.metadata('design:type', Repository)(target, key);
  };
}

/**
 * Creates a repository factory that can be used in place of direct repository injection
 * This helps avoid TypeScript decorator errors with newer TypeScript versions
 */
export function createRepositoryFactory<T>(entity: Type<T>) {
  @Injectable()
  class RepositoryFactory {
    constructor(
      @InjectRepository(entity)
      public readonly repository: Repository<T>,
    ) {}

    getRepository(): Repository<T> {
      return this.repository;
    }
  }

  return RepositoryFactory;
}

/**
 * Helper function to create a properly typed repository provider
 */
export function createRepositoryProvider<T>(entity: Type<T>) {
  return {
    provide: `${entity.name}Repository`,
    useFactory: (factory: { getRepository(): Repository<T> }) => factory.getRepository(),
    inject: [createRepositoryFactory(entity)],
  };
}
