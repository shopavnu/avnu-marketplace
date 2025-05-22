import { Brand } from "@/types/brand";

// Re-export the Brand interface for backward compatibility
export type { Brand };

// Extended brand interface with category (if needed)
export interface BrandWithCategory extends Brand {
  category: string;
}
