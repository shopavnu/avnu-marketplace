export declare function toNumericId(id: string): number;
export declare function toStringId(id: number): string;
export declare function safeToNumericId(id?: string): number | undefined;
export declare function safeToStringId(id?: number): string | undefined;
export declare function createNumericIdWhereClause(id: string): {
  id: number;
};
export declare function createStringIdWhereClause<T extends string>(
  fieldName: T,
  id: string,
): Record<T, string>;
