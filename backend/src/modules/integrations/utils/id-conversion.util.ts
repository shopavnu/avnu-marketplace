// @ts-strict-mode: enabled

/**
 * Utility functions for ID conversion between string and number
 * These functions help with TypeORM operations where we need to convert between string IDs (used in APIs)
 * and numeric IDs (used in the database)
 */

/**
 * Convert a string ID to a number
 * @param id The string ID to convert
 * @returns The numeric ID
 * @throws {Error} If the ID is not a valid number
 */
export function toNumericId(id: string): number {
  if (!id) {
    throw new Error('ID is required');
  }

  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    throw new Error(`Invalid ID: ${id} is not a valid number`);
  }

  return numericId;
}

/**
 * Convert a number ID to a string
 * @param id The numeric ID to convert
 * @returns The string ID
 */
export function toStringId(id: number): string {
  return id.toString();
}

/**
 * Safe conversion of a string ID to a number
 * Returns undefined if the ID is not a valid number
 * @param id The string ID to convert
 * @returns The numeric ID or undefined
 */
export function safeToNumericId(id?: string): number | undefined {
  if (!id) {
    return undefined;
  }

  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return undefined;
  }

  return numericId;
}

/**
 * Safe conversion of a number ID to a string
 * Returns undefined if the ID is undefined
 * @param id The numeric ID to convert
 * @returns The string ID or undefined
 */
export function safeToStringId(id?: number): string | undefined {
  if (id === undefined || id === null) {
    return undefined;
  }

  return id.toString();
}

/**
 * Create a where clause for TypeORM with a numeric ID
 * @param id The string ID to convert
 * @returns The where clause with a numeric ID
 */
export function createNumericIdWhereClause(id: string): { id: number } {
  return { id: toNumericId(id) };
}

/**
 * Create a where clause for TypeORM with a string ID field
 * @param fieldName The name of the ID field
 * @param id The string ID value
 * @returns The where clause with the specified field
 */
export function createStringIdWhereClause<T extends string>(
  fieldName: T,
  id: string,
): Record<T, string> {
  return { [fieldName]: id } as Record<T, string>;
}
