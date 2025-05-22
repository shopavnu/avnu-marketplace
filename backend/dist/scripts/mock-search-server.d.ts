declare const express: any;
declare const cors: any;
declare const graphqlHTTP: any;
declare const buildSchema: any;
declare const products: {
  id: string;
  title: string;
  description: string;
  price: number;
  brandName: string;
  imageUrl: string;
  categories: string[];
  colors: string[];
  materials: string[];
  sizes: string[];
  styles: string[];
}[];
declare const brands: {
  id: string;
  name: string;
}[];
declare const merchants: {
  id: string;
  name: string;
}[];
declare const schema: any;
declare function processWithNlp(query: string): {
  processedQuery: string;
  recognizedEntities: Record<string, string[]>;
  expandedTerms: string[];
  detectedIntent: string;
  confidence: number;
  processingTimeMs: number;
};
declare const root: {
  searchProducts: ({ input }: { input: any }) => {
    query: any;
    processedQuery: any;
    products: {
      id: string;
      title: string;
      description: string;
      price: number;
      brandName: string;
      imageUrl: string;
      categories: string[];
      colors: string[];
      materials: string[];
      sizes: string[];
      styles: string[];
    }[];
    pagination: {
      total: number;
      page: any;
      limit: any;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    facets: {
      categories: {
        name: string;
        count: number;
      }[];
      brands: {
        name: string;
        count: number;
      }[];
      colors: {
        name: string;
        count: number;
      }[];
      materials: {
        name: string;
        count: number;
      }[];
      styles: {
        name: string;
        count: number;
      }[];
      price: {
        min: number;
        max: number;
      };
    };
    nlpMetadata: any;
  };
  searchAll: ({ input }: { input: any }) => {
    query: any;
    processedQuery: any;
    products: {
      id: string;
      title: string;
      description: string;
      price: number;
      brandName: string;
      imageUrl: string;
      categories: string[];
      colors: string[];
      materials: string[];
      sizes: string[];
      styles: string[];
    }[];
    brands: {
      id: string;
      name: string;
    }[];
    merchants: {
      id: string;
      name: string;
    }[];
    pagination: {
      total: number;
      page: any;
      limit: any;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    nlpMetadata: any;
  };
};
declare const app: any;
declare const PORT = 3001;
