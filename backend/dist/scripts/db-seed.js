"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const app_module_1 = require("../src/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('DatabaseSeed');
    try {
        logger.log('Starting database seeding...');
        const dataSource = app.get(typeorm_1.DataSource);
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            logger.log('Database connection initialized');
        }
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            logger.log('Clearing existing data...');
            await queryRunner.query('SET CONSTRAINTS ALL DEFERRED');
            await queryRunner.query('DELETE FROM products');
            await queryRunner.query('DELETE FROM merchants');
            await queryRunner.query('DELETE FROM brands');
            await queryRunner.query('DELETE FROM users');
            logger.log('Seeding users...');
            await queryRunner.query(`
        INSERT INTO users (id, email, "firstName", "lastName", password, role, "isEmailVerified", interests)
        VALUES 
          ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin', 'User', 'password123', 'ADMIN', true, ARRAY['fashion', 'technology', 'home decor']),
          ('22222222-2222-2222-2222-222222222222', 'merchant@example.com', 'Merchant', 'User', 'password123', 'MERCHANT', true, ARRAY['fashion', 'sports']),
          ('33333333-3333-3333-3333-333333333333', 'user@example.com', 'Regular', 'User', 'password123', 'USER', true, ARRAY['electronics', 'books', 'outdoor'])
      `);
            logger.log('Seeding brands...');
            await queryRunner.query(`
        INSERT INTO brands (id, name, description, logo, website, "foundedYear", values, categories)
        VALUES 
          ('11111111-1111-1111-1111-111111111111', 'TechGear', 'High-quality tech products for everyday use', 'https://example.com/techgear-logo.png', 'https://techgear.example.com', 2010, ARRAY['innovation', 'quality', 'sustainability'], ARRAY['electronics', 'accessories']),
          ('22222222-2222-2222-2222-222222222222', 'FashionForward', 'Trendy and sustainable fashion for all', 'https://example.com/fashionforward-logo.png', 'https://fashionforward.example.com', 2015, ARRAY['sustainability', 'ethical production', 'style'], ARRAY['clothing', 'accessories']),
          ('33333333-3333-3333-3333-333333333333', 'HomeStyle', 'Beautiful home decor and furniture', 'https://example.com/homestyle-logo.png', 'https://homestyle.example.com', 2008, ARRAY['quality', 'design', 'comfort'], ARRAY['home decor', 'furniture']),
          ('44444444-4444-4444-4444-444444444444', 'SportsPro', 'Professional sports equipment and apparel', 'https://example.com/sportspro-logo.png', 'https://sportspro.example.com', 2005, ARRAY['performance', 'durability', 'innovation'], ARRAY['sports', 'fitness', 'outdoor'])
      `);
            logger.log('Seeding merchants...');
            await queryRunner.query(`
        INSERT INTO merchants (id, name, description, logo, website, categories, values, rating, "reviewCount", "productCount", "isActive", popularity)
        VALUES 
          ('11111111-1111-1111-1111-111111111111', 'ElectroMart', 'Your one-stop shop for electronics', 'https://example.com/electromart-logo.png', 'https://electromart.example.com', ARRAY['electronics', 'gadgets', 'accessories'], ARRAY['customer service', 'quality', 'affordability'], 4.5, 120, 25, true, 85.5),
          ('22222222-2222-2222-2222-222222222222', 'Fashion Emporium', 'Trendy fashion for all seasons', 'https://example.com/fashion-emporium-logo.png', 'https://fashion-emporium.example.com', ARRAY['clothing', 'shoes', 'accessories'], ARRAY['style', 'sustainability', 'inclusivity'], 4.7, 180, 40, true, 92.3),
          ('33333333-3333-3333-3333-333333333333', 'Home & Beyond', 'Everything you need for your home', 'https://example.com/home-beyond-logo.png', 'https://home-beyond.example.com', ARRAY['home decor', 'furniture', 'kitchen'], ARRAY['quality', 'design', 'customer satisfaction'], 4.6, 150, 35, true, 88.7),
          ('44444444-4444-4444-4444-444444444444', 'Active Life Store', 'Gear up for your active lifestyle', 'https://example.com/active-life-logo.png', 'https://active-life.example.com', ARRAY['sports', 'fitness', 'outdoor'], ARRAY['performance', 'health', 'adventure'], 4.8, 200, 30, true, 90.1)
      `);
            logger.log('Seeding products...');
            await queryRunner.query(`
        INSERT INTO products (id, title, description, price, "compareAtPrice", images, thumbnail, categories, tags, "merchantId", "brandName", "isActive", "inStock", quantity, values, "externalId", "externalSource")
        VALUES 
          ('11111111-1111-1111-1111-111111111111', 'TechGear Pro Laptop', 'Powerful laptop for professionals and gamers', 1299.99, 1399.99, ARRAY['https://example.com/techgear-laptop-1.jpg', 'https://example.com/techgear-laptop-2.jpg'], 'https://example.com/techgear-laptop-thumb.jpg', ARRAY['electronics', 'computers'], ARRAY['laptop', 'gaming', 'professional'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 50, ARRAY['premium', 'performance'], 'TG-LAPTOP-001', 'seed-script'),
          
          ('22222222-2222-2222-2222-222222222222', 'TechGear Smartphone X', 'Next-generation smartphone with advanced features', 899.99, 999.99, ARRAY['https://example.com/techgear-phone-1.jpg', 'https://example.com/techgear-phone-2.jpg'], 'https://example.com/techgear-phone-thumb.jpg', ARRAY['electronics', 'phones'], ARRAY['smartphone', 'android', 'camera'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 75, ARRAY['premium', 'mobile'], 'TG-PHONE-001', 'seed-script'),
          
          ('33333333-3333-3333-3333-333333333333', 'TechGear Wireless Earbuds', 'Premium wireless earbuds with noise cancellation', 149.99, 179.99, ARRAY['https://example.com/techgear-earbuds-1.jpg', 'https://example.com/techgear-earbuds-2.jpg'], 'https://example.com/techgear-earbuds-thumb.jpg', ARRAY['electronics', 'audio'], ARRAY['earbuds', 'wireless', 'noise-cancellation'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 100, ARRAY['premium', 'audio'], 'TG-EARBUDS-001', 'seed-script')
      `);
            await queryRunner.query(`
        INSERT INTO products (id, title, description, price, "compareAtPrice", images, thumbnail, categories, tags, "merchantId", "brandName", "isActive", "inStock", quantity, values, "externalId", "externalSource")
        VALUES 
          ('44444444-4444-4444-4444-444444444444', 'Organic Cotton T-Shirt', 'Comfortable and sustainable organic cotton t-shirt', 29.99, 34.99, ARRAY['https://example.com/ff-tshirt-1.jpg', 'https://example.com/ff-tshirt-2.jpg'], 'https://example.com/ff-tshirt-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['t-shirt', 'organic', 'sustainable'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 200, ARRAY['sustainable', 'casual'], 'FF-TSHIRT-001', 'seed-script'),
          
          ('55555555-5555-5555-5555-555555555555', 'Recycled Denim Jeans', 'Stylish jeans made from recycled denim', 79.99, 99.99, ARRAY['https://example.com/ff-jeans-1.jpg', 'https://example.com/ff-jeans-2.jpg'], 'https://example.com/ff-jeans-thumb.jpg', ARRAY['clothing', 'bottoms'], ARRAY['jeans', 'denim', 'recycled', 'sustainable'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 150, ARRAY['sustainable', 'trendy'], 'FF-JEANS-001', 'seed-script'),
          
          ('66666666-6666-6666-6666-666666666666', 'Summer Floral Dress', 'Light and breezy summer dress with floral pattern', 59.99, 69.99, ARRAY['https://example.com/ff-dress-1.jpg', 'https://example.com/ff-dress-2.jpg'], 'https://example.com/ff-dress-thumb.jpg', ARRAY['clothing', 'dresses'], ARRAY['dress', 'summer', 'floral', 'women'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 80, ARRAY['seasonal', 'trendy'], 'FF-DRESS-001', 'seed-script')
      `);
            await queryRunner.query(`
        INSERT INTO products (id, title, description, price, "compareAtPrice", images, thumbnail, categories, tags, "merchantId", "brandName", "isActive", "inStock", quantity, values, "externalId", "externalSource")
        VALUES 
          ('77777777-7777-7777-7777-777777777777', 'Modern Sectional Sofa', 'Elegant and comfortable sectional sofa for your living room', 1299.99, 1499.99, ARRAY['https://example.com/hs-sofa-1.jpg', 'https://example.com/hs-sofa-2.jpg'], 'https://example.com/hs-sofa-thumb.jpg', ARRAY['furniture', 'living room'], ARRAY['sofa', 'sectional', 'modern'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 20, ARRAY['premium', 'comfort'], 'HS-SOFA-001', 'seed-script'),
          
          ('88888888-8888-8888-8888-888888888888', 'Ceramic Table Lamp', 'Handcrafted ceramic table lamp with linen shade', 129.99, 149.99, ARRAY['https://example.com/hs-lamp-1.jpg', 'https://example.com/hs-lamp-2.jpg'], 'https://example.com/hs-lamp-thumb.jpg', ARRAY['home decor', 'lighting'], ARRAY['lamp', 'ceramic', 'table lamp'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 50, ARRAY['handcrafted', 'decor'], 'HS-LAMP-001', 'seed-script'),
          
          ('99999999-9999-9999-9999-999999999999', 'Handwoven Wool Rug', 'Beautiful handwoven wool rug with geometric pattern', 349.99, 399.99, ARRAY['https://example.com/hs-rug-1.jpg', 'https://example.com/hs-rug-2.jpg'], 'https://example.com/hs-rug-thumb.jpg', ARRAY['home decor', 'rugs'], ARRAY['rug', 'wool', 'handwoven'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 30, ARRAY['handcrafted', 'premium'], 'HS-RUG-001', 'seed-script')
      `);
            await queryRunner.query(`
        INSERT INTO products (id, title, description, price, "compareAtPrice", images, thumbnail, categories, tags, "merchantId", "brandName", "isActive", "inStock", quantity, values, "externalId", "externalSource")
        VALUES 
          ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Performance Running Shoes', 'Lightweight and responsive running shoes for serious runners', 129.99, 149.99, ARRAY['https://example.com/sp-shoes-1.jpg', 'https://example.com/sp-shoes-2.jpg'], 'https://example.com/sp-shoes-thumb.jpg', ARRAY['sports', 'footwear'], ARRAY['running', 'shoes', 'performance'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 100, ARRAY['performance', 'athletic'], 'SP-SHOES-001', 'seed-script'),
          
          ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Waterproof Hiking Jacket', 'Durable waterproof jacket for hiking and outdoor activities', 179.99, 199.99, ARRAY['https://example.com/sp-jacket-1.jpg', 'https://example.com/sp-jacket-2.jpg'], 'https://example.com/sp-jacket-thumb.jpg', ARRAY['outdoor', 'clothing'], ARRAY['jacket', 'hiking', 'waterproof'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 75, ARRAY['outdoor', 'performance'], 'SP-JACKET-001', 'seed-script'),
          
          ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mountain Bike Pro', 'Professional mountain bike for trail riding and competitions', 1499.99, 1699.99, ARRAY['https://example.com/sp-bike-1.jpg', 'https://example.com/sp-bike-2.jpg'], 'https://example.com/sp-bike-thumb.jpg', ARRAY['sports', 'cycling'], ARRAY['bike', 'mountain bike', 'cycling'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 15, ARRAY['performance', 'professional'], 'SP-BIKE-001', 'seed-script')
      `);
            await queryRunner.query(`
        INSERT INTO products (id, title, description, price, "compareAtPrice", images, thumbnail, categories, tags, "merchantId", "brandName", "isActive", "inStock", quantity, values, "externalId", "externalSource")
        VALUES 
          ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Classic Button-Down Shirt', 'Timeless button-down shirt for any occasion', 49.99, 59.99, ARRAY['https://example.com/ff-shirt-1.jpg', 'https://example.com/ff-shirt-2.jpg'], 'https://example.com/ff-shirt-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['shirt', 'button-down', 'classic'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 150, ARRAY['classic', 'formal'], 'FF-SHIRT-001', 'seed-script'),
          
          ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Casual Linen Shirt', 'Breathable linen shirt perfect for summer', 59.99, 69.99, ARRAY['https://example.com/ff-linen-1.jpg', 'https://example.com/ff-linen-2.jpg'], 'https://example.com/ff-linen-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['shirt', 'linen', 'summer'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 120, ARRAY['casual', 'summer'], 'FF-SHIRT-002', 'seed-script'),
          
          ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Performance Athletic Shirt', 'Moisture-wicking athletic shirt for intense workouts', 39.99, 49.99, ARRAY['https://example.com/sp-athletic-1.jpg', 'https://example.com/sp-athletic-2.jpg'], 'https://example.com/sp-athletic-thumb.jpg', ARRAY['sports', 'clothing'], ARRAY['shirt', 'athletic', 'performance', 'workout'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 200, ARRAY['performance', 'athletic'], 'SP-SHIRT-001', 'seed-script')
      `);
            await queryRunner.commitTransaction();
            logger.log('Database seeding completed successfully!');
            try {
                const elasticsearchService = app.get('ElasticsearchService');
                if (elasticsearchService) {
                    logger.log('Elasticsearch service found, indexing data...');
                }
                else {
                    logger.log('Elasticsearch service not found, skipping indexing');
                }
            }
            catch (error) {
                logger.warn(`Elasticsearch indexing skipped: ${error.message}`);
            }
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger.error(`Error during seeding: ${error.message}`, error.stack);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=db-seed.js.map