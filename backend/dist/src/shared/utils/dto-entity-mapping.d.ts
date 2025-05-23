export interface PropertyMapping {
    property: string;
    jsonField: string;
}
export declare function preprocessDto<T extends Record<string, any>>(dto: T, mappings: PropertyMapping[]): Record<string, any>;
