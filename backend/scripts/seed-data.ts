import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import { Merchant } from '../src/modules/merchants/entities/merchant.entity';
import { Brand } from '../src/modules/products/entities/brand.entity';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { ElasticsearchIndexingService } from '../src/modules/search/services/elasticsearch-indexing.service';
import { ElasticsearchService } from '../src/modules/search/services/elasticsearch.service';

// Sample data
const users = [
  {
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'password123', // In a real app, this would be hashed
    role: UserRole.ADMIN,
    isEmailVerified: true,
    interests: ['fashion', 'technology', 'home decor'],
  },
  {
    email: 'merchant@example.com',
    firstName: 'Merchant',
    lastName: 'User',
    password: 'password123',
    role: UserRole.MERCHANT,
    isEmailVerified: true,
    isMerchant: true,
    interests: ['fashion', 'sports'],
  },
  {
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    password: 'password123',
    role: UserRole.USER,
    isEmailVerified: true,
    interests: ['electronics', 'books', 'outdoor'],
  },
];

const brands = [
  {
    name: 'TechGear',
    description: 'High-quality tech products for everyday use',
    logo: 'https://example.com/techgear-logo.png',
    website: 'https://techgear.example.com',
    foundedYear: 2010,
    values: ['innovation', 'quality', 'sustainability'],
    categories: ['electronics', 'accessories'],
  },
  {
    name: 'FashionForward',
    description: 'Trendy and sustainable fashion for all',
    logo: 'https://example.com/fashionforward-logo.png',
    website: 'https://fashionforward.example.com',
    foundedYear: 2015,
    values: ['sustainability', 'ethical production', 'style'],
    categories: ['clothing', 'accessories'],
  },
  {
    name: 'HomeStyle',
    description: 'Beautiful home decor and furniture',
    logo: 'https://example.com/homestyle-logo.png',
    website: 'https://homestyle.example.com',
    foundedYear: 2008,
    values: ['quality', 'design', 'comfort'],
    categories: ['home decor', 'furniture'],
  },
  {
    name: 'SportsPro',
    description: 'Professional sports equipment and apparel',
    logo: 'https://example.com/sportspro-logo.png',
    website: 'https://sportspro.example.com',
    foundedYear: 2005,
    values: ['performance', 'durability', 'innovation'],
    categories: ['sports', 'fitness', 'outdoor'],
  },
];

const merchants = [
  {
    name: 'ElectroMart',
    description: 'Your one-stop shop for electronics',
    logo: 'https://example.com/electromart-logo.png',
    website: 'https://electromart.example.com',
    contactEmail: 'contact@electromart.example.com',
    contactPhone: '+1234567890',
    address: '123 Tech Street, Silicon Valley, CA',
    isVerified: true,
    categories: ['electronics', 'gadgets', 'accessories'],
    values: ['customer service', 'quality', 'affordability'],
  },
  {
    name: 'Fashion Emporium',
    description: 'Trendy fashion for all seasons',
    logo: 'https://example.com/fashion-emporium-logo.png',
    website: 'https://fashion-emporium.example.com',
    contactEmail: 'contact@fashion-emporium.example.com',
    contactPhone: '+1987654321',
    address: '456 Style Avenue, New York, NY',
    isVerified: true,
    categories: ['clothing', 'shoes', 'accessories'],
    values: ['style', 'sustainability', 'inclusivity'],
  },
  {
    name: 'Home & Beyond',
    description: 'Everything you need for your home',
    logo: 'https://example.com/home-beyond-logo.png',
    website: 'https://home-beyond.example.com',
    contactEmail: 'contact@home-beyond.example.com',
    contactPhone: '+1122334455',
    address: '789 Decor Boulevard, Los Angeles, CA',
    isVerified: true,
    categories: ['home decor', 'furniture', 'kitchen'],
    values: ['quality', 'design', 'customer satisfaction'],
  },
  {
    name: 'Active Life Store',
    description: 'Gear up for your active lifestyle',
    logo: 'https://example.com/active-life-logo.png',
    website: 'https://active-life.example.com',
    contactEmail: 'contact@active-life.example.com',
    contactPhone: '+1567891234',
    address: '321 Fitness Road, Denver, CO',
    isVerified: true,
    categories: ['sports', 'fitness', 'outdoor'],
    values: ['performance', 'health', 'adventure'],
  },
];

