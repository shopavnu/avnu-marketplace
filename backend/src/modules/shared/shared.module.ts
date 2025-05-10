import { Module } from '@nestjs/common';

/**
 * Shared Module
 *
 * This module contains shared components, interfaces, DTOs, and utilities
 * that are used by multiple other modules throughout the application.
 *
 * It helps prevent circular dependencies by providing a common foundation
 * that other modules can depend on without creating interdependencies.
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class SharedModule {}
