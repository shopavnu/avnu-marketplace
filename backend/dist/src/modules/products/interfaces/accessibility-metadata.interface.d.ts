import { StructuredData } from './structured-data.interface';
export interface AccessibilityMetadata {
    altText?: string;
    ariaLabel?: string;
    role?: string;
    longDescription?: string;
    structuredData?: StructuredData;
}
