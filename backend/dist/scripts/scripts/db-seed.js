'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@nestjs/core');
var common_1 = require('@nestjs/common');
var typeorm_1 = require('typeorm');
var app_module_1 = require('../src/app.module');
/**
 * A direct database seeding script that uses raw SQL queries
 * to avoid TypeScript entity issues.
 */
function bootstrap() {
  return __awaiter(this, void 0, void 0, function () {
    var app, logger, dataSource, queryRunner, elasticsearchService, error_1, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule)];
        case 1:
          app = _a.sent();
          logger = new common_1.Logger('DatabaseSeed');
          _a.label = 2;
        case 2:
          _a.trys.push([2, 27, 28, 30]);
          logger.log('Starting database seeding...');
          dataSource = app.get(typeorm_1.DataSource);
          if (!!dataSource.isInitialized) return [3 /*break*/, 4];
          return [4 /*yield*/, dataSource.initialize()];
        case 3:
          _a.sent();
          logger.log('Database connection initialized');
          _a.label = 4;
        case 4:
          queryRunner = dataSource.createQueryRunner();
          return [4 /*yield*/, queryRunner.connect()];
        case 5:
          _a.sent();
          return [4 /*yield*/, queryRunner.startTransaction()];
        case 6:
          _a.sent();
          _a.label = 7;
        case 7:
          _a.trys.push([7, 22, 24, 26]);
          logger.log('Clearing existing data...');
          // Disable foreign key checks temporarily
          return [4 /*yield*/, queryRunner.query('SET CONSTRAINTS ALL DEFERRED')];
        case 8:
          // Disable foreign key checks temporarily
          _a.sent();
          // Clear tables in reverse dependency order
          return [4 /*yield*/, queryRunner.query('DELETE FROM products')];
        case 9:
          // Clear tables in reverse dependency order
          _a.sent();
          return [4 /*yield*/, queryRunner.query('DELETE FROM merchants')];
        case 10:
          _a.sent();
          return [4 /*yield*/, queryRunner.query('DELETE FROM brands')];
        case 11:
          _a.sent();
          return [4 /*yield*/, queryRunner.query('DELETE FROM users')];
        case 12:
          _a.sent();
          // Seed users
          logger.log('Seeding users...');
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO users (id, email, \"firstName\", \"lastName\", password, role, \"isEmailVerified\", interests)\n        VALUES \n          ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin', 'User', 'password123', 'ADMIN', true, ARRAY['fashion', 'technology', 'home decor']),\n          ('22222222-2222-2222-2222-222222222222', 'merchant@example.com', 'Merchant', 'User', 'password123', 'MERCHANT', true, ARRAY['fashion', 'sports']),\n          ('33333333-3333-3333-3333-333333333333', 'user@example.com', 'Regular', 'User', 'password123', 'USER', true, ARRAY['electronics', 'books', 'outdoor'])\n      ",
            ),
          ];
        case 13:
          _a.sent();
          // Seed brands
          logger.log('Seeding brands...');
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO brands (id, name, description, logo, website, \"foundedYear\", values, categories)\n        VALUES \n          ('11111111-1111-1111-1111-111111111111', 'TechGear', 'High-quality tech products for everyday use', 'https://example.com/techgear-logo.png', 'https://techgear.example.com', 2010, ARRAY['innovation', 'quality', 'sustainability'], ARRAY['electronics', 'accessories']),\n          ('22222222-2222-2222-2222-222222222222', 'FashionForward', 'Trendy and sustainable fashion for all', 'https://example.com/fashionforward-logo.png', 'https://fashionforward.example.com', 2015, ARRAY['sustainability', 'ethical production', 'style'], ARRAY['clothing', 'accessories']),\n          ('33333333-3333-3333-3333-333333333333', 'HomeStyle', 'Beautiful home decor and furniture', 'https://example.com/homestyle-logo.png', 'https://homestyle.example.com', 2008, ARRAY['quality', 'design', 'comfort'], ARRAY['home decor', 'furniture']),\n          ('44444444-4444-4444-4444-444444444444', 'SportsPro', 'Professional sports equipment and apparel', 'https://example.com/sportspro-logo.png', 'https://sportspro.example.com', 2005, ARRAY['performance', 'durability', 'innovation'], ARRAY['sports', 'fitness', 'outdoor'])\n      ",
            ),
          ];
        case 14:
          _a.sent();
          // Seed merchants
          logger.log('Seeding merchants...');
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO merchants (id, name, description, logo, website, categories, values, rating, \"reviewCount\", \"productCount\", \"isActive\", popularity)\n        VALUES \n          ('11111111-1111-1111-1111-111111111111', 'ElectroMart', 'Your one-stop shop for electronics', 'https://example.com/electromart-logo.png', 'https://electromart.example.com', ARRAY['electronics', 'gadgets', 'accessories'], ARRAY['customer service', 'quality', 'affordability'], 4.5, 120, 25, true, 85.5),\n          ('22222222-2222-2222-2222-222222222222', 'Fashion Emporium', 'Trendy fashion for all seasons', 'https://example.com/fashion-emporium-logo.png', 'https://fashion-emporium.example.com', ARRAY['clothing', 'shoes', 'accessories'], ARRAY['style', 'sustainability', 'inclusivity'], 4.7, 180, 40, true, 92.3),\n          ('33333333-3333-3333-3333-333333333333', 'Home & Beyond', 'Everything you need for your home', 'https://example.com/home-beyond-logo.png', 'https://home-beyond.example.com', ARRAY['home decor', 'furniture', 'kitchen'], ARRAY['quality', 'design', 'customer satisfaction'], 4.6, 150, 35, true, 88.7),\n          ('44444444-4444-4444-4444-444444444444', 'Active Life Store', 'Gear up for your active lifestyle', 'https://example.com/active-life-logo.png', 'https://active-life.example.com', ARRAY['sports', 'fitness', 'outdoor'], ARRAY['performance', 'health', 'adventure'], 4.8, 200, 30, true, 90.1)\n      ",
            ),
          ];
        case 15:
          _a.sent();
          // Seed products
          logger.log('Seeding products...');
          // TechGear products
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO products (id, title, description, price, \"compareAtPrice\", images, thumbnail, categories, tags, \"merchantId\", \"brandName\", \"isActive\", \"inStock\", quantity, values, \"externalId\", \"externalSource\")\n        VALUES \n          ('11111111-1111-1111-1111-111111111111', 'TechGear Pro Laptop', 'Powerful laptop for professionals and gamers', 1299.99, 1399.99, ARRAY['https://example.com/techgear-laptop-1.jpg', 'https://example.com/techgear-laptop-2.jpg'], 'https://example.com/techgear-laptop-thumb.jpg', ARRAY['electronics', 'computers'], ARRAY['laptop', 'gaming', 'professional'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 50, ARRAY['premium', 'performance'], 'TG-LAPTOP-001', 'seed-script'),\n          \n          ('22222222-2222-2222-2222-222222222222', 'TechGear Smartphone X', 'Next-generation smartphone with advanced features', 899.99, 999.99, ARRAY['https://example.com/techgear-phone-1.jpg', 'https://example.com/techgear-phone-2.jpg'], 'https://example.com/techgear-phone-thumb.jpg', ARRAY['electronics', 'phones'], ARRAY['smartphone', 'android', 'camera'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 75, ARRAY['premium', 'mobile'], 'TG-PHONE-001', 'seed-script'),\n          \n          ('33333333-3333-3333-3333-333333333333', 'TechGear Wireless Earbuds', 'Premium wireless earbuds with noise cancellation', 149.99, 179.99, ARRAY['https://example.com/techgear-earbuds-1.jpg', 'https://example.com/techgear-earbuds-2.jpg'], 'https://example.com/techgear-earbuds-thumb.jpg', ARRAY['electronics', 'audio'], ARRAY['earbuds', 'wireless', 'noise-cancellation'], '11111111-1111-1111-1111-111111111111', 'TechGear', true, true, 100, ARRAY['premium', 'audio'], 'TG-EARBUDS-001', 'seed-script')\n      ",
            ),
          ];
        case 16:
          // TechGear products
          _a.sent();
          // FashionForward products
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO products (id, title, description, price, \"compareAtPrice\", images, thumbnail, categories, tags, \"merchantId\", \"brandName\", \"isActive\", \"inStock\", quantity, values, \"externalId\", \"externalSource\")\n        VALUES \n          ('44444444-4444-4444-4444-444444444444', 'Organic Cotton T-Shirt', 'Comfortable and sustainable organic cotton t-shirt', 29.99, 34.99, ARRAY['https://example.com/ff-tshirt-1.jpg', 'https://example.com/ff-tshirt-2.jpg'], 'https://example.com/ff-tshirt-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['t-shirt', 'organic', 'sustainable'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 200, ARRAY['sustainable', 'casual'], 'FF-TSHIRT-001', 'seed-script'),\n          \n          ('55555555-5555-5555-5555-555555555555', 'Recycled Denim Jeans', 'Stylish jeans made from recycled denim', 79.99, 99.99, ARRAY['https://example.com/ff-jeans-1.jpg', 'https://example.com/ff-jeans-2.jpg'], 'https://example.com/ff-jeans-thumb.jpg', ARRAY['clothing', 'bottoms'], ARRAY['jeans', 'denim', 'recycled', 'sustainable'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 150, ARRAY['sustainable', 'trendy'], 'FF-JEANS-001', 'seed-script'),\n          \n          ('66666666-6666-6666-6666-666666666666', 'Summer Floral Dress', 'Light and breezy summer dress with floral pattern', 59.99, 69.99, ARRAY['https://example.com/ff-dress-1.jpg', 'https://example.com/ff-dress-2.jpg'], 'https://example.com/ff-dress-thumb.jpg', ARRAY['clothing', 'dresses'], ARRAY['dress', 'summer', 'floral', 'women'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 80, ARRAY['seasonal', 'trendy'], 'FF-DRESS-001', 'seed-script')\n      ",
            ),
          ];
        case 17:
          // FashionForward products
          _a.sent();
          // HomeStyle products
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO products (id, title, description, price, \"compareAtPrice\", images, thumbnail, categories, tags, \"merchantId\", \"brandName\", \"isActive\", \"inStock\", quantity, values, \"externalId\", \"externalSource\")\n        VALUES \n          ('77777777-7777-7777-7777-777777777777', 'Modern Sectional Sofa', 'Elegant and comfortable sectional sofa for your living room', 1299.99, 1499.99, ARRAY['https://example.com/hs-sofa-1.jpg', 'https://example.com/hs-sofa-2.jpg'], 'https://example.com/hs-sofa-thumb.jpg', ARRAY['furniture', 'living room'], ARRAY['sofa', 'sectional', 'modern'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 20, ARRAY['premium', 'comfort'], 'HS-SOFA-001', 'seed-script'),\n          \n          ('88888888-8888-8888-8888-888888888888', 'Ceramic Table Lamp', 'Handcrafted ceramic table lamp with linen shade', 129.99, 149.99, ARRAY['https://example.com/hs-lamp-1.jpg', 'https://example.com/hs-lamp-2.jpg'], 'https://example.com/hs-lamp-thumb.jpg', ARRAY['home decor', 'lighting'], ARRAY['lamp', 'ceramic', 'table lamp'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 50, ARRAY['handcrafted', 'decor'], 'HS-LAMP-001', 'seed-script'),\n          \n          ('99999999-9999-9999-9999-999999999999', 'Handwoven Wool Rug', 'Beautiful handwoven wool rug with geometric pattern', 349.99, 399.99, ARRAY['https://example.com/hs-rug-1.jpg', 'https://example.com/hs-rug-2.jpg'], 'https://example.com/hs-rug-thumb.jpg', ARRAY['home decor', 'rugs'], ARRAY['rug', 'wool', 'handwoven'], '33333333-3333-3333-3333-333333333333', 'HomeStyle', true, true, 30, ARRAY['handcrafted', 'premium'], 'HS-RUG-001', 'seed-script')\n      ",
            ),
          ];
        case 18:
          // HomeStyle products
          _a.sent();
          // SportsPro products
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO products (id, title, description, price, \"compareAtPrice\", images, thumbnail, categories, tags, \"merchantId\", \"brandName\", \"isActive\", \"inStock\", quantity, values, \"externalId\", \"externalSource\")\n        VALUES \n          ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Performance Running Shoes', 'Lightweight and responsive running shoes for serious runners', 129.99, 149.99, ARRAY['https://example.com/sp-shoes-1.jpg', 'https://example.com/sp-shoes-2.jpg'], 'https://example.com/sp-shoes-thumb.jpg', ARRAY['sports', 'footwear'], ARRAY['running', 'shoes', 'performance'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 100, ARRAY['performance', 'athletic'], 'SP-SHOES-001', 'seed-script'),\n          \n          ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Waterproof Hiking Jacket', 'Durable waterproof jacket for hiking and outdoor activities', 179.99, 199.99, ARRAY['https://example.com/sp-jacket-1.jpg', 'https://example.com/sp-jacket-2.jpg'], 'https://example.com/sp-jacket-thumb.jpg', ARRAY['outdoor', 'clothing'], ARRAY['jacket', 'hiking', 'waterproof'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 75, ARRAY['outdoor', 'performance'], 'SP-JACKET-001', 'seed-script'),\n          \n          ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mountain Bike Pro', 'Professional mountain bike for trail riding and competitions', 1499.99, 1699.99, ARRAY['https://example.com/sp-bike-1.jpg', 'https://example.com/sp-bike-2.jpg'], 'https://example.com/sp-bike-thumb.jpg', ARRAY['sports', 'cycling'], ARRAY['bike', 'mountain bike', 'cycling'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 15, ARRAY['performance', 'professional'], 'SP-BIKE-001', 'seed-script')\n      ",
            ),
          ];
        case 19:
          // SportsPro products
          _a.sent();
          // Add some clothing items with "shirt" in the name for testing search
          return [
            4 /*yield*/,
            queryRunner.query(
              "\n        INSERT INTO products (id, title, description, price, \"compareAtPrice\", images, thumbnail, categories, tags, \"merchantId\", \"brandName\", \"isActive\", \"inStock\", quantity, values, \"externalId\", \"externalSource\")\n        VALUES \n          ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Classic Button-Down Shirt', 'Timeless button-down shirt for any occasion', 49.99, 59.99, ARRAY['https://example.com/ff-shirt-1.jpg', 'https://example.com/ff-shirt-2.jpg'], 'https://example.com/ff-shirt-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['shirt', 'button-down', 'classic'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 150, ARRAY['classic', 'formal'], 'FF-SHIRT-001', 'seed-script'),\n          \n          ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Casual Linen Shirt', 'Breathable linen shirt perfect for summer', 59.99, 69.99, ARRAY['https://example.com/ff-linen-1.jpg', 'https://example.com/ff-linen-2.jpg'], 'https://example.com/ff-linen-thumb.jpg', ARRAY['clothing', 'tops'], ARRAY['shirt', 'linen', 'summer'], '22222222-2222-2222-2222-222222222222', 'FashionForward', true, true, 120, ARRAY['casual', 'summer'], 'FF-SHIRT-002', 'seed-script'),\n          \n          ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Performance Athletic Shirt', 'Moisture-wicking athletic shirt for intense workouts', 39.99, 49.99, ARRAY['https://example.com/sp-athletic-1.jpg', 'https://example.com/sp-athletic-2.jpg'], 'https://example.com/sp-athletic-thumb.jpg', ARRAY['sports', 'clothing'], ARRAY['shirt', 'athletic', 'performance', 'workout'], '44444444-4444-4444-4444-444444444444', 'SportsPro', true, true, 200, ARRAY['performance', 'athletic'], 'SP-SHIRT-001', 'seed-script')\n      ",
            ),
          ];
        case 20:
          // Add some clothing items with "shirt" in the name for testing search
          _a.sent();
          // Commit transaction
          return [4 /*yield*/, queryRunner.commitTransaction()];
        case 21:
          // Commit transaction
          _a.sent();
          logger.log('Database seeding completed successfully!');
          // Try to index in Elasticsearch if available
          try {
            elasticsearchService = app.get('ElasticsearchService');
            if (elasticsearchService) {
              logger.log('Elasticsearch service found, indexing data...');
              // This would need to be implemented based on your actual Elasticsearch service
            } else {
              logger.log('Elasticsearch service not found, skipping indexing');
            }
          } catch (error) {
            logger.warn('Elasticsearch indexing skipped: '.concat(error.message));
          }
          return [3 /*break*/, 26];
        case 22:
          error_1 = _a.sent();
          // Rollback transaction on error
          return [4 /*yield*/, queryRunner.rollbackTransaction()];
        case 23:
          // Rollback transaction on error
          _a.sent();
          throw error_1;
        case 24:
          // Release query runner
          return [4 /*yield*/, queryRunner.release()];
        case 25:
          // Release query runner
          _a.sent();
          return [7 /*endfinally*/];
        case 26:
          return [3 /*break*/, 30];
        case 27:
          error_2 = _a.sent();
          logger.error('Error during seeding: '.concat(error_2.message), error_2.stack);
          return [3 /*break*/, 30];
        case 28:
          return [4 /*yield*/, app.close()];
        case 29:
          _a.sent();
          return [7 /*endfinally*/];
        case 30:
          return [2 /*return*/];
      }
    });
  });
}
bootstrap();