const products = [
  // TechGear products
  {
    sku: 'TG-LAPTOP-001',
    title: 'TechGear Pro Laptop',
    description: 'Powerful laptop for professionals and gamers',
    price: 1299.99,
    salePrice: 1199.99,
    currency: 'USD',
    inventory: 50,
    categories: ['electronics', 'computers'],
    tags: ['laptop', 'gaming', 'professional'],
    images: [
      'https://example.com/techgear-laptop-1.jpg',
      'https://example.com/techgear-laptop-2.jpg',
    ],
    specifications: {
      processor: 'Intel Core i7',
      memory: '16GB RAM',
      storage: '512GB SSD',
      display: '15.6-inch 4K',
      battery: '8 hours',
    },
    brandId: '1', // TechGear - Changed to string to match entity type
    merchantId: '1', // ElectroMart - Changed to string to match entity type
    rating: 4.8,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
  },
  {
    sku: 'TG-PHONE-001',
    title: 'TechGear Smartphone X',
    description: 'Next-generation smartphone with advanced features',
    price: 899.99,
    salePrice: null,
    currency: 'USD',
    inventory: 75,
    categories: ['electronics', 'phones'],
    tags: ['smartphone', 'android', 'camera'],
    images: [
      'https://example.com/techgear-phone-1.jpg',
      'https://example.com/techgear-phone-2.jpg',
    ],
    specifications: {
      processor: 'Snapdragon 8 Gen 2',
      memory: '8GB RAM',
      storage: '256GB',
      display: '6.5-inch AMOLED',
      camera: '48MP main + 12MP ultra-wide',
    },
    brandId: '1', // TechGear
    merchantId: '1', // ElectroMart
    rating: 4.7,
    reviewCount: 85,
    isActive: true,
    isFeatured: false,
  },
  {
    sku: 'TG-EARBUDS-001',
    title: 'TechGear Wireless Earbuds',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 149.99,
    salePrice: 129.99,
    currency: 'USD',
    inventory: 100,
    categories: ['electronics', 'audio'],
    tags: ['earbuds', 'wireless', 'noise-cancellation'],
    images: [
      'https://example.com/techgear-earbuds-1.jpg',
      'https://example.com/techgear-earbuds-2.jpg',
    ],
    specifications: {
      batteryLife: '8 hours (30 with case)',
      connectivity: 'Bluetooth 5.2',
      noiseReduction: 'Active Noise Cancellation',
      waterResistance: 'IPX4',
    },
    brandId: '1', // TechGear
    merchantId: '1', // ElectroMart
    rating: 4.6,
    reviewCount: 210,
    isActive: true,
    isFeatured: true,
  },

  // FashionForward products
  {
    sku: 'FF-TSHIRT-001',
    title: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt',
    price: 29.99,
    salePrice: null,
    currency: 'USD',
    inventory: 200,
    categories: ['clothing', 'tops'],
    tags: ['t-shirt', 'organic', 'sustainable'],
    images: ['https://example.com/ff-tshirt-1.jpg', 'https://example.com/ff-tshirt-2.jpg'],
    specifications: {
      material: '100% Organic Cotton',
      fit: 'Regular',
      care: 'Machine wash cold',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy', 'Green'],
    },
    brandId: '2', // FashionForward
    merchantId: '2', // Fashion Emporium
    rating: 4.5,
    reviewCount: 180,
    isActive: true,
    isFeatured: false,
  },
  {
    sku: 'FF-JEANS-001',
    title: 'Recycled Denim Jeans',
    description: 'Stylish jeans made from recycled denim',
    price: 79.99,
    salePrice: 59.99,
    currency: 'USD',
    inventory: 150,
    categories: ['clothing', 'bottoms'],
    tags: ['jeans', 'denim', 'recycled', 'sustainable'],
    images: ['https://example.com/ff-jeans-1.jpg', 'https://example.com/ff-jeans-2.jpg'],
    specifications: {
      material: '80% Recycled Denim, 20% Organic Cotton',
      fit: 'Slim',
      care: 'Machine wash cold, line dry',
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Blue', 'Black', 'Grey'],
    },
    brandId: '2', // FashionForward
    merchantId: '2', // Fashion Emporium
    rating: 4.7,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
  },
  {
    sku: 'FF-DRESS-001',
    title: 'Summer Floral Dress',
    description: 'Light and breezy summer dress with floral pattern',
    price: 59.99,
    salePrice: null,
    currency: 'USD',
    inventory: 80,
    categories: ['clothing', 'dresses'],
    tags: ['dress', 'summer', 'floral', 'women'],
    images: ['https://example.com/ff-dress-1.jpg', 'https://example.com/ff-dress-2.jpg'],
    specifications: {
      material: '100% Sustainable Viscose',
      fit: 'Regular',
      care: 'Hand wash cold',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Floral Print'],
    },
    brandId: '2', // FashionForward
    merchantId: '2', // Fashion Emporium
    rating: 4.8,
    reviewCount: 95,
    isActive: true,
    isFeatured: true,
  },

  // HomeStyle products
  {
    sku: 'HS-SOFA-001',
    title: 'Modern Sectional Sofa',
    description: 'Elegant and comfortable sectional sofa for your living room',
    price: 1299.99,
    salePrice: 999.99,
    currency: 'USD',
    inventory: 20,
    categories: ['furniture', 'living room'],
    tags: ['sofa', 'sectional', 'modern'],
    images: ['https://example.com/hs-sofa-1.jpg', 'https://example.com/hs-sofa-2.jpg'],
    specifications: {
      material: 'Upholstered with premium fabric',
      dimensions: '110" W x 85" D x 33" H',
      assembly: 'Required',
      colors: ['Grey', 'Beige', 'Blue'],
    },
    brandId: '3', // HomeStyle
    merchantId: '3', // Home & Beyond
    rating: 4.6,
    reviewCount: 45,
    isActive: true,
    isFeatured: true,
  },
  {
    sku: 'HS-LAMP-001',
    title: 'Ceramic Table Lamp',
    description: 'Handcrafted ceramic table lamp with linen shade',
    price: 129.99,
    salePrice: null,
    currency: 'USD',
    inventory: 50,
    categories: ['home decor', 'lighting'],
    tags: ['lamp', 'ceramic', 'table lamp'],
    images: ['https://example.com/hs-lamp-1.jpg', 'https://example.com/hs-lamp-2.jpg'],
    specifications: {
      material: 'Ceramic base with linen shade',
      dimensions: '15" H x 10" W',
      bulbType: 'E26, max 60W',
      colors: ['White', 'Blue', 'Green'],
    },
    brandId: '3', // HomeStyle
    merchantId: '3', // Home & Beyond
    rating: 4.4,
    reviewCount: 68,
    isActive: true,
    isFeatured: false,
  },
  {
    sku: 'HS-RUG-001',
    title: 'Handwoven Wool Rug',
    description: 'Beautiful handwoven wool rug with geometric pattern',
    price: 349.99,
    salePrice: 299.99,
    currency: 'USD',
    inventory: 30,
    categories: ['home decor', 'rugs'],
    tags: ['rug', 'wool', 'handwoven'],
    images: ['https://example.com/hs-rug-1.jpg', 'https://example.com/hs-rug-2.jpg'],
    specifications: {
      material: '100% Wool',
      dimensions: "8' x 10'",
      pile: 'Medium',
      colors: ['Multicolor', 'Blue/Grey', 'Earth Tones'],
    },
    brandId: '3', // HomeStyle
    merchantId: '3', // Home & Beyond
    rating: 4.9,
    reviewCount: 37,
    isActive: true,
    isFeatured: true,
  },

  // SportsPro products
  {
    sku: 'SP-SHOES-001',
    title: 'Performance Running Shoes',
    description: 'Lightweight and responsive running shoes for serious runners',
    price: 129.99,
    salePrice: 99.99,
    currency: 'USD',
    inventory: 100,
    categories: ['sports', 'footwear'],
    tags: ['running', 'shoes', 'performance'],
    images: ['https://example.com/sp-shoes-1.jpg', 'https://example.com/sp-shoes-2.jpg'],
    specifications: {
      material: 'Breathable mesh upper, rubber sole',
      weight: '8.5 oz',
      drop: '8mm',
      sizes: ['7', '8', '9', '10', '11', '12'],
      colors: ['Black/Red', 'Blue/White', 'Grey/Yellow'],
    },
    brandId: '4', // SportsPro
    merchantId: '4', // Active Life Store
    rating: 4.7,
    reviewCount: 156,
    isActive: true,
    isFeatured: true,
  },
  {
    sku: 'SP-JACKET-001',
    title: 'Waterproof Hiking Jacket',
    description: 'Durable waterproof jacket for hiking and outdoor activities',
    price: 179.99,
    salePrice: null,
    currency: 'USD',
    inventory: 75,
    categories: ['outdoor', 'clothing'],
    tags: ['jacket', 'hiking', 'waterproof'],
    images: ['https://example.com/sp-jacket-1.jpg', 'https://example.com/sp-jacket-2.jpg'],
    specifications: {
      material: '3-layer waterproof fabric',
      waterproofRating: '20,000mm',
      breathability: '15,000g/m²/24h',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Red', 'Green', 'Black'],
    },
    brandId: '4', // SportsPro
    merchantId: '4', // Active Life Store
    rating: 4.8,
    reviewCount: 92,
    isActive: true,
    isFeatured: false,
  },
  {
    sku: 'SP-BIKE-001',
    title: 'Mountain Bike Pro',
    description: 'Professional mountain bike for trail riding and competitions',
    price: 1499.99,
    salePrice: 1299.99,
    currency: 'USD',
    inventory: 15,
    categories: ['sports', 'cycling'],
    tags: ['bike', 'mountain bike', 'cycling'],
    images: ['https://example.com/sp-bike-1.jpg', 'https://example.com/sp-bike-2.jpg'],
    specifications: {
      frame: 'Aluminum alloy',
      suspension: 'Front and rear suspension',
      gears: '21-speed Shimano',
      brakes: 'Hydraulic disc brakes',
      wheelSize: '29 inch',
    },
    brandId: '4', // SportsPro
    merchantId: '4', // Active Life Store
    rating: 4.9,
    reviewCount: 28,
    isActive: true,
    isFeatured: true,
  },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('SeedScript');

  try {
    logger.log('Starting database seeding...');

    // Get repositories
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const brandRepository = app.get<Repository<Brand>>(getRepositoryToken(Brand));
    const merchantRepository = app.get<Repository<Merchant>>(getRepositoryToken(Merchant));
    const productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));
    const elasticsearchIndexingService = app.get(ElasticsearchIndexingService);

    // Get the database connection
    const connection = app.get('DATABASE_CONNECTION');

    // Clear existing data with proper handling of foreign key constraints
    logger.log('Clearing existing data...');

    // Disable foreign key constraints
    await connection.query('SET CONSTRAINTS ALL DEFERRED');

    // Delete data in reverse order of dependencies
    await connection.query('DELETE FROM product');
    await connection.query('DELETE FROM merchant');
    await connection.query('DELETE FROM brand');
    await connection.query('DELETE FROM "user"');

    // Re-enable foreign key constraints
    await connection.query('SET CONSTRAINTS ALL IMMEDIATE');

    // Seed users
    logger.log('Seeding users...');
    const createdUsers = await userRepository.save(users);
    logger.log(`Created ${createdUsers.length} users`);

    // Seed brands
    logger.log('Seeding brands...');
    const createdBrands = await brandRepository.save(brands);
    logger.log(`Created ${createdBrands.length} brands`);

    // Seed merchants
    logger.log('Seeding merchants...');
    const createdMerchants = await merchantRepository.save(merchants);
    logger.log(`Created ${createdMerchants.length} merchants`);

    // Seed products
    logger.log('Seeding products...');
    const createdProducts = await productRepository.save(products);
    logger.log(`Created ${createdProducts.length} products`);

    // Index data in Elasticsearch
    logger.log('Indexing data in Elasticsearch...');
    try {
      // First, check if Elasticsearch is accessible
      const elasticsearchService = app.get(ElasticsearchService);
      let isElasticsearchRunning = false;
      try {
        // Try to check if indices exist to determine if Elasticsearch is running
        await elasticsearchService.indexExists('test');
        isElasticsearchRunning = true;
        logger.log('Successfully connected to Elasticsearch');
      } catch (error) {
        logger.error('Error checking Elasticsearch status:', error.message);
      }

      if (!isElasticsearchRunning) {
        logger.error('Elasticsearch is not running. Indexing will be skipped.');
        return;
      }

      logger.log('Elasticsearch is running. Proceeding with indexing...');

      // Clear existing indices to start fresh
      logger.log('Clearing existing indices...');
      for (const index of ['products', 'merchants', 'brands']) {
        const exists = await elasticsearchService.indexExists(index);
        if (exists) {
          logger.log(`Deleting index: ${index}`);
          await elasticsearchService.deleteIndex(index);
        }

        // Create index with proper mappings
        logger.log(`Creating index: ${index}`);
        await elasticsearchService.createIndex(index);
      }

      // Index products
      logger.log(`Indexing ${createdProducts.length} products...`);
      for (const product of createdProducts) {
        try {
          // Use the ElasticsearchService directly to index products
          await elasticsearchService.indexDocument(
            'products',
            product.id,
            {
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              images: product.images,
              thumbnail: product.thumbnail,
              categories: product.categories,
              tags: product.tags,
              merchantId: product.merchantId,
              brandName: product.brandName,
              isActive: product.isActive,
              inStock: product.inStock,
              quantity: product.quantity,
              values: product.values,
              externalId: product.externalId,
              externalSource: product.externalSource,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            },
            true, // refresh
          );
          logger.log(`Indexed product: ${product.title} (${product.id})`);
        } catch (error) {
          logger.error(`Failed to index product ${product.id}: ${error.message}`);
        }
      }

      // Index merchants
      logger.log(`Indexing ${createdMerchants.length} merchants...`);
      for (const merchant of createdMerchants) {
        try {
          // Use the ElasticsearchService directly to index merchants
          await elasticsearchService.indexDocument(
            'merchants',
            merchant.id,
            {
              id: merchant.id,
              name: merchant.name,
              description: merchant.description,
              address: merchant.address,
              logo: merchant.logo,
              website: merchant.website,
              contactEmail: merchant.contactEmail,
              contactPhone: merchant.contactPhone,
              categories: merchant.categories,
              values: merchant.values,
              isVerified: merchant.isVerified,
              createdAt: merchant.createdAt,
              updatedAt: merchant.updatedAt,
            },
            true, // refresh
          );
          logger.log(`Indexed merchant: ${merchant.name} (${merchant.id})`);
        } catch (error) {
          logger.error(`Failed to index merchant ${merchant.id}: ${error.message}`);
        }
      }

      // Index brands
      logger.log(`Indexing ${createdBrands.length} brands...`);
      for (const brand of createdBrands) {
        try {
          // Use the ElasticsearchService directly to index brands
          await elasticsearchService.indexDocument(
            'brands',
            brand.id,
            {
              id: brand.id,
              name: brand.name,
              description: brand.description,
              logo: brand.logo,
              website: brand.website,
              values: brand.values,
              isActive: brand.isActive,
              createdAt: brand.createdAt,
              updatedAt: brand.updatedAt,
            },
            true, // refresh
          );
          logger.log(`Indexed brand: ${brand.name} (${brand.id})`);
        } catch (error) {
          logger.error(`Failed to index brand ${brand.id}: ${error.message}`);
        }
      }

      // Refresh indices to make the documents searchable immediately
      logger.log('Refreshing indices...');
      for (const index of ['products', 'merchants', 'brands']) {
        await elasticsearchService.refreshIndex(index);
      }

      logger.log('Elasticsearch indexing completed successfully!');
    } catch (error) {
      logger.error(`Error indexing data in Elasticsearch: ${error.message}`);
      logger.error(error.stack);
      // Continue with the script despite indexing errors
    }

    logger.log('Elasticsearch indexing complete');

    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error(`Error during seeding: ${error.message}`, error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
