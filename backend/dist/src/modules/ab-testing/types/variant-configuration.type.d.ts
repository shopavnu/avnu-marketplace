export declare class VariantAssignmentType {
    variantId: string;
    configuration: any;
    assignmentId: string;
}
export declare class VariantConfigurationType {
    experiments: Record<string, VariantAssignmentType>;
}
