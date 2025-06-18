# Prisma Schema Clean-up TODO

> Last updated: 2025-06-16

The Prisma schema (`backend/prisma/schema.prisma`) was generated via **`prisma db pull`** to match the existing Supabase database.  As a result it contains **all** tables that currently exist in the production DB – including many analytics / logging tables that the application does not query directly.

Before we run any future `prisma migrate dev` / `prisma db push` commands, we **should trim the schema** so that only application-owned tables remain under Prisma’s management.  Leaving unused tables in the schema can cause unintended drops or modifications when the schema diverges from reality.

## Recommended approach

1. **Identify keepers**  
   Scan the schema and list the tables we actively query or mutate in the NestJS codebase (e.g. `products`, `orders`, `order_items`, `users`, etc.).  Everything else can be ignored.

2. **Ignore legacy tables**  
   For each model we want to exclude, add the block-level directive:

   ```prisma
   @@ignore
   ```

   Example:

   ```prisma
   model query_performance_metrics {
     id            String   @id @db.Uuid
     /* …fields… */

     @@map("query_performance_metrics")
     @@ignore // <-- exclude from migrations & client
   }
   ```

3. **Optional – split into a second schema file**  
   If keeping a reference is useful, move ignored models to `schema.legacy.prisma` and remove them from the main schema.  This prevents noise in IntelliSense while preserving the definitions.

4. **Push & regenerate**  
   After pruning, run:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

   Verify that nothing is dropped by inspecting the SQL diff in the console.

## Nuances to remember

* `BusinessMetrics` is intentionally **ignored** because Supabase already contains analytics data – do **not** let Prisma attempt to recreate or drop this table.
* We’re using `relationMode = "prisma"` (not foreign-key constraints) to avoid conflicts with the existing schema.  Keep this setting unless we’re ready to add explicit FK constraints.
* The `inStock` boolean column on `products` already exists in Supabase **and** in the schema.  No migration is needed.

---

**Action item:**  Perform the clean-up before adding any new columns / tables, otherwise every `db push` will try to diff the entire Supabase schema and may produce dangerous migration SQL.

Feel free to update this file (or remove it once the schema is trimmed) as work progresses.
