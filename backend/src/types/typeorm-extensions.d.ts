/**
 * TypeORM extensions and type definitions
 * This file provides type definitions for TypeORM features that might be missing or incorrectly typed
 */

import { FindOperator } from 'typeorm';

declare module 'typeorm' {
  // Add missing TypeORM operators
  export function _Raw<_T>(value: string): FindOperator<any>;
  export function _IsNull(): FindOperator<any>;
  export function _Not<T>(value: T): FindOperator<T>;
  export function _In<T>(value: T[]): FindOperator<T>;

  // Ensure Raw, IsNull, etc. are properly exported
  export { Raw, IsNull, Not, In };
}
