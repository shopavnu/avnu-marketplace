import { Product } from '../../products/entities/product.entity';
export declare class DiscoverySectionType {
  id: string;
  title: string;
  description?: string;
  items: Product[];
  type: string;
}
export declare class DiscoveryHomepageType {
  sections: DiscoverySectionType[];
  metadata?: any;
}
