/**
 * Central Brand interface definition for the entire application
 * Used by brand cards, brand pages, and product listings
 */
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  values: string[];
  location: string;
  rating?: { average: number; count: number };
  // Added for backward compatibility with existing code
  founded?: string;
  // Added for backward compatibility with existing code
  causes?: string[];
}
