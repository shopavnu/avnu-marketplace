export declare function transformDto<T, R>(dto: T, config: TransformDtoConfig): R;
export declare function objectArrayToPrimitiveArray<T>(arr: T[], property: keyof T): unknown[];
export interface TransformDtoConfig {
  jsonFields?: Record<string, string>;
  transform?: Record<
    string,
    {
      targetPath: string[];
      transformer: (value: any) => any;
    }
  >;
  customTransformers?: Record<string, (value: any, obj: Record<string, any>) => any>;
}
