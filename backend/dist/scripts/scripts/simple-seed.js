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
var app_module_1 = require('../src/app.module');
var common_1 = require('@nestjs/common');
var typeorm_1 = require('typeorm');
/**
 * A simple seed script that directly inserts data using SQL queries
 * to avoid TypeScript type issues with the entity repositories.
 */
function bootstrap() {
  return __awaiter(this, void 0, void 0, function () {
    var app,
      logger,
      connection,
      brandIds,
      brandIdMap,
      merchantIds,
      merchantIdMap,
      elasticsearchModule,
      error_1,
      error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule)];
        case 1:
          app = _a.sent();
          logger = new common_1.Logger('SimpleSeedScript');
          _a.label = 2;
        case 2:
          _a.trys.push([2, 25, 26, 28]);
          logger.log('Starting database seeding...');
          connection = (0, typeorm_1.getConnection)();
          // Disable foreign key constraints temporarily
          return [4 /*yield*/, connection.query('SET session_replication_role = replica')];
        case 3:
          // Disable foreign key constraints temporarily
          _a.sent();
          // Clear existing data
          logger.log('Clearing existing data...');
          return [4 /*yield*/, connection.query('TRUNCATE TABLE product CASCADE')];
        case 4:
          _a.sent();
          return [4 /*yield*/, connection.query('TRUNCATE TABLE merchant CASCADE')];
        case 5:
          _a.sent();
          return [4 /*yield*/, connection.query('TRUNCATE TABLE brand CASCADE')];
        case 6:
          _a.sent();
          return [4 /*yield*/, connection.query('TRUNCATE TABLE "user" CASCADE')];
        case 7:
          _a.sent();
          // Seed users
          logger.log('Seeding users...');
          return [
            4 /*yield*/,
            connection.query(
              "\n      INSERT INTO \"user\" (id, email, \"firstName\", \"lastName\", password, role, \"isEmailVerified\", interests)\n      VALUES \n        (gen_random_uuid(), 'admin@example.com', 'Admin', 'User', 'password123', 'ADMIN', true, ARRAY['fashion', 'technology', 'home decor']),\n        (gen_random_uuid(), 'merchant@example.com', 'Merchant', 'User', 'password123', 'MERCHANT', true, ARRAY['fashion', 'sports']),\n        (gen_random_uuid(), 'user@example.com', 'Regular', 'User', 'password123', 'USER', true, ARRAY['electronics', 'books', 'outdoor'])\n    ",
            ),
          ];
        case 8:
          _a.sent();
          // Seed brands
          logger.log('Seeding brands...');
          return [
            4 /*yield*/,
            connection.query(
              "\n      INSERT INTO brand (id, name, description, logo, website, \"foundedYear\", values, categories)\n      VALUES \n        (gen_random_uuid(), 'TechGear', 'High-quality tech products for everyday use', 'https://example.com/techgear-logo.png', 'https://techgear.example.com', 2010, ARRAY['innovation', 'quality', 'sustainability'], ARRAY['electronics', 'accessories']),\n        (gen_random_uuid(), 'FashionForward', 'Trendy and sustainable fashion for all', 'https://example.com/fashionforward-logo.png', 'https://fashionforward.example.com', 2015, ARRAY['sustainability', 'ethical production', 'style'], ARRAY['clothing', 'accessories']),\n        (gen_random_uuid(), 'HomeStyle', 'Beautiful home decor and furniture', 'https://example.com/homestyle-logo.png', 'https://homestyle.example.com', 2008, ARRAY['quality', 'design', 'comfort'], ARRAY['home decor', 'furniture']),\n        (gen_random_uuid(), 'SportsPro', 'Professional sports equipment and apparel', 'https://example.com/sportspro-logo.png', 'https://sportspro.example.com', 2005, ARRAY['performance', 'durability', 'innovation'], ARRAY['sports', 'fitness', 'outdoor'])\n    ",
            ),
          ];
        case 9:
          _a.sent();
          return [4 /*yield*/, connection.query('SELECT id, name FROM brand')];
        case 10:
          brandIds = _a.sent();
          brandIdMap = brandIds.reduce(function (map, brand) {
            map[brand.name] = brand.id;
            return map;
          }, {});
          // Seed merchants
          logger.log('Seeding merchants...');
          return [
            4 /*yield*/,
            connection.query(
              "\n      INSERT INTO merchant (id, name, description, logo, website, \"contactEmail\", \"contactPhone\", address, \"isVerified\", categories, values)\n      VALUES \n        (gen_random_uuid(), 'ElectroMart', 'Your one-stop shop for electronics', 'https://example.com/electromart-logo.png', 'https://electromart.example.com', 'contact@electromart.example.com', '+1234567890', '123 Tech Street, Silicon Valley, CA', true, ARRAY['electronics', 'gadgets', 'accessories'], ARRAY['customer service', 'quality', 'affordability']),\n        (gen_random_uuid(), 'Fashion Emporium', 'Trendy fashion for all seasons', 'https://example.com/fashion-emporium-logo.png', 'https://fashion-emporium.example.com', 'contact@fashion-emporium.example.com', '+1987654321', '456 Style Avenue, New York, NY', true, ARRAY['clothing', 'shoes', 'accessories'], ARRAY['style', 'sustainability', 'inclusivity']),\n        (gen_random_uuid(), 'Home & Beyond', 'Everything you need for your home', 'https://example.com/home-beyond-logo.png', 'https://home-beyond.example.com', 'contact@home-beyond.example.com', '+1122334455', '789 Decor Boulevard, Los Angeles, CA', true, ARRAY['home decor', 'furniture', 'kitchen'], ARRAY['quality', 'design', 'customer satisfaction']),\n        (gen_random_uuid(), 'Active Life Store', 'Gear up for your active lifestyle', 'https://example.com/active-life-logo.png', 'https://active-life.example.com', 'contact@active-life.example.com', '+1567891234', '321 Fitness Road, Denver, CO', true, ARRAY['sports', 'fitness', 'outdoor'], ARRAY['performance', 'health', 'adventure'])\n    ",
            ),
          ];
        case 11:
          _a.sent();
          return [4 /*yield*/, connection.query('SELECT id, name FROM merchant')];
        case 12:
          merchantIds = _a.sent();
          merchantIdMap = merchantIds.reduce(function (map, merchant) {
            map[merchant.name] = merchant.id;
            return map;
          }, {});
          // Seed products
          logger.log('Seeding products...');
          // TechGear products
          return [
            4 /*yield*/,
            connection.query(
              "\n      INSERT INTO product (id, sku, title, description, price, \"salePrice\", currency, inventory, categories, tags, images, specifications, \"brandId\", \"merchantId\", rating, \"reviewCount\", \"isActive\", \"isFeatured\")\n      VALUES \n        (gen_random_uuid(), 'TG-LAPTOP-001', 'TechGear Pro Laptop', 'Powerful laptop for professionals and gamers', 1299.99, 1199.99, 'USD', 50, ARRAY['electronics', 'computers'], ARRAY['laptop', 'gaming', 'professional'], ARRAY['https://example.com/techgear-laptop-1.jpg', 'https://example.com/techgear-laptop-2.jpg'], '{\"processor\": \"Intel Core i7\", \"memory\": \"16GB RAM\", \"storage\": \"512GB SSD\", \"display\": \"15.6-inch 4K\", \"battery\": \"8 hours\"}', $1, $2, 4.8, 120, true, true),\n        (gen_random_uuid(), 'TG-PHONE-001', 'TechGear Smartphone X', 'Next-generation smartphone with advanced features', 899.99, NULL, 'USD', 75, ARRAY['electronics', 'phones'], ARRAY['smartphone', 'android', 'camera'], ARRAY['https://example.com/techgear-phone-1.jpg', 'https://example.com/techgear-phone-2.jpg'], '{\"processor\": \"Snapdragon 8 Gen 2\", \"memory\": \"8GB RAM\", \"storage\": \"256GB\", \"display\": \"6.5-inch AMOLED\", \"camera\": \"48MP main + 12MP ultra-wide\"}', $1, $2, 4.7, 85, true, false),\n        (gen_random_uuid(), 'TG-EARBUDS-001', 'TechGear Wireless Earbuds', 'Premium wireless earbuds with noise cancellation', 149.99, 129.99, 'USD', 100, ARRAY['electronics', 'audio'], ARRAY['earbuds', 'wireless', 'noise-cancellation'], ARRAY['https://example.com/techgear-earbuds-1.jpg', 'https://example.com/techgear-earbuds-2.jpg'], '{\"batteryLife\": \"8 hours (30 with case)\", \"connectivity\": \"Bluetooth 5.2\", \"noiseReduction\": \"Active Noise Cancellation\", \"waterResistance\": \"IPX4\"}', $1, $2, 4.6, 210, true, true)\n    ",
              [brandIdMap['TechGear'], merchantIdMap['ElectroMart']],
            ),
          ];
        case 13:
          // TechGear products
          _a.sent();
          // FashionForward products
          return [
            4 /*yield*/,
            connection.query(
              '\n      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")\n      VALUES \n        (gen_random_uuid(), \'FF-TSHIRT-001\', \'Organic Cotton T-Shirt\', \'Comfortable and sustainable organic cotton t-shirt\', 29.99, NULL, \'USD\', 200, ARRAY[\'clothing\', \'tops\'], ARRAY[\'t-shirt\', \'organic\', \'sustainable\'], ARRAY[\'https://example.com/ff-tshirt-1.jpg\', \'https://example.com/ff-tshirt-2.jpg\'], \'{"material": "100% Organic Cotton", "fit": "Regular", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL"], "colors": ["Black", "White", "Navy", "Green"]}\', $1, $2, 4.5, 180, true, false),\n        (gen_random_uuid(), \'FF-JEANS-001\', \'Recycled Denim Jeans\', \'Stylish jeans made from recycled denim\', 79.99, 59.99, \'USD\', 150, ARRAY[\'clothing\', \'bottoms\'], ARRAY[\'jeans\', \'denim\', \'recycled\', \'sustainable\'], ARRAY[\'https://example.com/ff-jeans-1.jpg\', \'https://example.com/ff-jeans-2.jpg\'], \'{"material": "80% Recycled Denim, 20% Organic Cotton", "fit": "Slim", "care": "Machine wash cold, line dry", "sizes": ["28", "30", "32", "34", "36"], "colors": ["Blue", "Black", "Grey"]}\', $1, $2, 4.7, 120, true, true),\n        (gen_random_uuid(), \'FF-DRESS-001\', \'Summer Floral Dress\', \'Light and breezy summer dress with floral pattern\', 59.99, NULL, \'USD\', 80, ARRAY[\'clothing\', \'dresses\'], ARRAY[\'dress\', \'summer\', \'floral\', \'women\'], ARRAY[\'https://example.com/ff-dress-1.jpg\', \'https://example.com/ff-dress-2.jpg\'], \'{"material": "100% Sustainable Viscose", "fit": "Regular", "care": "Hand wash cold", "sizes": ["XS", "S", "M", "L", "XL"], "colors": ["Floral Print"]}\', $1, $2, 4.8, 95, true, true)\n    ',
              [brandIdMap['FashionForward'], merchantIdMap['Fashion Emporium']],
            ),
          ];
        case 14:
          // FashionForward products
          _a.sent();
          // HomeStyle products
          return [
            4 /*yield*/,
            connection.query(
              '\n      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")\n      VALUES \n        (gen_random_uuid(), \'HS-SOFA-001\', \'Modern Sectional Sofa\', \'Elegant and comfortable sectional sofa for your living room\', 1299.99, 999.99, \'USD\', 20, ARRAY[\'furniture\', \'living room\'], ARRAY[\'sofa\', \'sectional\', \'modern\'], ARRAY[\'https://example.com/hs-sofa-1.jpg\', \'https://example.com/hs-sofa-2.jpg\'], \'{"material": "Upholstered with premium fabric", "dimensions": "110\\" W x 85\\" D x 33\\" H", "assembly": "Required", "colors": ["Grey", "Beige", "Blue"]}\', $1, $2, 4.6, 45, true, true),\n        (gen_random_uuid(), \'HS-LAMP-001\', \'Ceramic Table Lamp\', \'Handcrafted ceramic table lamp with linen shade\', 129.99, NULL, \'USD\', 50, ARRAY[\'home decor\', \'lighting\'], ARRAY[\'lamp\', \'ceramic\', \'table lamp\'], ARRAY[\'https://example.com/hs-lamp-1.jpg\', \'https://example.com/hs-lamp-2.jpg\'], \'{"material": "Ceramic base with linen shade", "dimensions": "15\\" H x 10\\" W", "bulbType": "E26, max 60W", "colors": ["White", "Blue", "Green"]}\', $1, $2, 4.4, 68, true, false),\n        (gen_random_uuid(), \'HS-RUG-001\', \'Handwoven Wool Rug\', \'Beautiful handwoven wool rug with geometric pattern\', 349.99, 299.99, \'USD\', 30, ARRAY[\'home decor\', \'rugs\'], ARRAY[\'rug\', \'wool\', \'handwoven\'], ARRAY[\'https://example.com/hs-rug-1.jpg\', \'https://example.com/hs-rug-2.jpg\'], \'{"material": "100% Wool", "dimensions": "8\\\' x 10\\\'", "pile": "Medium", "colors": ["Multicolor", "Blue/Grey", "Earth Tones"]}\', $1, $2, 4.9, 37, true, true)\n    ',
              [brandIdMap['HomeStyle'], merchantIdMap['Home & Beyond']],
            ),
          ];
        case 15:
          // HomeStyle products
          _a.sent();
          // SportsPro products
          return [
            4 /*yield*/,
            connection.query(
              '\n      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")\n      VALUES \n        (gen_random_uuid(), \'SP-SHOES-001\', \'Performance Running Shoes\', \'Lightweight and responsive running shoes for serious runners\', 129.99, 99.99, \'USD\', 100, ARRAY[\'sports\', \'footwear\'], ARRAY[\'running\', \'shoes\', \'performance\'], ARRAY[\'https://example.com/sp-shoes-1.jpg\', \'https://example.com/sp-shoes-2.jpg\'], \'{"material": "Breathable mesh upper, rubber sole", "weight": "8.5 oz", "drop": "8mm", "sizes": ["7", "8", "9", "10", "11", "12"], "colors": ["Black/Red", "Blue/White", "Grey/Yellow"]}\', $1, $2, 4.7, 156, true, true),\n        (gen_random_uuid(), \'SP-JACKET-001\', \'Waterproof Hiking Jacket\', \'Durable waterproof jacket for hiking and outdoor activities\', 179.99, NULL, \'USD\', 75, ARRAY[\'outdoor\', \'clothing\'], ARRAY[\'jacket\', \'hiking\', \'waterproof\'], ARRAY[\'https://example.com/sp-jacket-1.jpg\', \'https://example.com/sp-jacket-2.jpg\'], \'{"material": "3-layer waterproof fabric", "waterproofRating": "20,000mm", "breathability": "15,000g/m\u00B2/24h", "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Red", "Green", "Black"]}\', $1, $2, 4.8, 92, true, false),\n        (gen_random_uuid(), \'SP-BIKE-001\', \'Mountain Bike Pro\', \'Professional mountain bike for trail riding and competitions\', 1499.99, 1299.99, \'USD\', 15, ARRAY[\'sports\', \'cycling\'], ARRAY[\'bike\', \'mountain bike\', \'cycling\'], ARRAY[\'https://example.com/sp-bike-1.jpg\', \'https://example.com/sp-bike-2.jpg\'], \'{"frame": "Aluminum alloy", "suspension": "Front and rear suspension", "gears": "21-speed Shimano", "brakes": "Hydraulic disc brakes", "wheelSize": "29 inch"}\', $1, $2, 4.9, 28, true, true)\n    ',
              [brandIdMap['SportsPro'], merchantIdMap['Active Life Store']],
            ),
          ];
        case 16:
          // SportsPro products
          _a.sent();
          // Add some clothing items with "shirt" in the name for testing search
          return [
            4 /*yield*/,
            connection.query(
              '\n      INSERT INTO product (id, sku, title, description, price, "salePrice", currency, inventory, categories, tags, images, specifications, "brandId", "merchantId", rating, "reviewCount", "isActive", "isFeatured")\n      VALUES \n        (gen_random_uuid(), \'FF-SHIRT-001\', \'Classic Button-Down Shirt\', \'Timeless button-down shirt for any occasion\', 49.99, NULL, \'USD\', 150, ARRAY[\'clothing\', \'tops\'], ARRAY[\'shirt\', \'button-down\', \'classic\'], ARRAY[\'https://example.com/ff-shirt-1.jpg\', \'https://example.com/ff-shirt-2.jpg\'], \'{"material": "100% Cotton", "fit": "Regular", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Blue", "Black"]}\', $1, $2, 4.6, 210, true, true),\n        (gen_random_uuid(), \'FF-SHIRT-002\', \'Casual Linen Shirt\', \'Breathable linen shirt perfect for summer\', 59.99, 44.99, \'USD\', 120, ARRAY[\'clothing\', \'tops\'], ARRAY[\'shirt\', \'linen\', \'summer\'], ARRAY[\'https://example.com/ff-linen-1.jpg\', \'https://example.com/ff-linen-2.jpg\'], \'{"material": "100% Linen", "fit": "Relaxed", "care": "Machine wash cold, tumble dry low", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Beige", "Light Blue"]}\', $1, $2, 4.7, 180, true, false),\n        (gen_random_uuid(), \'SP-SHIRT-001\', \'Performance Athletic Shirt\', \'Moisture-wicking athletic shirt for intense workouts\', 39.99, NULL, \'USD\', 200, ARRAY[\'sports\', \'clothing\'], ARRAY[\'shirt\', \'athletic\', \'performance\', \'workout\'], ARRAY[\'https://example.com/sp-athletic-1.jpg\', \'https://example.com/sp-athletic-2.jpg\'], \'{"material": "88% Polyester, 12% Elastane", "fit": "Athletic", "care": "Machine wash cold", "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Black", "Blue", "Red", "Grey"]}\', $3, $4, 4.8, 250, true, true)\n    ',
              [
                brandIdMap['FashionForward'],
                merchantIdMap['Fashion Emporium'],
                brandIdMap['SportsPro'],
                merchantIdMap['Active Life Store'],
              ],
            ),
          ];
        case 17:
          // Add some clothing items with "shirt" in the name for testing search
          _a.sent();
          // Re-enable foreign key constraints
          return [4 /*yield*/, connection.query('SET session_replication_role = DEFAULT')];
        case 18:
          // Re-enable foreign key constraints
          _a.sent();
          // Index data in Elasticsearch (if available)
          logger.log('Attempting to index data in Elasticsearch...');
          _a.label = 19;
        case 19:
          _a.trys.push([19, 23, , 24]);
          elasticsearchModule = app.get('ElasticsearchModule');
          if (!elasticsearchModule) return [3 /*break*/, 21];
          logger.log('Elasticsearch module found, indexing data...');
          // This is a simplified approach - in a real application, you would need to
          // properly call the indexing methods of the ElasticsearchIndexingService
          return [4 /*yield*/, connection.query('SELECT elasticsearch_index_all()')];
        case 20:
          // This is a simplified approach - in a real application, you would need to
          // properly call the indexing methods of the ElasticsearchIndexingService
          _a.sent();
          logger.log('Elasticsearch indexing complete');
          return [3 /*break*/, 22];
        case 21:
          logger.log('Elasticsearch module not found, skipping indexing');
          _a.label = 22;
        case 22:
          return [3 /*break*/, 24];
        case 23:
          error_1 = _a.sent();
          logger.warn('Elasticsearch indexing skipped: '.concat(error_1.message));
          return [3 /*break*/, 24];
        case 24:
          logger.log('Database seeding completed successfully!');
          return [3 /*break*/, 28];
        case 25:
          error_2 = _a.sent();
          logger.error('Error during seeding: '.concat(error_2.message), error_2.stack);
          return [3 /*break*/, 28];
        case 26:
          return [4 /*yield*/, app.close()];
        case 27:
          _a.sent();
          return [7 /*endfinally*/];
        case 28:
          return [2 /*return*/];
      }
    });
  });
}
bootstrap();
