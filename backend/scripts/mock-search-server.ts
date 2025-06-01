/**
 * mock-search-server.ts
 *
 * A lightweight mock server that simulates the GraphQL API for testing search functionality
 * without requiring the full NestJS server to be running.
 */
import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import { MockSearchService as _MockSearchService } from './mock-search.service';

// Sample product data
const products = [
  {
    id: 'p1',
    title: 'Nike Air Max 270',
    description: 'Comfortable running shoes with air cushioning',
    price: 150,
    brandName: 'Nike',
    imageUrl: 'https://example.com/nike-air-max.jpg',
    categories: ['Shoes', 'Athletic', 'Running'],
    colors: ['Red', 'Black', 'White'],
    materials: ['Synthetic', 'Mesh'],
    sizes: ['7', '8', '9', '10', '11'],
    styles: ['Athletic', 'Casual'],
  },
  {
    id: 'p2',
    title: 'Adidas Ultraboost',
    description: 'Premium running shoes with responsive cushioning',
    price: 180,
    brandName: 'Adidas',
    imageUrl: 'https://example.com/adidas-ultraboost.jpg',
    categories: ['Shoes', 'Athletic', 'Running'],
    colors: ['Blue', 'Black', 'Grey'],
    materials: ['Primeknit', 'Rubber'],
    sizes: ['8', '9', '10', '11', '12'],
    styles: ['Athletic', 'Performance'],
  },
  {
    id: 'p3',
    title: "Levi's 501 Original Fit Jeans",
    description: 'Classic straight leg jeans with button fly',
    price: 59.99,
    brandName: "Levi's",
    imageUrl: 'https://example.com/levis-501.jpg',
    categories: ['Clothing', 'Jeans', "Men's"],
    colors: ['Blue', 'Black', 'Grey'],
    materials: ['Denim', 'Cotton'],
    sizes: ['30', '32', '34', '36'],
    styles: ['Casual', 'Classic'],
  },
  {
    id: 'p4',
    title: 'North Face Thermoball Jacket',
    description: 'Lightweight insulated jacket for cold weather',
    price: 199.99,
    brandName: 'North Face',
    imageUrl: 'https://example.com/northface-thermoball.jpg',
    categories: ['Clothing', 'Outerwear', 'Jackets'],
    colors: ['Green', 'Black', 'Navy'],
    materials: ['Nylon', 'Synthetic Insulation'],
    sizes: ['S', 'M', 'L', 'XL'],
    styles: ['Outdoor', 'Winter'],
  },
  {
    id: 'p5',
    title: 'Patagonia Better Sweater',
    description: 'Fleece jacket made with recycled materials',
    price: 139,
    brandName: 'Patagonia',
    imageUrl: 'https://example.com/patagonia-better-sweater.jpg',
    categories: ['Clothing', 'Outerwear', 'Sustainable'],
    colors: ['Grey', 'Blue', 'Green'],
    materials: ['Recycled Polyester', 'Fleece'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    styles: ['Casual', 'Outdoor', 'Eco-friendly'],
  },
  {
    id: 'p6',
    title: 'Zara Summer Dress',
    description: 'Lightweight floral dress for warm weather',
    price: 49.99,
    brandName: 'Zara',
    imageUrl: 'https://example.com/zara-summer-dress.jpg',
    categories: ['Clothing', 'Dresses', "Women's"],
    colors: ['Floral', 'White', 'Blue'],
    materials: ['Cotton', 'Linen'],
    sizes: ['XS', 'S', 'M', 'L'],
    styles: ['Summer', 'Casual', 'Feminine'],
  },
  {
    id: 'p7',
    title: 'Ray-Ban Wayfarer Sunglasses',
    description: 'Classic sunglasses with UV protection',
    price: 154,
    brandName: 'Ray-Ban',
    imageUrl: 'https://example.com/rayban-wayfarer.jpg',
    categories: ['Accessories', 'Eyewear', 'Sunglasses'],
    colors: ['Black', 'Tortoise', 'Blue'],
    materials: ['Acetate', 'Glass'],
    sizes: ['One Size'],
    styles: ['Classic', 'Casual', 'Fashion'],
  },
  {
    id: 'p8',
    title: 'Apple AirPods Pro',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249,
    brandName: 'Apple',
    imageUrl: 'https://example.com/airpods-pro.jpg',
    categories: ['Electronics', 'Audio', 'Headphones'],
    colors: ['White'],
    materials: ['Plastic', 'Silicone'],
    sizes: ['One Size'],
    styles: ['Modern', 'Tech'],
  },
  {
    id: 'p9',
    title: 'Fjallraven Kanken Backpack',
    description: 'Durable everyday backpack with classic design',
    price: 80,
    brandName: 'Fjallraven',
    imageUrl: 'https://example.com/fjallraven-kanken.jpg',
    categories: ['Bags', 'Backpacks', 'Accessories'],
    colors: ['Red', 'Blue', 'Yellow', 'Green'],
    materials: ['Vinylon F', 'Synthetic'],
    sizes: ['16L', '20L'],
    styles: ['Casual', 'School', 'Outdoor'],
  },
  {
    id: 'p10',
    title: 'Birkenstock Arizona Sandals',
    description: 'Comfortable cork footbed sandals',
    price: 99.95,
    brandName: 'Birkenstock',
    imageUrl: 'https://example.com/birkenstock-arizona.jpg',
    categories: ['Shoes', 'Sandals', 'Summer'],
    colors: ['Brown', 'Black', 'White'],
    materials: ['Cork', 'Leather', 'Suede'],
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    styles: ['Casual', 'Comfort', 'Summer'],
  },
];

// Sample brands data
const brands = [
  { id: 'b1', name: 'Nike' },
  { id: 'b2', name: 'Adidas' },
  { id: 'b3', name: "Levi's" },
  { id: 'b4', name: 'North Face' },
  { id: 'b5', name: 'Patagonia' },
  { id: 'b6', name: 'Zara' },
  { id: 'b7', name: 'Ray-Ban' },
  { id: 'b8', name: 'Apple' },
  { id: 'b9', name: 'Fjallraven' },
  { id: 'b10', name: 'Birkenstock' },
];

// Sample merchants data
const merchants = [
  { id: 'm1', name: 'Fashion Outlet' },
  { id: 'm2', name: 'Sports World' },
  { id: 'm3', name: 'Tech Haven' },
  { id: 'm4', name: 'Outdoor Adventures' },
  { id: 'm5', name: 'Urban Styles' },
];

// Define GraphQL schema
const schema = buildSchema(`
  type Product {
    id: ID!
    title: String!
    description: String!
    price: Float!
    brandName: String!
    imageUrl: String
    highlights: [String]
    categories: [String]
    colors: [String]
    materials: [String]
    sizes: [String]
    styles: [String]
  }

  type Brand {
    id: ID!
    name: String!
  }

  type Merchant {
    id: ID!
    name: String!
  }

  type CategoryFacet {
    name: String!
    count: Int!
  }

  type TermFacet {
    name: String!
    count: Int!
  }

  type PriceFacet {
    min: Float!
    max: Float!
  }

  type SearchFacets {
    categories: [CategoryFacet]
    brands: [TermFacet]
    colors: [TermFacet]
    materials: [TermFacet]
    sizes: [TermFacet]
    styles: [TermFacet]
    price: PriceFacet
  }

  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
  }

  type NlpMetadata {
    recognizedEntities: JSON
    expandedTerms: [String]
    detectedIntent: String
    confidence: Float
    processingTimeMs: Int
  }

  type ProductSearchResponse {
    query: String!
    processedQuery: String
    products: [Product!]!
    pagination: PaginationInfo!
    facets: SearchFacets
    nlpMetadata: NlpMetadata
  }

  type AllEntitySearchResponse {
    query: String!
    processedQuery: String
    products: [Product!]!
    merchants: [Merchant!]!
    brands: [Brand!]!
    pagination: PaginationInfo!
    facets: SearchFacets
    nlpMetadata: NlpMetadata
  }

  input FilterInput {
    field: String!
    values: [String!]!
    exact: Boolean
  }

  input SearchOptionsInput {
    query: String
    limit: Int
    page: Int
    filters: [FilterInput]
    enableNlp: Boolean
    enableHighlighting: Boolean
  }

  scalar JSON

  type Query {
    searchProducts(input: SearchOptionsInput!): ProductSearchResponse!
    searchAll(input: SearchOptionsInput!): AllEntitySearchResponse!
  }
`);

// Mock NLP processing function
function processWithNlp(query: string) {
  // Simple entity recognition
  const entities: Record<string, string[]> = {};

  // Brand detection
  const brandMatches = brands
    .filter(brand => query.toLowerCase().includes(brand.name.toLowerCase()))
    .map(brand => brand.name);
  if (brandMatches.length > 0) {
    entities.brands = brandMatches;
  }

  // Color detection
  const colors = [
    'red',
    'blue',
    'green',
    'black',
    'white',
    'yellow',
    'purple',
    'pink',
    'orange',
    'grey',
    'gray',
    'brown',
  ];
  const colorMatches = colors.filter(color => query.toLowerCase().includes(color));
  if (colorMatches.length > 0) {
    entities.colors = colorMatches;
  }

  // Product type detection
  const productTypes = [
    'shoes',
    'shirt',
    'pants',
    'jeans',
    'jacket',
    'dress',
    'sunglasses',
    'backpack',
    'sandals',
  ];
  const productMatches = productTypes.filter(type => query.toLowerCase().includes(type));
  if (productMatches.length > 0) {
    entities.productTypes = productMatches;
  }

  // Material detection
  const materials = ['cotton', 'leather', 'denim', 'wool', 'polyester', 'nylon', 'silk', 'linen'];
  const materialMatches = materials.filter(material => query.toLowerCase().includes(material));
  if (materialMatches.length > 0) {
    entities.materials = materialMatches;
  }

  // Simple query expansion (synonyms)
  const expandedTerms: string[] = [];
  if (query.toLowerCase().includes('shoes')) expandedTerms.push('footwear', 'sneakers');
  if (query.toLowerCase().includes('jacket')) expandedTerms.push('coat', 'outerwear');
  if (query.toLowerCase().includes('pants')) expandedTerms.push('trousers', 'bottoms');

  // Intent detection
  let intent = 'browse';
  if (query.toLowerCase().includes('buy') || query.toLowerCase().includes('purchase')) {
    intent = 'purchase';
  } else if (query.toLowerCase().includes('compare')) {
    intent = 'compare';
  } else if (query.toLowerCase().includes('gift') || query.toLowerCase().includes('present')) {
    intent = 'gift';
  }

  return {
    processedQuery: query,
    recognizedEntities: entities,
    expandedTerms,
    detectedIntent: intent,
    confidence: 0.85,
    processingTimeMs: 15,
  };
}

// Define resolvers
const root = {
  searchProducts: ({ input }: { input: any }) => {
    const { query = '', limit = 10, page = 1, filters = [], enableNlp = false } = input;

    // Filter products based on query and filters
    let filteredProducts = [...products];

    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredProducts = filteredProducts.filter(product => {
        return searchTerms.some(
          term =>
            product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.brandName.toLowerCase().includes(term) ||
            product.categories.some((cat: string) => cat.toLowerCase().includes(term)),
        );
      });
    }

    // Apply filters
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        const { field, values, exact } = filter;

        if (field && values && values.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (field === 'brandName') {
              return values.some((value: string) =>
                exact
                  ? product.brandName === value
                  : product.brandName.toLowerCase().includes(value.toLowerCase()),
              );
            } else if (field === 'price') {
              const [min, max] = values;
              return product.price >= parseFloat(min) && product.price <= parseFloat(max);
            } else if (field === 'categories') {
              return values.some((value: string) =>
                product.categories.some((cat: string) =>
                  exact ? cat === value : cat.toLowerCase().includes(value.toLowerCase()),
                ),
              );
            }
            return true;
          });
        }
      });
    }

    // Calculate pagination
    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Generate facets
    const facets = {
      categories: Array.from(new Set(filteredProducts.flatMap(p => p.categories))).map(name => ({
        name,
        count: filteredProducts.filter(p => p.categories.includes(name)).length,
      })),
      brands: Array.from(new Set(filteredProducts.map(p => p.brandName))).map(name => ({
        name,
        count: filteredProducts.filter(p => p.brandName === name).length,
      })),
      colors: Array.from(new Set(filteredProducts.flatMap(p => p.colors))).map(name => ({
        name,
        count: filteredProducts.filter(p => p.colors.includes(name)).length,
      })),
      materials: Array.from(new Set(filteredProducts.flatMap(p => p.materials))).map(name => ({
        name,
        count: filteredProducts.filter(p => p.materials.includes(name)).length,
      })),
      styles: Array.from(new Set(filteredProducts.flatMap(p => p.styles))).map(name => ({
        name,
        count: filteredProducts.filter(p => p.styles.includes(name)).length,
      })),
      price: {
        min: Math.min(...filteredProducts.map(p => p.price)),
        max: Math.max(...filteredProducts.map(p => p.price)),
      },
    };

    // Process with NLP if enabled
    let nlpMetadata = null;
    let processedQuery = query;

    if (enableNlp && query) {
      const nlpResult = processWithNlp(query);
      nlpMetadata = {
        recognizedEntities: nlpResult.recognizedEntities,
        expandedTerms: nlpResult.expandedTerms,
        detectedIntent: nlpResult.detectedIntent,
        confidence: nlpResult.confidence,
        processingTimeMs: nlpResult.processingTimeMs,
      };
      processedQuery = nlpResult.processedQuery;

      // Add highlights if enabled
      if (input.enableHighlighting) {
        paginatedProducts.forEach(product => {
          const highlights: string[] = [];
          if (product.description) {
            const terms = [...query.toLowerCase().split(' '), ...(nlpResult.expandedTerms || [])];
            terms.forEach(term => {
              if (product.description.toLowerCase().includes(term)) {
                const regex = new RegExp(`(\\w*${term}\\w*)`, 'gi');
                const match = product.description.match(regex);
                if (match) {
                  highlights.push(`...${match[0]}...`);
                }
              }
            });
          }
          if (highlights.length > 0) {
            (product as any).highlights = highlights;
          }
        });
      }
    }

    return {
      query,
      processedQuery,
      products: paginatedProducts,
      pagination: {
        total,
        page,
        limit,
        hasNext: endIndex < total,
        hasPrevious: page > 1,
      },
      facets,
      nlpMetadata,
    };
  },

  searchAll: ({ input }: { input: any }) => {
    const { query = '', limit = 10, page = 1, enableNlp = false } = input;

    // Filter entities based on query
    let filteredProducts = [...products];
    let filteredBrands = [...brands];
    let filteredMerchants = [...merchants];

    if (query) {
      const searchTerms = query.toLowerCase().split(' ');

      filteredProducts = filteredProducts.filter(product => {
        return searchTerms.some(
          term =>
            product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.brandName.toLowerCase().includes(term),
        );
      });

      filteredBrands = filteredBrands.filter(brand => {
        return searchTerms.some(term => brand.name.toLowerCase().includes(term));
      });

      filteredMerchants = filteredMerchants.filter(merchant => {
        return searchTerms.some(term => merchant.name.toLowerCase().includes(term));
      });
    }

    // Calculate pagination
    const total = filteredProducts.length + filteredBrands.length + filteredMerchants.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Distribute results proportionally
    const productLimit = Math.floor(limit * 0.6);
    const brandLimit = Math.floor(limit * 0.2);
    const merchantLimit = limit - productLimit - brandLimit;

    const paginatedProducts = filteredProducts.slice(0, productLimit);
    const paginatedBrands = filteredBrands.slice(0, brandLimit);
    const paginatedMerchants = filteredMerchants.slice(0, merchantLimit);

    // Process with NLP if enabled
    let nlpMetadata = null;
    let processedQuery = query;

    if (enableNlp && query) {
      const nlpResult = processWithNlp(query);
      nlpMetadata = {
        recognizedEntities: nlpResult.recognizedEntities,
        expandedTerms: nlpResult.expandedTerms,
        detectedIntent: nlpResult.detectedIntent,
        confidence: nlpResult.confidence,
        processingTimeMs: nlpResult.processingTimeMs,
      };
      processedQuery = nlpResult.processedQuery;
    }

    return {
      query,
      processedQuery,
      products: paginatedProducts,
      brands: paginatedBrands,
      merchants: paginatedMerchants,
      pagination: {
        total,
        page,
        limit,
        hasNext: endIndex < total,
        hasPrevious: page > 1,
      },
      nlpMetadata,
    };
  },
};

// Create Express server
const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GraphQL endpoint
app.use(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: root,
  }),
);

// GraphiQL endpoint (graphql-http doesn't include GraphiQL, so we need to add a separate endpoint for it)
app.get('/graphiql', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GraphiQL</title>
        <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
      </head>
      <body style="margin: 0;">
        <div id="graphiql" style="height: 100vh;"></div>
        <script
          crossorigin
          src="https://unpkg.com/react/umd/react.production.min.js"
        ></script>
        <script
          crossorigin
          src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
        ></script>
        <script
          crossorigin
          src="https://unpkg.com/graphiql/graphiql.min.js"
        ></script>
        <script>
          const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher }),
            document.getElementById('graphiql'),
          );
        </script>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Mock search server running at http://localhost:${PORT}`);
  console.log(`📊 GraphQL playground available at http://localhost:${PORT}/graphql`);
  console.log(`🔍 Ready to test search functionality!\n`);
});
