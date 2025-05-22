/**
 * Utility functions for mapping between DTOs and entities
 */

/**
 * Configuration for property preprocessing
 */
export interface PropertyMapping {
  /** The source property name */
  property: string;

  /** The target JSON field name */
  jsonField: string;
}

/**
 * Preprocesses a DTO by handling JSON field mapping
 *
 * @param dto The data transfer object to preprocess
 * @param mappings Array of property to JSON field mappings
 * @returns Preprocessed DTO with JSON field mappings applied
 */
export function preprocessDto<T extends Record<string, any>>(
  dto: T,
  mappings: PropertyMapping[],
): Record<string, any> {
  // Create a mutable copy to avoid modifying T directly
  const result: Record<string, any> = { ...dto };

  // Process each mapping
  for (const mapping of mappings) {
    const { property, jsonField } = mapping;

    // Only process if the property exists in the DTO
    if (property in result) {
      // Create the JSON field if it doesn't exist
      if (!result[jsonField]) {
        result[jsonField] = {};
      }

      // Copy the property value to the JSON field
      result[jsonField] = {
        ...result[jsonField],
        [property]: result[property],
      };

      // Remove the original property
      delete result[property];
    }
  }

  return result;
}
