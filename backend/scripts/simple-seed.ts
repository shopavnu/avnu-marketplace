import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';

/**
 * A simple seed script that directly inserts data using SQL queries
 * to avoid TypeScript type issues with the entity repositories.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('SimpleSeedScript');

  try {
    logger.log('Starting database seeding...');

    // Get database connection
    const connection = getConnection();

    // Disable foreign key constraints temporarily
    await connection.query('SET session_replication_role = replica');

    // Clear existing data
    logger.log('Clearing existing data...');
    await connection.query('TRUNCATE TABLE product CASCADE');
    await connection.query('TRUNCATE TABLE merchant CASCADE');
    await connection.query('TRUNCATE TABLE brand CASCADE');
    await connection.query('TRUNCATE TABLE "user" CASCADE');

    // Seed users
    logger.log('Seeding users...');
    await connection.query(`
      INSERT INTO "user" (id, email, "firstName", "lastName", password, role, "isEmailVerified", interests)
      VALUES 
        (gen_random_uuid(), 'admin@example.com', 'Admin', 'User', 'password123', 'ADMIN', true, ARRAY['fashion', 'technology', 'home decor']),
        (gen_random_uuid(), 'merchant@example.com', 'Merchant', 'User', 'password123', 'MERCHANT', true, ARRAY['fashion', 'sports']),
        (gen_random_uuid(), 'user@example.com', 'Regular', 'User', 'password123', 'USER', true, ARRAY['electronics', 'books', 'outdoor'])
    `);

    // Seed brands
    logger.log('Seeding brands...');
    await connection.query(`
      INSERT INTO brand (id, name, description, logo, website, "foundedYear", values, categories)
      VALUES 
        (gen_random_uuid(), 'TechGear', 'High-quality tech products for everyday use', 'https://example.com/techgear-logo.png', 'https://techgear.example.com', 2010, ARRAY['innovation', 'quality', 'sustainability'], ARRAY['electronics', 'accessories']),
        (gen_random_uuid(), 'FashionForward', 'Trendy and sustainable fashion for all', 'https://example.com/fashionforward-logo.png', 'https://fashionforward.example.com', 2015, ARRAY['sustainability', 'ethical production', 'style'], ARRAY['clothing', 'accessories']),
        (gen_random_uuid(), 'HomeStyle', 'Beautiful home decor and furniture', 'https://example.com/homestyle-logo.png', 'https://homestyle.example.com', 2008, ARRAY['quality', 'design', 'comfort'], ARRAY['home decor', 'furniture']),
        (gen_random_uuid(), 'SportsPro', 'Professional sports equipment and apparel', 'https://example.com/sportspro-logo.png', 'https://sportspro.example.com', 2005, ARRAY['performance', 'durability', 'innovation'], ARRAY['sports', 'fitness', 'outdoor'])
    `);

    // Get brand IDs for reference
    const brandIds = await connection.query(`SELECT id, name FROM brand`);
    const brandIdMap = brandIds.reduce((map, brand) => {
      map[brand.name] = brand.id;
      return map;
    }, {});

    // Seed merchants
    logger.log('Seeding merchants...');
    await connection.query(`
      INSERT INTO merchant (id, name, description, logo, website, "contactEmail", "contactPhone", address, "isVerified", categories, values)
      VALUES 
        (gen_random_uuid(), 'ElectroMart', 'Your one-stop shop for electronics', 'https://example.com/electromart-logo.png', 'https://electromart.example.com', 'contact@electromart.example.com', '+1234567890', '123 Tech Street, Silicon Valley, CA', true, ARRAY['electronics', 'gadgets', 'accessories'], ARRAY['customer service', 'quality', 'affordability']),
        (gen_random_uuid(), 'Fashion Emporium', 'Trendy fashion for all seasons', 'https://example.com/fashion-emporium-logo.png', 'https://fashion-emporium.example.com', 'contact@fashion-emporium.example.com', '+1987654321', '456 Style Avenue, New York, NY', true, ARRAY['clothing', 'shoes', 'accessories'], ARRAY['style', 'sustainability', 'inclusivity']),
        (gen_random_uuid(), 'Home & Beyond', 'Everything you need for your home', 'https://example.com/home-beyond-logo.png', 'https://home-beyond.example.com', 'contact@home-beyond.example.com', '+1122334455', '789 Decor Boulevard, Los Angeles, CA', true, ARRAY['home decor', 'furniture', 'kitchen'], ARRAY['quality', 'design', 'customer satisfaction']),
        (gen_random_uuid(), 'Active Life Store', 'Gear up for your active lifestyle', 'https://example.com/active-life-logo.png', 'https://active-life.example.com', 'contact@active-life.example.com', '+1567891234', '321 Fitness Road, Denver, CO', true, ARRAY['sports', 'fitness', 'outdoor'], ARRAY['performance', 'health', 'adventure'])
    `);

    // Get merchant IDs for reference
    const merchantIds = await connection.query(`SELECT id, name FROM merchant`);
    const merchantIdMap = merchantIds.reduce((map, merchant) => {
      map[merchant.name] = merchant.id;
      return map;
    }, {});

    // Seed products
    logger.log('Seeding products...');

    // TechGear products
    await connection.query(
      `
      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")
      VALUES 
        (gen_random_uuid(), 'TG-LAPTOP-001', 'TechGear Pro Laptop', 'Powerful laptop for professionals and gamers', 1299.99, 1199.99, 'USD', 50, ARRAY['electronics', 'computers'], ARRAY['laptop', 'gaming', 'professional'], ARRAY['https://example.com/techgear-laptop-1.jpg', 'https://example.com/techgear-laptop-2.jpg'], '{"processor": "Intel Core i7", "memory": "16GB RAM", "storage": "512GB SSD", "display": "15.6-inch 4K", "battery": "8 hours"}', $1, $2, 4.8, 120, true, true),
        (gen_random_uuid(), 'TG-PHONE-001', 'TechGear Smartphone X', 'Next-generation smartphone with advanced features', 899.99, NULL, 'USD', 75, ARRAY['electronics', 'phones'], ARRAY['smartphone', 'android', 'camera'], ARRAY['https://example.com/techgear-phone-1.jpg', 'https://example.com/techgear-phone-2.jpg'], '{"processor": "Snapdragon 8 Gen 2", "memory": "8GB RAM", "storage": "256GB", "display": "6.5-inch AMOLED", "camera": "48MP main + 12MP ultra-wide"}', $1, $2, 4.7, 85, true, false),
        (gen_random_uuid(), 'TG-EARBUDS-001', 'TechGear Wireless Earbuds', 'Premium wireless earbuds with noise cancellation', 149.99, 129.99, 'USD', 100, ARRAY['electronics', 'audio'], ARRAY['earbuds', 'wireless', 'noise-cancellation'], ARRAY['https://example.com/techgear-earbuds-1.jpg', 'https://example.com/techgear-earbuds-2.jpg'], '{"batteryLife": "8 hours (30 with case)", "connectivity": "Bluetooth 5.2", "noiseReduction": "Active Noise Cancellation", "waterResistance": "IPX4"}', $1, $2, 4.6, 210, true, true)
    `,
      [brandIdMap['TechGear'], merchantIdMap['ElectroMart']],
    );

    // FashionForward products
    await connection.query(
      `
      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")
      VALUES 
        (gen_random_uuid(), 'FF-TSHIRT-001', 'Organic Cotton T-Shirt', 'Comfortable and sustainable organic cotton t-shirt', 29.99, NULL, 'USD', 200, ARRAY['clothing', 'tops'], ARRAY['t-shirt', 'organic', 'sustainable'], ARRAY['https://example.com/ff-tshirt-1.jpg', 'https://example.com/ff-tshirt-2.jpg'], '{"material": "100% Organic Cotton", "fit": "Regular", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL"], "colors": ["Black", "White", "Navy", "Green"]}', $1, $2, 4.5, 180, true, false),
        (gen_random_uuid(), 'FF-JEANS-001', 'Recycled Denim Jeans', 'Stylish jeans made from recycled denim', 79.99, 59.99, 'USD', 150, ARRAY['clothing', 'bottoms'], ARRAY['jeans', 'denim', 'recycled', 'sustainable'], ARRAY['https://example.com/ff-jeans-1.jpg', 'https://example.com/ff-jeans-2.jpg'], '{"material": "80% Recycled Denim, 20% Organic Cotton", "fit": "Slim", "care": "Machine wash cold, line dry", "sizes": ["28", "30", "32", "34", "36"], "colors": ["Blue", "Black", "Grey"]}', $1, $2, 4.7, 120, true, true),
        (gen_random_uuid(), 'FF-DRESS-001', 'Summer Floral Dress', 'Light and breezy summer dress with floral pattern', 59.99, NULL, 'USD', 80, ARRAY['clothing', 'dresses'], ARRAY['dress', 'summer', 'floral', 'women'], ARRAY['https://example.com/ff-dress-1.jpg', 'https://example.com/ff-dress-2.jpg'], '{"material": "100% Sustainable Viscose", "fit": "Regular", "care": "Hand wash cold", "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["Floral Print"]}', $1, $2, 4.8, 95, true, true)
    `,
      [brandIdMap['FashionForward'], merchantIdMap['Fashion Emporium']],
    );

    // HomeStyle products
    await connection.query(
      `
      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")
      VALUES 
        (gen_random_uuid(), 'HS-SOFA-001', 'Modern Sectional Sofa', 'Elegant and comfortable sectional sofa for your living room', 1299.99, 999.99, 'USD', 20, ARRAY['furniture', 'living room'], ARRAY['sofa', 'sectional', 'modern'], ARRAY['https://example.com/hs-sofa-1.jpg', 'https://example.com/hs-sofa-2.jpg'], '{"material": "Upholstered with premium fabric", "dimensions": "110\\" W x 85\\" D x 33\\" H", "assembly": "Required", "colors": ["Grey", "Beige", "Blue"]}', $1, $2, 4.6, 45, true, true),
        (gen_random_uuid(), 'HS-LAMP-001', 'Ceramic Table Lamp', 'Handcrafted ceramic table lamp with linen shade', 129.99, NULL, 'USD', 50, ARRAY['home decor', 'lighting'], ARRAY['lamp', 'ceramic', 'table lamp'], ARRAY['https://example.com/hs-lamp-1.jpg', 'https://example.com/hs-lamp-2.jpg'], '{"material": "Ceramic base with linen shade", "dimensions": "15\\" H x 10\\" W", "bulbType": "E26, max 60W", "colors": ["White", "Blue", "Green"]}', $1, $2, 4.4, 68, true, false),
        (gen_random_uuid(), 'HS-RUG-001', 'Handwoven Wool Rug', 'Beautiful handwoven wool rug with geometric pattern', 349.99, 299.99, 'USD', 30, ARRAY['home decor', 'rugs'], ARRAY['rug', 'wool', 'handwoven'], ARRAY['https://example.com/hs-rug-1.jpg', 'https://example.com/hs-rug-2.jpg'], '{"material": "100% Wool", "dimensions": "8\\' x 10\\'", "pile": "Medium", "colors": ["Multicolor", "Blue/Grey", "Earth Tones"]}', $1, $2, 4.9, 37, true, true)
    `,
      [brandIdMap['HomeStyle'], merchantIdMap['Home & Beyond']],
    );

    // SportsPro products
    await connection.query(
      `
      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")
      VALUES 
        (gen_random_uuid(), 'SP-SHOES-001', 'Performance Running Shoes', 'Lightweight and responsive running shoes for serious runners', 129.99, 99.99, 'USD', 100, ARRAY['sports', 'footwear'], ARRAY['running', 'shoes', 'performance'], ARRAY['https://example.com/sp-shoes-1.jpg', 'https://example.com/sp-shoes-2.jpg'], '{"material": "Breathable mesh upper, rubber sole", "weight": "8.5 oz", "drop": "8mm", "sizes": ["7", "8", "9", "10", "11", "12"], "colors": ["Black/Red", "Blue/White", "Grey/Yellow"]}', $1, $2, 4.7, 156, true, true),
        (gen_random_uuid(), 'SP-JACKET-001', 'Waterproof Hiking Jacket', 'Durable waterproof jacket for hiking and outdoor activities', 179.99, NULL, 'USD', 75, ARRAY['outdoor', 'clothing'], ARRAY['jacket', 'hiking', 'waterproof'], ARRAY['https://example.com/sp-jacket-1.jpg', 'https://example.com/sp-jacket-2.jpg'], '{"material": "3-layer waterproof fabric", "waterproofRating": "20,000mm", "breathability": "15,000g/m²/24h", "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Red", "Green", "Black"]}', $1, $2, 4.8, 92, true, false),
        (gen_random_uuid(), 'SP-BIKE-001', 'Mountain Bike Pro', 'Professional mountain bike for trail riding and competitions', 1499.99, 1299.99, 'USD', 15, ARRAY['sports', 'cycling'], ARRAY['bike', 'mountain bike', 'cycling'], ARRAY['https://example.com/sp-bike-1.jpg', 'https://example.com/sp-bike-2.jpg'], '{"frame": "Aluminum alloy", "suspension": "Front and rear suspension", "gears": "21-speed Shimano", "brakes": "Hydraulic disc brakes", "wheelSize": "29 inch"}', $1, $2, 4.9, 28, true, true)
    `,
      [brandIdMap['SportsPro'], merchantIdMap['Active Life Store']],
    );

    // Add some clothing items with "shirt" in the name for testing search
    await connection.query(
      `
      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")
      VALUES 
        (gen_random_uuid(), 'FF-SHIRT-001', 'Classic Button-Down Shirt', 'Timeless button-down shirt for any occasion', 49.99, NULL, 'USD', 150, ARRAY['clothing', 'tops'], ARRAY['shirt', 'button-down', 'classic'], ARRAY['https://example.com/ff-shirt-1.jpg', 'https://example.com/ff-shirt-2.jpg'], '{"material": "100% Cotton", "fit": "Regular", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Blue", "Black"]}', $1, $2, 4.6, 210, true, true),
        (gen_random_uuid(), 'FF-SHIRT-002', 'Casual Linen Shirt', 'Breathable linen shirt perfect for summer', 59.99, 44.99, 'USD', 120, ARRAY['clothing', 'tops'], ARRAY['shirt', 'linen', 'summer'], ARRAY['https://example.com/ff-linen-1.jpg', 'https://example.com/ff-linen-2.jpg'], '{"material": "100% Linen", "fit": "Relaxed", "care": "Machine wash cold, tumble dry low", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Beige", "Light Blue"]}', $1, $2, 4.7, 180, true, false),
        (gen_random_uuid(), 'SP-SHIRT-001', 'Performance Athletic Shirt', 'Moisture-wicking athletic shirt for intense workouts', 39.99, NULL, 'USD', 200, ARRAY['sports', 'clothing'], ARRAY['shirt', 'athletic', 'performance', 'workout'], ARRAY['https://example.com/sp-athletic-1.jpg', 'https://example.com/sp-athletic-2.jpg'], '{"material": "88% Polyester, 12% Elastane", "fit": "Athletic", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Black", "Blue", "Red", "Grey"]}', $3, $4, 4.8, 250, true, true)
    `,
      [
        brandIdMap['FashionForward'],
        merchantIdMap['Fashion Emporium'],
        brandIdMap['SportsPro'],
        merchantIdMap['Active Life Store'],
      ],
    );

    // Re-enable foreign key constraints
    await connection.query('SET session_replication_role = DEFAULT');

    // Index data in Elasticsearch (if available)
    logger.log('Attempting to index data in Elasticsearch...');
    try {
      // Try to get the ElasticsearchIndexingService
      const elasticsearchModule = app.get('ElasticsearchModule');
      if (elasticsearchModule) {
        logger.log('Elasticsearch module found, indexing data...');
        // This is a simplified approach - in a real application, you would need to
        // properly call the indexing methods of the ElasticsearchIndexingService
        await connection.query('SELECT elasticsearch_index_all()');
        logger.log('Elasticsearch indexing complete');
      } else {
        logger.log('Elasticsearch module not found, skipping indexing');
      }
    } catch (error) {
      logger.warn(`Elasticsearch indexing skipped: ${error.message}`);
    }

    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error(`Error during seeding: ${error.message}`, error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
