"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrdersTables1715487600000 = void 0;
class CreateOrdersTables1715487600000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" varchar(100) NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING',
        "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'PENDING',
        "shippingAddress" json NOT NULL,
        "notes" text,
        "isPriority" boolean NOT NULL DEFAULT false,
        "syncStatus" "public"."orders_syncstatus_enum" NOT NULL DEFAULT 'PENDING',
        "platformActions" json DEFAULT '{"canCancel": false, "canRefund": false, "canFulfill": false}',
        "customerEmail" varchar(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "productId" varchar NOT NULL,
        "variantId" varchar,
        "quantity" integer NOT NULL DEFAULT 1,
        "price" decimal(10,2) NOT NULL,
        "options" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "order_fulfillments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "status" "public"."order_fulfillments_status_enum" NOT NULL DEFAULT 'PENDING',
        "trackingNumber" varchar,
        "trackingCompany" varchar,
        "trackingUrl" varchar,
        "notes" text,
        "externalId" varchar,
        "externalData" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_order_fulfillments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_fulfillments_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_orders_userId" ON "orders" ("userId");
      CREATE INDEX "IDX_orders_status" ON "orders" ("status");
      CREATE INDEX "IDX_orders_paymentStatus" ON "orders" ("paymentStatus");
      CREATE INDEX "IDX_orders_syncStatus" ON "orders" ("syncStatus");
      CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId");
      CREATE INDEX "IDX_order_items_productId" ON "order_items" ("productId");
      CREATE INDEX "IDX_order_fulfillments_orderId" ON "order_fulfillments" ("orderId");
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_status_enum') THEN
          CREATE TYPE "public"."orders_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_paymentstatus_enum') THEN
          CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_syncstatus_enum') THEN
          CREATE TYPE "public"."orders_syncstatus_enum" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'NOT_APPLICABLE');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_fulfillments_status_enum') THEN
          CREATE TYPE "public"."order_fulfillments_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'FAILED');
        END IF;
      END
      $$;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "order_fulfillments";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "order_items";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
        await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."order_fulfillments_status_enum";
      DROP TYPE IF EXISTS "public"."orders_syncstatus_enum";
      DROP TYPE IF EXISTS "public"."orders_paymentstatus_enum";
      DROP TYPE IF EXISTS "public"."orders_status_enum";
    `);
    }
}
exports.CreateOrdersTables1715487600000 = CreateOrdersTables1715487600000;
//# sourceMappingURL=1715487600000-CreateOrdersTables.js.map