/**
 * Utility functions for transforming DTOs to entity objects and vice versa
 */

/**
 * Transform DTO object based on configuration
 * @param dto The data transfer object to transform
 * @param config Configuration that defines transformation rules
 * @returns Transformed object
 */
export function transformDto<T, R>(dto: T, config: TransformDtoConfig): R {
  const result: Record<string, any> = { ...dto };

  // Process JSON fields
  if (config.jsonFields) {
    for (const [property, jsonField] of Object.entries(config.jsonFields)) {
      if (result[property] !== undefined) {
        if (!result[jsonField]) {
          result[jsonField] = {};
        }
        result[jsonField] = {
          ...result[jsonField],
          [property]: result[property],
        };
        delete result[property];
      }
    }
  }

  // Apply custom transformations
  if (config.transform) {
    for (const [property, transform] of Object.entries(config.transform)) {
      if (result[property] !== undefined) {
        const targetObj = getOrCreateNestedObject(result, transform.targetPath);
        const lastKey = transform.targetPath[transform.targetPath.length - 1];

        targetObj[lastKey] = transform.transformer(result[property]);

        // Delete the original property if it's not part of the target path
        if (
          transform.targetPath.length === 0 ||
          transform.targetPath[transform.targetPath.length - 1] !== property
        ) {
          delete result[property];
        }
      }
    }
  }

  // Apply custom transformers that might affect multiple fields
  if (config.customTransformers) {
    for (const [property, transformer] of Object.entries(config.customTransformers)) {
      if (result[property] !== undefined) {
        result[property] = transformer(result[property], result);
      }
    }
  }

  return result as unknown as R;
}

/**
 * Helper function that gets or creates a nested object at the specified path
 * @param obj The base object
 * @param path Array of property names representing the path
 * @returns The last object in the path
 */
function getOrCreateNestedObject(obj: Record<string, any>, path: string[]): Record<string, any> {
  if (path.length === 0) return obj;

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  return current;
}

/**
 * Transforms an array of objects to an array of primitive values
 * by extracting a specified property from each object
 *
 * @param arr Array of objects
 * @param property Property to extract from each object
 * @returns Array of primitive values
 */
export function objectArrayToPrimitiveArray<T>(arr: T[], property: keyof T): unknown[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => item[property]);
}

/**
 * Interface for DTO transformation configuration
 */
export interface TransformDtoConfig {
  /** Maps properties to JSON fields */
  jsonFields?: Record<string, string>;

  /** Defines transformations for specific properties */
  transform?: Record<
    string,
    {
      /** Path to the target property in the result object */
      targetPath: string[];
      /** Function to transform the property value */
      transformer: (value: any) => any;
    }
  >;

  /** Custom transformers that can modify multiple properties */
  customTransformers?: Record<string, (value: any, obj: Record<string, any>) => any>;
}
