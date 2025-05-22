export interface StructuredData {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  brand?: {
    '@type': string;
    name: string;
  };
  image?: string[];
  offers?: {
    '@type': string;
    price?: number;
    priceCurrency?: string;
    availability?: string;
  };
  [key: string]: unknown;
}
